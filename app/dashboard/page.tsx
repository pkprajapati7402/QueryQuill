"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  ArrowLeft,
  Lightbulb,
  Database,
  MessageSquareText,
  Trash2,
  Code2,
} from "lucide-react";
import FileUpload from "@/components/FileUpload";
import ChatInput from "@/components/ChatInput";
import ChartRenderer from "@/components/ChartRenderer";
import { executeSQL } from "@/lib/csv-engine";
import type { ChartConfig } from "@/lib/gemini";

interface DataState {
  rows: Record<string, string | number>[];
  schema: string;
  sample: string;
  fileName: string;
  rowCount: number;
  columns: string[];
}

interface QueryResult {
  question: string;
  charts: ChartConfig[];
  chartData: Record<string, string | number>[][];
  insight: string;
  sql: string;
  error: string | null;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

const EXAMPLE_QUERIES = [
  "Show me total views by content category, sorted highest to lowest",
  "What is the average sentiment score by region?",
  "Compare average likes and comments across the top 5 categories by views",
  "Which languages produce the most content? Show as a pie chart",
  "Show the distribution of ads enabled vs disabled across categories",
];

export default function DashboardPage() {
  const [data, setData] = useState<DataState | null>(null);
  const [results, setResults] = useState<QueryResult[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [showSQL, setShowSQL] = useState<number | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (results.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [results]);

  const handleDataLoaded = useCallback((loadedData: DataState) => {
    setData(loadedData);
    setResults([]);
    setChatHistory([]);
  }, []);

  const handleQuery = useCallback(
    async (question: string) => {
      if (!data) return;

      setIsQuerying(true);

      const newHistory: ChatMessage[] = [
        ...chatHistory,
        { role: "user", text: question },
      ];

      try {
        const res = await fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            schema: data.schema,
            sampleRows: data.sample,
            conversationHistory: chatHistory.slice(-6),
          }),
        });

        const geminiResult = await res.json();

        if (geminiResult.error) {
          setResults((prev) => [
            ...prev,
            {
              question,
              charts: [],
              chartData: [],
              insight: "",
              sql: "",
              error: geminiResult.error,
            },
          ]);
          newHistory.push({
            role: "assistant",
            text: `Error: ${geminiResult.error}`,
          });
          setChatHistory(newHistory);
          return;
        }

        // If no SQL (descriptive/meta question), show insight only
        if (!geminiResult.sql) {
          const result: QueryResult = {
            question,
            charts: [],
            chartData: [],
            insight: geminiResult.insight || "No insight available.",
            sql: "",
            error: null,
          };
          setResults((prev) => [...prev, result]);
          newHistory.push({
            role: "assistant",
            text: geminiResult.insight || "Answered.",
          });
          setChatHistory(newHistory);
          return;
        }

        // Execute the SQL query on the client-side data
        let queryData: Record<string, string | number>[] = [];
        let sqlError: string | null = null;

        try {
          queryData = executeSQL(geminiResult.sql, data.rows);
        } catch (err) {
          sqlError = `SQL execution failed: ${(err as Error).message}`;
        }

        // If we have multiple charts, try to provide the same data for all
        // In a more advanced setup, each chart could have its own SQL
        const chartData = geminiResult.charts.map(() => queryData);

        const result: QueryResult = {
          question,
          charts: geminiResult.charts,
          chartData,
          insight: geminiResult.insight,
          sql: geminiResult.sql,
          error: sqlError,
        };

        setResults((prev) => [...prev, result]);
        newHistory.push({
          role: "assistant",
          text: geminiResult.insight || "Dashboard generated.",
        });
        setChatHistory(newHistory);
      } catch (err) {
        setResults((prev) => [
          ...prev,
          {
            question,
            charts: [],
            chartData: [],
            insight: "",
            sql: "",
            error: `Request failed: ${(err as Error).message}`,
          },
        ]);
      } finally {
        setIsQuerying(false);
      }
    },
    [data, chatHistory]
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setChatHistory([]);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="font-semibold">Dashboard</span>
            </div>
          </div>
          {data && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs">
                <Database className="h-3 w-3 text-primary" />
                <span className="font-medium">{data.fileName}</span>
                <span className="text-muted-foreground">
                  ({data.rowCount.toLocaleString()} rows)
                </span>
              </div>
              {results.length > 0 && (
                <button
                  onClick={clearResults}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs transition-all hover:bg-muted"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-6">
        {/* Data Upload Section */}
        {!data ? (
          <div className="mx-auto w-full max-w-xl pt-12">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-2xl font-bold">Load Your Data</h1>
              <p className="text-muted-foreground">
                Upload a CSV file or use our sample dataset to get started.
              </p>
            </div>
            <FileUpload onDataLoaded={handleDataLoaded} currentFile={null} />
          </div>
        ) : (
          <>
            {/* Schema Info */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Database className="h-3.5 w-3.5" />
                Available Columns
              </div>
              <div className="flex flex-wrap gap-2">
                {data.columns.map((col) => (
                  <span
                    key={col}
                    className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>

            {/* Example Queries */}
            {results.length === 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  Try asking...
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {EXAMPLE_QUERIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleQuery(q)}
                      disabled={isQuerying}
                      className="rounded-lg border border-gray-200 bg-white p-3 text-left text-xs transition-all hover:border-primary/50 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <MessageSquareText className="mb-1.5 h-3.5 w-3.5 text-primary" />
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            <div ref={resultsRef} className="flex flex-col gap-6">
              {results.map((result, idx) => (
                <div key={idx} className="flex flex-col gap-4">
                  {/* Question */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <MessageSquareText className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <p className="pt-1 text-sm font-medium">{result.question}</p>
                  </div>

                  {/* Error */}
                  {result.error && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                      {result.error}
                    </div>
                  )}

                  {/* Charts */}
                  {result.charts.length > 0 && !result.error && (
                    <div
                      className={`grid gap-4 ${
                        result.charts.length === 1
                          ? "grid-cols-1"
                          : "grid-cols-1 lg:grid-cols-2"
                      }`}
                    >
                      {result.charts.map((chart, chartIdx) => (
                        <ChartRenderer
                          key={chartIdx}
                          config={chart}
                          data={result.chartData[chartIdx] || []}
                        />
                      ))}
                    </div>
                  )}

                  {/* Insight */}
                  {result.insight && !result.error && (
                    <div className="flex items-start gap-3 rounded-xl border border-border bg-primary/5 p-4">
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <p className="text-sm leading-relaxed">
                        {result.insight}
                      </p>
                    </div>
                  )}

                  {/* SQL Toggle */}
                  {result.sql && (
                    <div>
                      <button
                        onClick={() =>
                          setShowSQL(showSQL === idx ? null : idx)
                        }
                        className="flex items-center gap-1.5 text-xs text-gray-500 transition-colors hover:text-gray-900"
                      >
                        <Code2 className="h-3 w-3" />
                        {showSQL === idx ? "Hide" : "Show"} generated SQL
                      </button>
                      {showSQL === idx && (
                        <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-4 font-mono text-xs">
                          {result.sql}
                        </pre>
                      )}
                    </div>
                  )}

                  {/* Divider */}
                  {idx < results.length - 1 && (
                    <div className="border-t border-border" />
                  )}
                </div>
              ))}
            </div>

            {/* Loading State */}
            {isQuerying && (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-6">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <div>
                  <p className="text-sm font-medium">
                    Analyzing your question...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Generating SQL, selecting chart types, and building your
                    dashboard
                  </p>
                </div>
              </div>
            )}

            {/* Chat Input — pinned to bottom */}
            <div className="sticky bottom-4 mt-auto">
              <ChatInput
                onSend={handleQuery}
                disabled={isQuerying}
                placeholder={
                  results.length > 0
                    ? "Ask a follow-up question or refine the dashboard..."
                    : "Ask a question about your data..."
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
