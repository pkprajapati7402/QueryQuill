import { NextRequest, NextResponse } from "next/server";
import { queryStrategy } from "@/lib/openrouter";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, schema, sampleRows, dataContext, conversationHistory } = body;

    if (!question || !schema) {
      return NextResponse.json(
        { error: "Missing question or schema" },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured. Add OPENROUTER_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    const result = await queryStrategy(
      question,
      schema,
      sampleRows || "",
      dataContext || undefined,
      conversationHistory || []
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Strategy API error:", error);
    return NextResponse.json(
      { error: `Server error: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
