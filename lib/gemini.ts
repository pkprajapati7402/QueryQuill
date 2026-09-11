// AI layer — uses OpenRouter free models (same interface names kept for compatibility)

export interface ChartConfig {
  type: "bar" | "line" | "pie" | "area";
  title: string;
  x_key: string;
  y_key: string | string[];
  color?: string;
  colors?: string[];
}

export interface GeminiResponse {
  sql: string;
  charts: ChartConfig[];
  insight: string;
  error: string | null;
}

export interface KPIConfig {
  label: string;
  sql: string;
  description: string;
}

export interface AutoChartResult {
  sql: string;
  chart: ChartConfig;
  insight: string;
}

export interface AutoDashboardResponse {
  summary: string;
  kpis: KPIConfig[];
  charts: AutoChartResult[];
  suggestedQuestions: string[];
  error: string | null;
}

// Ordered fallback list of free models
const MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "google/gemma-3-27b-it:free",
  "google/gemma-3-12b-it:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen3-4b:free",
];

export async function callOpenRouter(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured");

  // Merge system prompt into user message for universal model compatibility
  // (some models like Gemma reject the "system" role)
  const combinedPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;
  const messages = [{ role: "user" as const, content: combinedPrompt }];

  for (const model of MODELS) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Title": "QueryQuill",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.4,
          max_tokens: 4096,
        }),
      });

      const data = await res.json();

      // Provider-level errors (429, 504, etc.) — try next model
      if (data.error) {
        console.log(`[OpenRouter] ${model} error:`, data.error.message || data.error.code);
        continue;
      }

      const content = data.choices?.[0]?.message?.content || "";
      if (!content) {
        console.log(`[OpenRouter] ${model} returned empty content`);
        continue;
      }

      console.log(`[OpenRouter] Success with ${model}`);
      return content;
    } catch (err) {
      console.log(`[OpenRouter] ${model} fetch failed:`, (err as Error).message);
      continue;
    }
  }

  throw new Error("All AI models are temporarily unavailable. Please try again in a moment.");
}

