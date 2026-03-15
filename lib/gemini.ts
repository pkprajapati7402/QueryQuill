import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
  "insight": "<1-3 sentence plain English insight summarizing what the data shows>",
  "error": null
}

RULES:
1. Choose chart types wisely based on the data:
   - Time-series or trends → "line"
   - Comparisons across categories → "bar"
   - Parts of a whole / proportions → "pie"
   - Volume or cumulative data → "area"
2. You may return MULTIPLE charts if the question has multiple dimensions.
3. The SQL must be valid. The table is always named "data". Use standard SQL functions.
4. For aggregations, always use GROUP BY and appropriate aggregate functions (SUM, AVG, COUNT, etc.).
5. ORDER BY for meaningful sorting (e.g., chronological for dates, descending for rankings).
6. LIMIT results to at most 50 rows for chart readability unless the user asks for more.
7. If the question CANNOT be answered from the available columns, set "error" to a helpful message explaining what data is missing, and leave "sql" as empty string and "charts" as empty array.
8. NEVER invent or hallucinate column names. Only use columns that exist in the schema.
9. NEVER fabricate data or numbers.
10. For the y_key, if comparing multiple metrics, use an array of column names.
11. Use aliases (AS) to give readable names to computed columns.
12. Use different colors for different charts. Pick from: #6366f1, #8b5cf6, #ec4899, #f43f5e, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6.
13. For DESCRIPTIVE or META questions (e.g. "what is this dataset about?", "describe the data", "what columns are available?", "summarize the dataset"), do NOT generate SQL. Instead return an empty "sql" string, empty "charts" array, and put your descriptive answer in the "insight" field. You can describe the dataset based on the schema and sample data provided.`;

export async function queryGemini(
  question: string,
  schema: string,
  sampleRows: string,
  conversationHistory?: { role: string; text: string }[]
): Promise<GeminiResponse> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  let contextMessages = "";
  if (conversationHistory && conversationHistory.length > 0) {
    contextMessages =
      "\n\nPrevious conversation:\n" +
      conversationHistory
        .slice(-6)
        .map((m) => `${m.role}: ${m.text}`)
        .join("\n");
  }

  const prompt = `${SYSTEM_PROMPT}

DATABASE SCHEMA:
${schema}

SAMPLE DATA (first 5 rows):
${sampleRows}
${contextMessages}

USER QUESTION: "${question}"

Return ONLY the JSON object. No markdown, no code fences, no explanation.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Strip markdown code fences if present
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed: GeminiResponse = JSON.parse(cleaned);
    return parsed;
  } catch {
    return {
      sql: "",
      charts: [],
      insight: "",
      error: `Failed to parse AI response. Raw output: ${text.substring(0, 200)}`,
    };
  }
}
