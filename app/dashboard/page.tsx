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
  Sparkles,
  FileSpreadsheet,
  Layers,
} from "lucide-react";
import FileUpload from "@/components/FileUpload";
import ChatInput from "@/components/ChatInput";
import ChartRenderer from "@/components/ChartRenderer";
import { executeSQL } from "@/lib/csv-engine";
import type { ChartConfig } from "@/lib/gemini";

/* ── Types ────────────────────────────────────────────────────────────── */

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

interface AutoDashboard {
  summary: string;
  kpis: { label: string; value: string | number; description: string }[];
  charts: { config: ChartConfig; data: Record<string, string | number>[]; insight: string }[];
}

/* ── Constants ────────────────────────────────────────────────────────── */

const KPI_ACCENTS = ["kpi-accent-indigo", "kpi-accent-violet", "kpi-accent-pink", "kpi-accent-cyan"];

const EXAMPLE_QUERIES = [
  "Show me total views by content category, sorted highest to lowest",
  "What is the average sentiment score by region?",
  "Compare average likes and comments across the top 5 categories by views",
  "Which languages produce the most content? Show as a pie chart",
  "Show the distribution of ads enabled vs disabled across categories",
];

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const [data, setData] = useState<DataState | null>(null);
  const [results, setResults] = useState<QueryResult[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [showSQL, setShowSQL] = useState<number | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Auto-dashboard state
  const [autoDashboard, setAutoDashboard] = useState<AutoDashboard | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);

  useEffect(() => {
    if (results.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [results]);

  /* ── Auto-analysis trigger ──────────────────────────────────────────── */

  const runAutoAnalysis = useCallback(async (loadedData: DataState) => {
    setIsAnalyzing(true);
    setAnalyzeProgress(15);

    try {
      setAnalyzeProgress(30);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schema: loadedData.schema,
          sampleRows: loadedData.sample,
          rowCount: loadedData.rowCount,
          columns: loadedData.columns,
        }),
      });

      const analysisResult = await res.json();

      if (analysisResult.error) {
        setAutoDashboard(null);
        return;
      }

      // Execute KPI SQL queries
      setAnalyzeProgress(60);
      const resolvedKPIs = (analysisResult.kpis || []).map(
        (kpi: { label: string; sql: string; description: string }) => {
          try {
            const result = executeSQL(kpi.sql, loadedData.rows);
            const value = result[0] ? Object.values(result[0])[0] : "N/A";
            return { label: kpi.label, value, description: kpi.description };
          } catch {
            return { label: kpi.label, value: "N/A", description: kpi.description };
          }
        }
      );

      // Execute chart SQL queries
      setAnalyzeProgress(80);
      const resolvedCharts = (analysisResult.charts || []).map(
        (item: { sql: string; chart: ChartConfig; insight: string }) => {
          try {
            const chartData = executeSQL(item.sql, loadedData.rows);
            return { config: item.chart, data: chartData, insight: item.insight };
          } catch {
            return { config: item.chart, data: [], insight: item.insight };
          }
        }
      );

      setAnalyzeProgress(100);
      setAutoDashboard({
        summary: analysisResult.summary || "",
        kpis: resolvedKPIs,
        charts: resolvedCharts.filter(
          (c: { data: Record<string, string | number>[] }) => c.data.length > 0
        ),
      });
    } catch (err) {
      console.error("Auto-analysis failed:", err);
      setAutoDashboard(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  /* ── Data loaded handler ────────────────────────────────────────────── */

  const handleDataLoaded = useCallback(
    (loadedData: DataState) => {
      setData(loadedData);
      setResults([]);
      setChatHistory([]);
      setAutoDashboard(null);
      runAutoAnalysis(loadedData);
    },
    [runAutoAnalysis]
  );

  /* ── Chat query handler ─────────────────────────────────────────────── */

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

        let queryData: Record<string, string | number>[] = [];
        let sqlError: string | null = null;

        try {
          queryData = executeSQL(geminiResult.sql, data.rows);
        } catch (err) {
          sqlError = `SQL execution failed: ${(err as Error).message}`;
        }

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

  /* ── Helpers ────────────────────────────────────────────────────────── */

  const formatKPIValue = (value: string | number) => {
    if (typeof value === "number") {
      if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
      if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
      return value.toLocaleString();
    }
    return value;
  };

  const chatSuggestions = data
    ? [
        `What are the top 5 ${data.columns[0] || "categories"}?`,
        `Show a summary of ${data.columns[data.columns.length > 1 ? 1 : 0]}`,
        "Compare distributions across categories",
      ]
    : [];

  /* ── Render ─────────────────────────────────────────────────────────── */

  return (
    <div suppressHydrationWarning className="flex min-h-screen flex-col bg-[#f8f7ff] text-gray-950">
      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-md">
        <div className="nav-gradient-border h-[2px]" />
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <div className="h-5 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              <span className="font-semibold">Dashboard</span>
            </div>
          </div>
          {data && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs">
                <Database className="h-3 w-3 text-indigo-600" />
                <span className="font-medium">{data.fileName}</span>
                <span className="text-muted-foreground">
                  ({data.rowCount.toLocaleString()} rows)
                </span>
              </div>
              {results.length > 0 && (
                <button
                  onClick={clearResults}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs transition-all hover:bg-gray-50"
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
        {/* ── Upload State ──────────────────────────────────────────────── */}
        {!data ? (
          <div className="mx-auto w-full max-w-xl pt-12">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100">
                <BarChart3 className="h-7 w-7 text-indigo-600" />
              </div>
              <h1 className="mb-2 text-2xl font-bold">Load Your Data</h1>
              <p className="text-muted-foreground">
                Upload a CSV file or use our sample dataset to get started.
              </p>
            </div>
            <FileUpload onDataLoaded={handleDataLoaded} currentFile={null} />
          </div>
        ) : (
          <>
            {/* ── Analyzing Skeleton State ───────────────────────────────── */}
            {isAnalyzing && (
              <div className="flex flex-col gap-6 animate-fade-in">
                {/* Progress bar */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    <span className="shimmer-text text-sm font-semibold">
                      Analyzing your dataset...
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="progress-fill h-full"
                      style={{ width: `${analyzeProgress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Generating insights, KPIs, and charts based on your data...
                  </p>
                </div>

                {/* Skeleton KPIs */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="glass-card rounded-xl p-5"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="skeleton mb-2 h-3 w-16" />
                      <div className="skeleton mb-1 h-7 w-20" />
                      <div className="skeleton h-3 w-24" />
                    </div>
                  ))}
                </div>

                {/* Skeleton Charts */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="glass-card rounded-2xl p-6"
                      style={{ animationDelay: `${(i + 4) * 100}ms` }}
                    >
                      <div className="skeleton mb-4 h-4 w-32" />
                      <div className="skeleton h-64 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Auto Dashboard ────────────────────────────────────────── */}
            {autoDashboard && !isAnalyzing && (
              <div className="flex flex-col gap-6 animate-fade-in">
                {/* Dataset Summary Banner */}
                <div className="glass-card rounded-2xl p-6 animate-fade-up">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100">
                        <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-gray-900">
                          {data.fileName}
                        </h2>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                            {data.rowCount.toLocaleString()} rows
                          </span>
                          <span className="rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
                            {data.columns.length} columns
                          </span>
                        </div>
                      </div>
                    </div>
                    {autoDashboard.summary && (
                      <div className="flex items-start gap-2 rounded-xl bg-indigo-50/60 p-3 sm:max-w-md">
                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                        <p className="text-xs leading-relaxed text-gray-700">
                          {autoDashboard.summary}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Column tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {data.columns.map((col) => (
                      <span
                        key={col}
                        className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>

                {/* KPI Cards */}
                {autoDashboard.kpis.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {autoDashboard.kpis.map((kpi, i) => (
                      <div
                        key={i}
                        className={`glass-card glow-card rounded-xl p-5 animate-fade-up ${KPI_ACCENTS[i % KPI_ACCENTS.length]}`}
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <p className="text-xs font-medium text-muted-foreground">
                          {kpi.label}
                        </p>
                        <p className="mt-1 text-2xl font-bold text-gradient">
                          {formatKPIValue(kpi.value)}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {kpi.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Auto Charts */}
                {autoDashboard.charts.length > 0 && (
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-600" />
                      <h2 className="text-sm font-semibold text-gradient">
                        AI-Generated Insights
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {autoDashboard.charts.map((chart, i) => (
                        <ChartRenderer
                          key={i}
                          config={chart.config}
                          data={chart.data}
                          insight={chart.insight}
                          index={i}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className="flex items-center gap-4 py-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
                  <div className="glass-card flex items-center gap-2 rounded-full px-4 py-2">
                    <Layers className="h-3.5 w-3.5 text-indigo-500" />
                    <span className="text-xs font-medium text-gray-600">
                      Explore Further
                    </span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
                </div>
              </div>
            )}

            {/* ── Example Queries (when no results) ─────────────────────── */}
            {results.length === 0 && !isAnalyzing && (
              <div className="glass-card rounded-2xl p-6">
                <div className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Lightbulb className="h-4 w-4 text-indigo-600" />
                  Try asking...
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {EXAMPLE_QUERIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleQuery(q)}
                      disabled={isQuerying}
                      className="glass-card glow-card rounded-xl p-3 text-left text-xs transition-all hover:border-indigo-200 disabled:opacity-50"
                    >
                      <MessageSquareText className="mb-1.5 h-3.5 w-3.5 text-indigo-600" />
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Chat Results ──────────────────────────────────────────── */}
            <div ref={resultsRef} className="flex flex-col gap-5">
              {results.map((result, idx) => (
                <div key={idx} className="flex flex-col gap-3 animate-fade-up">
                  {/* User question bubble */}
                  <div className="flex justify-end">
                    <div className="chat-bubble-user max-w-lg px-4 py-2.5">
                      <p className="text-sm font-medium">{result.question}</p>
                    </div>
                  </div>

                  {/* AI response */}
                  <div className="flex justify-start">
                    <div className="chat-bubble-ai w-full max-w-4xl px-5 py-4">
                      {/* Error */}
                      {result.error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                          {result.error}
                        </div>
                      )}

                      {/* Charts */}
                      {result.charts.length > 0 && !result.error && (
                        <div
                          className={`mb-3 grid gap-4 ${
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
                              index={chartIdx}
                            />
                          ))}
                        </div>
                      )}

                      {/* Insight */}
                      {result.insight && !result.error && (
                        <div className="flex items-start gap-2.5 rounded-xl bg-indigo-50/60 p-3.5">
                          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                          <p className="text-sm leading-relaxed text-gray-700">
                            {result.insight}
                          </p>
                        </div>
                      )}

                      {/* SQL Toggle */}
                      {result.sql && (
                        <div className="mt-3">
                          <button
                            onClick={() =>
                              setShowSQL(showSQL === idx ? null : idx)
                            }
                            className="flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-gray-700"
                          >
                            <Code2 className="h-3 w-3" />
                            {showSQL === idx ? "Hide" : "Show"} generated SQL
                          </button>
                          {showSQL === idx && (
                            <pre className="mt-2 overflow-x-auto rounded-lg bg-gray-50 p-4 font-mono text-xs text-gray-600">
                              {result.sql}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Loading State ─────────────────────────────────────────── */}
            {isQuerying && (
              <div className="flex justify-start animate-fade-in">
                <div className="chat-bubble-ai flex items-center gap-3 px-5 py-4">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Analyzing your question...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Generating SQL, selecting chart types, and building your dashboard
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Chat Input ───────────────────────────────────────────── */}
            <div className="sticky bottom-4 mt-auto">
              <ChatInput
                onSend={handleQuery}
                disabled={isQuerying}
                isTyping={isQuerying}
                suggestions={results.length === 0 ? chatSuggestions : []}
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
