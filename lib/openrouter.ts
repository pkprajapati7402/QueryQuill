export interface StrategyResponse {
  strategy: string;
  keyRecommendations: string[];
  riskFactors?: string[];
  error: string | null;
}

const STRATEGY_PROMPT = `You are a Business Strategy AI advisor integrated into a data analytics platform called QueryQuill. Users upload CSV datasets and ask strategic questions about their business.

Given a database schema, sample data, and optionally aggregated query results, provide actionable strategic advice grounded in the ACTUAL data.

Return ONLY a valid JSON object with this exact shape (no markdown fences, no extra text):
{
  "strategy": "<detailed strategic analysis in 2-4 paragraphs>",
  "keyRecommendations": ["<specific action 1>", "<specific action 2>", "<specific action 3>"],
  "riskFactors": ["<risk 1>", "<risk 2>"],
  "error": null
}

RULES:
1. Ground your advice in the ACTUAL DATA provided. Reference specific column names, patterns, and values you can see in the sample data.
2. Provide specific, actionable recommendations — not generic business advice. Each recommendation should be concrete enough to act on immediately.
3. Each recommendation MUST reference data from the dataset when possible (e.g., "Focus on Category X which shows the highest growth at Y%").
4. Identify 2-3 risk factors or considerations based on what the data reveals.
5. Use **bold** for emphasis in the strategy field.
6. If there is aggregated data context provided, use those actual computed results to support your analysis.
7. Keep keyRecommendations to 3-5 items.
8. If data context is insufficient for a specific recommendation, state that clearly rather than guessing.
9. Never hallucinate numbers — only reference values visible in the provided data.`;

// Ordered list of free models to try — falls through on rate-limit or error
const MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "google/gemma-3-27b-it:free",
  "google/gemma-3-12b-it:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen3-4b:free",
];

export async function queryStrategy(
  question: string,
  schema: string,
  sampleRows: string,
  dataContext?: string,
  conversationHistory?: { role: string; text: string }[]
): Promise<StrategyResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return {
      strategy: "",
      keyRecommendations: [],
      error: "OpenRouter API key not configured. Add OPENROUTER_API_KEY to .env.local",
    };
  }

  let userPrompt = `Database Schema:\n${schema}\n\nSample Data (first 5 rows):\n${sampleRows}`;

  if (dataContext) {
    userPrompt += `\n\nAggregated Data Results:\n${dataContext}`;
  }

  if (conversationHistory && conversationHistory.length > 0) {
    const historyText = conversationHistory
      .slice(-6)
      .map((m) => `${m.role}: ${m.text}`)
      .join("\n");
    userPrompt += `\n\nPrevious conversation:\n${historyText}`;
  }

  userPrompt += `\n\nUser question: ${question}`;

  // Merge system prompt into user message for universal model compatibility
  const combinedPrompt = `${STRATEGY_PROMPT}\n\n---\n\n${userPrompt}`;
  const messages = [
    { role: "user" as const, content: combinedPrompt },
  ];

  // Try each model in order until one succeeds
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
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      const data = await res.json();

      // Provider-level errors (429, 504, etc.) — try next model
      if (data.error) {
        continue;
      }

      const content = data.choices?.[0]?.message?.content || "";
      if (!content) {
        continue; // Empty response, try next model
      }

      // Strip markdown code fences if present
      const cleaned = content
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      // Try to extract JSON from the response
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // If no JSON found, treat the whole response as strategy text
        return {
          strategy: content.trim(),
          keyRecommendations: [],
          riskFactors: [],
          error: null,
        };
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        strategy: parsed.strategy || content.trim(),
        keyRecommendations: Array.isArray(parsed.keyRecommendations)
          ? parsed.keyRecommendations
          : [],
        riskFactors: Array.isArray(parsed.riskFactors)
          ? parsed.riskFactors
          : [],
        error: parsed.error || null,
      };
    } catch {
      continue; // Try next model
    }
  }

  // All models failed
  return {
    strategy: "",
    keyRecommendations: [],
    error: "All strategy models are temporarily unavailable. Please try again in a moment.",
  };
}
