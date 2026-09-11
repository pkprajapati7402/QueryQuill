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
  Plus,
  X,
  FileDown,
} from "lucide-react";
import FileUpload from "@/components/FileUpload";
import ChatInput from "@/components/ChatInput";
import ChartRenderer from "@/components/ChartRenderer";
import StrategyCard from "@/components/StrategyCard";
import { executeSQL, extractTableName } from "@/lib/csv-engine";
import { classifyQuery, type QueryIntent } from "@/lib/query-router";
import type { ChartConfig } from "@/lib/gemini";

/* ── Types ────────────────────────────────────────────────────────────── */

interface DataState {
  rows: Record<string, string | number>[];
  schema: string;
  sample: string;
  fileName: string;
  rowCount: number;
  columns: string[];
  tableName: string; // "data_1", "data_2", etc.
}

interface QueryResult {
  question: string;
  charts: ChartConfig[];
  chartData: Record<string, string | number>[][];
  insight: string;
  sql: string;
  error: string | null;
  agentType: QueryIntent;
  strategy?: {
    strategy: string;
    keyRecommendations: string[];
    riskFactors?: string[];
  };
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

interface AutoDashboard {
  summary: string;
  kpis: { label: string; value: string | number; description: string; fileIdx: number }[];
  charts: { config: ChartConfig; data: Record<string, string | number>[]; insight: string }[];
  suggestedQuestions: string[];
}

/* ── Constants ────────────────────────────────────────────────────────── */

const KPI_ACCENTS = ["kpi-accent-indigo", "kpi-accent-violet", "kpi-accent-pink", "kpi-accent-cyan"];
const MAX_AUTO_CHARTS = 4;
const MAX_FILES = 5;

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const [files, setFiles] = useState<DataState[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [results, setResults] = useState<QueryResult[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [showSQL, setShowSQL] = useState<number | null>(null);
  const [showAddFile, setShowAddFile] = useState(false);
  const [queryIntent, setQueryIntent] = useState<QueryIntent>("data");
  const resultsRef = useRef<HTMLDivElement>(null);

  // Report generation
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const autoDashboardChartRefs = useRef<(HTMLDivElement | null)[]>([]);
  const chatChartRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  // Auto-dashboard state
  const [autoDashboard, setAutoDashboard] = useState<AutoDashboard | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);

  const activeFile = files[activeFileIndex] || null;

  useEffect(() => {
    if (results.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [results]);

  /* ── Build combined schema for Gemini ────────────────────────────────── */

  const buildCombinedSchema = useCallback((fileList: DataState[]) => {
    return fileList
      .map((f) => f.schema.replace(/^Table:\s*data/i, `Table: ${f.tableName}`))
      .join("\n\n");
  }, []);

  const buildCombinedSample = useCallback((fileList: DataState[]) => {
    return fileList
      .map((f) => `[${f.tableName} — ${f.fileName}]\n${f.sample}`)
      .join("\n\n");
  }, []);

  /* ── Auto-analysis for all files ─────────────────────────────────────── */

  // Try executing SQL against the best-matching file, with fallback to all files
  const executeSQLWithFallback = useCallback(
    (sql: string, fileList: DataState[]): { data: Record<string, string | number>[]; fileIdx: number } => {
      const tableName = extractTableName(sql);
      const matchedFile = fileList.find((f) => f.tableName === tableName);

      // Try matched file first
      if (matchedFile) {
        try {
          const data = executeSQL(sql, matchedFile.rows);
          if (data.length > 0) return { data, fileIdx: fileList.indexOf(matchedFile) };
        } catch { /* fall through */ }
      }

      // Fallback: try every file until one produces results
      for (let i = 0; i < fileList.length; i++) {
        try {
          const data = executeSQL(sql, fileList[i].rows);
          if (data.length > 0) return { data, fileIdx: i };
        } catch { /* try next */ }
      }

      return { data: [], fileIdx: 0 };
    },
    []
  );

  const runAutoAnalysis = useCallback(async (fileList: DataState[]) => {
    setIsAnalyzing(true);
    setAnalyzeProgress(15);

    try {
      setAnalyzeProgress(30);

      const combinedSchema = buildCombinedSchema(fileList);
      const combinedSample = buildCombinedSample(fileList);
      const allColumns = fileList.flatMap((f) => f.columns);
      const totalRows = fileList.reduce((sum, f) => sum + f.rowCount, 0);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schema: combinedSchema,
          sampleRows: combinedSample,
          rowCount: totalRows,
          columns: [...new Set(allColumns)],
          tableCount: fileList.length,
          tableNames: fileList.map((f) => f.tableName),
        }),
      });

      const analysisResult = await res.json();

      if (analysisResult.error) {
        // Keep old dashboard if we had one, only clear if truly first load
        setAutoDashboard((prev) => prev);
        return;
      }

      // Execute KPI SQL queries — with fallback across all files
      setAnalyzeProgress(60);
      const resolvedKPIs = (analysisResult.kpis || []).map(
        (kpi: { label: string; sql: string; description: string }) => {
          try {
            const { data, fileIdx } = executeSQLWithFallback(kpi.sql, fileList);
            const value = data[0] ? Object.values(data[0])[0] : "N/A";
            return { label: kpi.label, value, description: kpi.description, fileIdx };
          } catch {
            return { label: kpi.label, value: "N/A", description: kpi.description, fileIdx: 0 };
          }
        }
      );

      // Execute chart SQL queries — with fallback across all files
      setAnalyzeProgress(80);
      const resolvedCharts = (analysisResult.charts || []).slice(0, MAX_AUTO_CHARTS).map(
        (item: { sql: string; chart: ChartConfig; insight: string }) => {
          try {
            const { data } = executeSQLWithFallback(item.sql, fileList);
            return { config: item.chart, data, insight: item.insight };
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
        suggestedQuestions: analysisResult.suggestedQuestions || [],
      });
    } catch (err) {
      console.error("Auto-analysis failed:", err);
      // Keep previous dashboard on error instead of wiping it
    } finally {
      setIsAnalyzing(false);
    }
  }, [buildCombinedSchema, buildCombinedSample, executeSQLWithFallback]);