export function parseJSON<T>(text: string): T {
  // Strip markdown code fences if present
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // Extract JSON object from response
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON found in response: ${text.substring(0, 200)}`);

  return JSON.parse(jsonMatch[0]);
}

const SYSTEM_PROMPT = `You are a Business Intelligence AI assistant. Given a database schema, sample data, and a user's natural language question, you must return ONLY a valid JSON object (no markdown fences, no explanation, no extra text) with this exact shape:

{
  "sql": "<valid SQL query using standard SQL syntax>",
  "charts": [
    {
      "type": "bar" | "line" | "pie" | "area",
      "title": "<descriptive chart title>",
      "x_key": "<column name for X axis or label>",
      "y_key": "<column name for Y axis or value — can be a string or array of strings for multi-series>",
      "color": "<hex color like #6366f1>"
    }
  ],
  "insight": "<A detailed analytical insight of 3-5 sentences. Include: the key finding with specific numbers, a comparison or context (e.g., percentages, averages), and a trend or pattern observation. Example: 'March had the highest sales at $125K, which was 23% above the average monthly sales of $101K. Sales have been growing steadily since January.'>",
  "error": null
}

RULES:
1. Choose chart types wisely based on the data:
   - Time-series or trends → "line"
   - Comparisons across categories → "bar"
   - Parts of a whole / proportions → "pie"
   - Volume or cumulative data → "area"
2. You may return MULTIPLE charts if the question has multiple dimensions.
3. The SQL must be valid. The table name is specified in the schema (e.g. "data", "data_1", "data_2"). Use the correct table name in FROM. If multiple tables exist, choose the one most relevant to the question.
4. For aggregations, always use GROUP BY and appropriate aggregate functions (SUM, AVG, COUNT, etc.).
5. ORDER BY for meaningful sorting (e.g., chronological for dates, descending for rankings).
6. LIMIT results to at most 50 rows for chart readability unless the user asks for more.
7. If the question CANNOT be answered from the available columns, set "error" to a helpful message explaining what data is missing, and leave "sql" as empty string and "charts" as empty array.
8. NEVER invent or hallucinate column names. Only use columns that exist in the schema.
9. NEVER fabricate data or numbers.
10. For the y_key, if comparing multiple metrics, use an array of column names.
11. Use aliases (AS) to give readable names to computed columns.
12. Use different colors for different charts. Pick from: #6366f1, #8b5cf6, #ec4899, #f43f5e, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6.
13. For DESCRIPTIVE or META questions (e.g. "what is this dataset about?", "describe the data", "what columns are available?", "summarize the dataset"), do NOT generate SQL. Instead return an empty "sql" string, empty "charts" array, and put your descriptive answer in the "insight" field. You can describe the dataset based on the schema and sample data provided.
14. Insights must be SPECIFIC and DATA-DRIVEN. Never write vague insights like "the data shows interesting trends." Always include actual numbers, percentages, rankings, and comparisons. Calculate percentage differences, identify the highest/lowest values, and note any outliers.`;

export async function queryGemini(
  question: string,
  schema: string,
  sampleRows: string,
  conversationHistory?: { role: string; text: string }[]
): Promise<GeminiResponse> {
  let contextMessages = "";
  if (conversationHistory && conversationHistory.length > 0) {
    contextMessages =
      "\n\nPrevious conversation:\n" +
      conversationHistory
        .slice(-6)
        .map((m) => `${m.role}: ${m.text}`)
        .join("\n");
  }

  const userPrompt = `DATABASE SCHEMA:
${schema}

SAMPLE DATA (first 5 rows):
${sampleRows}
${contextMessages}

USER QUESTION: "${question}"

Return ONLY the JSON object. No markdown, no code fences, no explanation.`;

  try {
    const text = await callOpenRouter(SYSTEM_PROMPT, userPrompt);
    const parsed = parseJSON<GeminiResponse>(text);
    return parsed;
  } catch (err) {
    return {
      sql: "",
      charts: [],
      insight: "",
      error: (err as Error).message,
    };
  }
}

const ANALYZE_PROMPT = `You are an expert Business Intelligence analyst. Given a database schema and sample data, automatically identify the most interesting and insightful analyses to perform.

Return ONLY a valid JSON object (no markdown fences, no explanation) with this exact shape:

{
  "summary": "<2-3 sentence overview of what this dataset contains and its key characteristics>",
  "kpis": [
    {
      "label": "<short metric name, e.g. 'Total Records'>",
      "sql": "<SQL to compute this single-value KPI from the data table>",
      "description": "<what this metric tells us>"
    }
  ],
  "charts": [
    {
      "sql": "<valid SQL query>",
      "chart": {
        "type": "bar" | "line" | "pie" | "area",
        "title": "<descriptive chart title>",
        "x_key": "<column for X axis>",
        "y_key": "<column(s) for Y axis — string or array of strings>",
        "color": "<hex color>"
      },
      "insight": "<2-4 sentence detailed insight explaining what this chart reveals, including specific numbers, percentages, comparisons, and trends. Example: 'The Technology category dominates with 45% of total views (1.08M), which is 2.3x higher than the second-place Entertainment category (470K views).'>"
    }
  ],
  "suggestedQuestions": [
    "<natural language question a user might ask about this dataset>"
  ],
  "error": null
}

RULES:
1. Generate a maximum of 4 charts that tell a compelling data story. If multiple tables exist, distribute charts across tables to cover each dataset.
2. Choose diverse chart types — do not repeat the same type more than twice.
3. Prioritize analyses that reveal: distribution of categorical data (pie), top/bottom rankings (bar), relationships between numerical columns (bar or area), proportions (pie), and trends over time if date columns exist (line).
4. Generate 3-4 KPIs that summarize the dataset(s) at a glance. Each KPI SQL must return a single row with a single value.
5. Each insight MUST include specific numbers and comparisons, not vague statements.
6. The table name is specified in the schema (e.g. "data", "data_1", "data_2"). Use the correct table name in each SQL FROM clause. If multiple tables exist, generate SQL for each relevant table.
7. LIMIT results appropriately for readability (top 5-10 for bar/pie, all for line/area trends).
8. Use different colors for different charts from: #6366f1, #8b5cf6, #ec4899, #f43f5e, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6.
9. ORDER BY for meaningful sorting.
10. Use readable aliases with AS.
11. NEVER invent column names. Only use columns from the schema.
12. For aggregations, always use GROUP BY and appropriate aggregate functions.
13. Generate exactly 5 suggestedQuestions — natural language questions a user could ask about this specific dataset. Make them diverse: include aggregations, comparisons, distributions, rankings, and filtering. Reference actual column names and plausible values from the sample data. Example: "What are the top 10 products by revenue?" or "Show the distribution of orders by status as a pie chart".`;

export async function analyzeDataset(
  schema: string,
  sampleRows: string,
  rowCount: number,
  columns: string[]
): Promise<AutoDashboardResponse> {
  const userPrompt = `DATABASE SCHEMA:
${schema}

SAMPLE DATA:
${sampleRows}

DATASET INFO:
- Total rows: ${rowCount}
- Columns: ${columns.join(", ")}

Analyze the dataset(s) and return the JSON object. No markdown, no code fences, no explanation.`;

  try {
    const text = await callOpenRouter(ANALYZE_PROMPT, userPrompt);
    const parsed = parseJSON<AutoDashboardResponse>(text);
    return parsed;
  } catch (err) {
    return {
      summary: "",
      kpis: [],
      charts: [],
      suggestedQuestions: [],
      error: (err as Error).message,
    };
  }
}
