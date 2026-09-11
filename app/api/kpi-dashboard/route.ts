import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter, parseJSON } from "@/lib/gemini";
import type { KPIDashboardAIResponse } from "@/types/kpi-dashboard";

const KPI_DASHBOARD_PROMPT = `You are an expert Business Intelligence analyst specializing in KPI dashboard design. Given a database schema and sample data, generate a comprehensive set of KPIs suitable for a trading-platform-style analytics dashboard.

Return ONLY a valid JSON object (no markdown fences, no explanation) with this exact shape:

{
  "dashboardTitle": "<concise title describing the dataset, e.g. 'Sales Performance Dashboard'>",
  "kpis": [
    {
      "label": "<short metric name, max 25 chars>",
      "sql": "<SQL to compute a single-value KPI>",
      "description": "<1 sentence explaining what this KPI measures>",
      "category": "revenue" | "growth" | "distribution" | "volume" | "efficiency" | "comparison" | "ranking" | "temporal",
      "format": "number" | "currency" | "percentage" | "decimal" | "text",
      "trendSQL": "<optional SQL returning a single comparison value for trend calculation>",
      "icon": "<optional lucide icon name like 'dollar-sign', 'trending-up', 'users', 'package', 'percent'>"
    }
  ],
  "miniCharts": [
    {
      "label": "<chart title>",
      "sql": "<SQL returning multiple rows for a sparkline/mini chart>",
      "chartType": "sparkline" | "minibar" | "donut",
      "xKey": "<column for x axis>",
      "yKey": "<column for y axis/value>"
    }
  ],
  "error": null
}

RULES:
1. Generate exactly 8-12 KPIs covering diverse categories. Aim for: 2-3 volume/count KPIs, 2-3 aggregate KPIs (sums, averages), 2-3 comparison/ranking KPIs, 1-2 distribution KPIs, 1-2 efficiency/ratio KPIs.
2. Each KPI "sql" MUST return exactly ONE row with ONE value. Use SELECT with aggregate functions.
3. For "trendSQL": provide a comparison value when possible. Examples: overall average (to compare a max against), previous period total, median value. The trendSQL must also return one row with one value.
4. Generate 2-4 miniCharts. Sparklines should return 5-15 data points. Minibars should return 3-8 categories. Donuts should return 3-6 segments.
5. Use the correct table name from the schema (e.g., "data", "data_1", "data_2").
6. NEVER invent column names. Only use columns from the schema.
7. Use readable aliases with AS for computed columns.
8. For currency format: use this when the column clearly represents money (revenue, sales, price, cost, etc.).
9. For percentage format: use this for ratios and proportional metrics.
10. ORDER BY and LIMIT appropriately in miniChart SQL queries.
11. Choose categories that best describe each KPI's analytical purpose.
12. Make KPIs analytically interesting -- not just simple counts. Include ratios, averages, max/min comparisons, concentration metrics, etc.
13. If multiple tables exist, distribute KPIs across all tables.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { schema, sampleRows, rowCount, columns } = body;

    if (!schema) {
      return NextResponse.json({ error: "Missing schema" }, { status: 400 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured." },
        { status: 500 }
      );
    }

    const userPrompt = `DATABASE SCHEMA:\n${schema}\n\nSAMPLE DATA:\n${sampleRows || "N/A"}\n\nDATASET INFO:\n- Total rows: ${rowCount || "unknown"}\n- Columns: ${(columns || []).join(", ")}\n\nGenerate the KPI dashboard JSON. No markdown, no code fences.`;

    const text = await callOpenRouter(KPI_DASHBOARD_PROMPT, userPrompt);
    const parsed = parseJSON<KPIDashboardAIResponse>(text);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("KPI Dashboard API error:", error);
    return NextResponse.json(
      { error: `Server error: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