  /* ── Data loaded handler ────────────────────────────────────────────── */

  const handleDataLoaded = useCallback(
    (loadedData: Omit<DataState, "tableName">) => {
      setFiles((prev) => {
        const idx = prev.length + 1;
        const newFile: DataState = {
          ...loadedData,
          tableName: prev.length === 0 ? "data" : `data_${idx}`,
        };
        const newFiles = [...prev, newFile];

        // Run auto-analysis for newly added files
        // Keep old dashboard visible while new analysis runs
        setTimeout(() => {
          setResults([]);
          setChatHistory([]);
          setActiveFileIndex(0);
          setShowAddFile(false);
          runAutoAnalysis(newFiles);
        }, 100);

        return newFiles;
      });
    },
    [runAutoAnalysis]
  );

  const removeFile = useCallback(
    (idx: number) => {
      setFiles((prev) => {
        const newFiles = prev.filter((_, i) => i !== idx);
        if (newFiles.length === 0) {
          setAutoDashboard(null);
          setResults([]);
          setChatHistory([]);
          setActiveFileIndex(0);
          return [];
        }
        // Re-assign table names
        const renamed = newFiles.map((f, i) => ({
          ...f,
          tableName: newFiles.length === 1 ? "data" : `data_${i + 1}`,
        }));
        setActiveFileIndex((a) => Math.min(a, renamed.length - 1));
        setResults([]);
        setChatHistory([]);
        setTimeout(() => runAutoAnalysis(renamed), 100);
        return renamed;
      });
    },
    [runAutoAnalysis]
  );

  /* ── Chat query handler ─────────────────────────────────────────────── */

