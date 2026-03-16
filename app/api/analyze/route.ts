import { NextRequest, NextResponse } from "next/server";
import { analyzeDataset } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { schema, sampleRows, rowCount, columns } = body;

    if (!schema) {
      return NextResponse.json(
        { error: "Missing schema" },
        { status: 400 }
      );
    }

    if (
      !process.env.GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY === "your_gemini_api_key_here"
    ) {
      return NextResponse.json(
        { error: "Gemini API key not configured. Add your key to .env.local" },
        { status: 500 }
      );
    }

    const result = await analyzeDataset(
      schema,
      sampleRows || "",
      rowCount || 0,
      columns || []
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: `Server error: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