  const handleQuery = useCallback(
    async (question: string) => {
      if (files.length === 0) return;

      setIsQuerying(true);
      const intent = classifyQuery(question);
      setQueryIntent(intent);

      const newHistory: ChatMessage[] = [
        ...chatHistory,
        { role: "user", text: question },
      ];

      const combinedSchema = buildCombinedSchema(files);
      const combinedSample = buildCombinedSample(files);

      try {
        /* ── Strategy-only route ──────────────────────────────────────── */
        if (intent === "strategy") {
          const res = await fetch("/api/strategy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question,
              schema: combinedSchema,
              sampleRows: combinedSample,
              conversationHistory: chatHistory.slice(-6),
            }),
          });

          const strategyResult = await res.json();

          const result: QueryResult = {
            question,
            charts: [],
            chartData: [],
            insight: "",
            sql: "",
            error: strategyResult.error || null,
            agentType: "strategy",
            strategy: strategyResult.error
              ? undefined
              : {
                  strategy: strategyResult.strategy,
                  keyRecommendations: strategyResult.keyRecommendations || [],
                  riskFactors: strategyResult.riskFactors,
                },
          };

          setResults((prev) => [...prev, result]);
          newHistory.push({
            role: "assistant",
            text: `[Strategy] ${strategyResult.strategy?.slice(0, 200) || strategyResult.error || "Strategy generated."}`,
          });
          setChatHistory(newHistory);
          return;
        }

        /* ── Data route (also first step of hybrid) ───────────────────── */
        const res = await fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            schema: combinedSchema,
            sampleRows: combinedSample,
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
              agentType: intent,
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
            agentType: intent,
          };
          setResults((prev) => [...prev, result]);
          newHistory.push({
            role: "assistant",
            text: geminiResult.insight || "Answered.",
          });
          setChatHistory(newHistory);
          return;
        }

        // Match SQL table name to correct file's rows (with fallback)
        const { data: queryData, fileIdx: _matchedIdx } = (() => {
          try {
            return executeSQLWithFallback(geminiResult.sql, files);
          } catch {
            return { data: [] as Record<string, string | number>[], fileIdx: activeFileIndex };
          }
        })();

        const sqlError: string | null = queryData.length === 0 && geminiResult.sql
          ? "SQL execution returned no results — the query may reference columns not in your data."
          : null;

        const chartData = geminiResult.charts.map(() => queryData);

        /* ── Hybrid: also call strategy agent with data context ───────── */
        let strategyData: QueryResult["strategy"] | undefined;

        if (intent === "hybrid" && !sqlError) {
          try {
            const dataContext = `Query: ${geminiResult.sql}\nResults (first 20 rows):\n${JSON.stringify(queryData.slice(0, 20), null, 2)}\n\nData Insight: ${geminiResult.insight}`;

            const stratRes = await fetch("/api/strategy", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                question,
                schema: combinedSchema,
                sampleRows: combinedSample,
                dataContext,
                conversationHistory: chatHistory.slice(-6),
              }),
            });

            const strategyResult = await stratRes.json();

            if (!strategyResult.error) {
              strategyData = {
                strategy: strategyResult.strategy,
                keyRecommendations: strategyResult.keyRecommendations || [],
                riskFactors: strategyResult.riskFactors,
              };
            }
          } catch {
            // Strategy agent failure in hybrid mode is non-fatal
          }
        }

        const result: QueryResult = {
          question,
          charts: geminiResult.charts,
          chartData,
          insight: geminiResult.insight,
          sql: geminiResult.sql,
          error: sqlError,
          agentType: intent,
          strategy: strategyData,
        };

        setResults((prev) => [...prev, result]);
        newHistory.push({
          role: "assistant",
          text: strategyData
            ? `${geminiResult.insight || "Dashboard generated."} [Strategy] ${strategyData.strategy?.slice(0, 150)}`
            : geminiResult.insight || "Dashboard generated.",
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
            agentType: intent,
          },
        ]);
      } finally {
        setIsQuerying(false);
      }
    },
    [files, activeFileIndex, chatHistory, buildCombinedSchema, buildCombinedSample]
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setChatHistory([]);
  }, []);

  /* ── Generate Report handler ─────────────────────────────────────────── */

  const handleGenerateReport = useCallback(async () => {
    if (files.length === 0) return;
    setIsGeneratingReport(true);

    try {
      const { generateReport } = await import("@/lib/report-generator");

      // Build auto-dashboard chart elements
      const autoDashboardCharts = (autoDashboard?.charts || [])
        .map((chart, i) => {
          const el = autoDashboardChartRefs.current[i];
          if (!el) return null;
          return {
            title: chart.config.title,
            type: chart.config.type,
            insight: chart.insight,
            element: el,
          };
        })
        .filter((c): c is NonNullable<typeof c> => c !== null);

      // Build chat query results with chart elements
      const queryResults = results
        .filter((r) => !r.error)
        .map((result, idx) => {
          const charts = result.charts
            .map((chart, chartIdx) => {
              const el = chatChartRefs.current.get(`${idx}-${chartIdx}`);
              if (!el) return null;
              return { title: chart.title, type: chart.type, element: el };
            })
            .filter((c): c is NonNullable<typeof c> => c !== null);

          return {
            question: result.question,
            insight: result.insight,
            sql: result.sql,
            agentType: result.agentType as "data" | "strategy" | "hybrid",
            charts,
            strategy: result.strategy,
          };
        });

      // Build KPIs
      const kpis = (autoDashboard?.kpis || []).map((kpi) => ({
        label: kpi.label,
        value: kpi.value,
        description: kpi.description,
      }));

      await generateReport({
        fileNames: files.map((f) => f.fileName),
        totalRows: files.reduce((s, f) => s + f.rowCount, 0),
        totalFiles: files.length,
        columns: files.map((f) => f.columns),
        summary: autoDashboard?.summary || "",
        kpis,
        autoDashboardCharts,
        queryResults,
        generatedAt: new Date(),
      });
    } catch (err) {
      console.error("Report generation failed:", err);
    } finally {
      setIsGeneratingReport(false);
    }
  }, [files, autoDashboard, results]);

  /* ── Helpers ────────────────────────────────────────────────────────── */

  const formatKPIValue = (value: string | number) => {
    if (typeof value === "number") {
      if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
      if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
      return value.toLocaleString();
    }
    return value;
  };

  const chatSuggestions = autoDashboard?.suggestedQuestions?.length
    ? autoDashboard.suggestedQuestions.slice(0, 3)
    : activeFile
      ? [
          `What are the top 5 ${activeFile.columns[0] || "categories"}?`,
          `Show a summary of ${activeFile.columns[activeFile.columns.length > 1 ? 1 : 0]}`,
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
          {files.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs">
                <Database className="h-3 w-3 text-indigo-600" />
                <span className="font-medium">
                  {files.length} file{files.length > 1 ? "s" : ""}
                </span>
                <span className="text-muted-foreground">
                  ({files.reduce((s, f) => s + f.rowCount, 0).toLocaleString()} rows)
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
              {(autoDashboard || results.length > 0) && (
                <button
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60"
                >
                  {isGeneratingReport ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileDown className="h-3 w-3" />
                      Generate Report
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-6">
        {/* ── Upload State ──────────────────────────────────────────────── */}
        {files.length === 0 ? (
          <div className="mx-auto w-full max-w-xl pt-12">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100">
                <BarChart3 className="h-7 w-7 text-indigo-600" />
              </div>
              <h1 className="mb-2 text-2xl font-bold">Load Your Data</h1>
              <p className="text-muted-foreground">
                Upload one or more CSV files to get started.
              </p>
            </div>
            <FileUpload onDataLoaded={handleDataLoaded} currentFile={null} />
          </div>
        ) : (
          <>
            {/* ── File Tabs ──────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-2">
              {files.map((f, i) => (
                <div
                  key={f.tableName}
                  className={`group flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all cursor-pointer ${
                    i === activeFileIndex
                      ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm"
                      : "border-gray-200 bg-white/80 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveFileIndex(i)}
                >
                  <FileSpreadsheet className={`h-3.5 w-3.5 ${i === activeFileIndex ? "text-indigo-500" : "text-gray-400"}`} />
                  <span className="font-medium max-w-[140px] truncate">{f.fileName}</span>
                  <span className="text-[10px] opacity-60">
                    {f.rowCount.toLocaleString()}r &middot; {f.columns.length}c
                  </span>
                  {files.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(i);
                      }}
                      className="ml-0.5 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-100"
                    >
                      <X className="h-3 w-3 text-red-400" />
                    </button>
                  )}
                </div>
              ))}

              {files.length < MAX_FILES && (
                <button
                  onClick={() => setShowAddFile(!showAddFile)}
                  className="flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500 transition-all hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add file
                </button>
              )}
            </div>

            {/* ── Inline Add‐file Uploader ────────────────────────────────── */}
            {showAddFile && (
              <div className="animate-fade-in">
                <FileUpload onDataLoaded={handleDataLoaded} currentFile={null} />
              </div>
            )}

            {/* ── Analyzing Skeleton State ───────────────────────────────── */}
            {isAnalyzing && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="glass-card rounded-2xl p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    <span className="shimmer-text text-sm font-semibold">
                      Analyzing {files.length > 1 ? `${files.length} datasets` : "your dataset"}...
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="progress-fill h-full"
                      style={{ width: `${analyzeProgress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Generating insights, KPIs, and charts{files.length > 1 ? " across all files" : ""}...
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
                  {[0, 1].map((i) => (
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
                          {files.length === 1 ? files[0].fileName : `${files.length} Datasets Loaded`}
                        </h2>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                            {files.reduce((s, f) => s + f.rowCount, 0).toLocaleString()} total rows
                          </span>
                          <span className="rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
                            {files.length} file{files.length > 1 ? "s" : ""}
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

                  {/* File column tags — grouped per file */}
                  {files.map((f, fi) => (
                    <div key={fi} className="mt-3">
                      {files.length > 1 && (
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          {f.fileName}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {f.columns.map((col) => (
                          <span
                            key={`${fi}-${col}`}
                            className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
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

                {/* Auto Charts (max 4) */}
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
                          ref={(el) => { autoDashboardChartRefs.current[i] = el; }}
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

            {/* ── Suggested Questions (when no results) ─────────────────── */}
            {results.length === 0 && !isAnalyzing && autoDashboard?.suggestedQuestions && autoDashboard.suggestedQuestions.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <div className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Lightbulb className="h-4 w-4 text-indigo-600" />
                  Try asking...
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {autoDashboard.suggestedQuestions.map((q) => (
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
                    <div className={`w-full max-w-4xl px-5 py-4 ${
                      result.agentType === "strategy" ? "chat-bubble-strategy" : "chat-bubble-ai"
                    }`}>
                      {/* Error */}
                      {result.error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                          {result.error}
                        </div>
                      )}

                      {/* Charts (data & hybrid only) */}
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
                              ref={(el) => { chatChartRefs.current.set(`${idx}-${chartIdx}`, el); }}
                              config={chart}
                              data={result.chartData[chartIdx] || []}
                              index={chartIdx}
                            />
                          ))}
                        </div>
                      )}

                      {/* Data Insight (data & hybrid only) */}
                      {result.insight && !result.error && result.agentType !== "strategy" && (
                        <div className="flex items-start gap-2.5 rounded-xl bg-indigo-50/60 p-3.5">
                          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                          <p className="text-sm leading-relaxed text-gray-700">
                            {result.insight}
                          </p>
                        </div>
                      )}

                      {/* Strategy Card (strategy & hybrid) */}
                      {result.strategy && !result.error && (
                        <div className={result.agentType === "hybrid" ? "mt-4" : ""}>
                          <StrategyCard
                            strategy={result.strategy.strategy}
                            keyRecommendations={result.strategy.keyRecommendations}
                            riskFactors={result.strategy.riskFactors}
                          />
                        </div>
                      )}

                      {/* SQL Toggle (data & hybrid only) */}
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
                <div className={`flex items-center gap-3 px-5 py-4 ${
                  queryIntent === "strategy" ? "chat-bubble-strategy" : "chat-bubble-ai"
                }`}>
                  <div className={`h-5 w-5 animate-spin rounded-full border-2 border-t-transparent ${
                    queryIntent === "strategy" ? "border-emerald-500" : "border-indigo-500"
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {queryIntent === "strategy"
                        ? "Consulting the Strategy Advisor..."
                        : queryIntent === "hybrid"
                          ? "Analyzing data & preparing strategic insights..."
                          : "Analyzing your question..."}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {queryIntent === "strategy"
                        ? "Generating growth recommendations based on your data"
                        : queryIntent === "hybrid"
                          ? "Running data query, then building strategic advice"
                          : "Generating SQL, selecting chart types, and building your dashboard"}
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
                  files.length > 1
                    ? "Ask about any of your uploaded datasets..."
                    : results.length > 0
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
