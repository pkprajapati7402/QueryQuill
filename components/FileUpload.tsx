"use client";

import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, Sparkles, FileUp, Check } from "lucide-react";

interface FileUploadProps {
  onDataLoaded: (data: {
    rows: Record<string, string | number>[];
    schema: string;
    sample: string;
    fileName: string;
    rowCount: number;
    columns: string[];
  }) => void;
  currentFile: string | null;
}

type ParseStage = "idle" | "reading" | "parsing" | "preparing";

const STAGE_LABELS: Record<ParseStage, string> = {
  idle: "",
  reading: "Reading file...",
  parsing: "Parsing columns & rows...",
  preparing: "Preparing schema...",
};

const STAGE_PROGRESS: Record<ParseStage, number> = {
  idle: 0,
  reading: 25,
  parsing: 60,
  preparing: 90,
};

export default function FileUpload({
  onDataLoaded,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [parseStage, setParseStage] = useState<ParseStage>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);

  const isLoading = parseStage !== "idle";

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".csv")) {
        alert("Please upload a CSV file.");
        return;
      }

      setFileName(file.name);
      setFileSize(formatSize(file.size));
      setParseStage("reading");

      const { parseCSVData } = await import("@/lib/csv-engine");

      try {
        setParseStage("parsing");
        const parsed = await parseCSVData(file);

        setParseStage("preparing");
        await new Promise((r) => setTimeout(r, 400));

        onDataLoaded({
          rows: parsed.rows,
          schema: parsed.schemaText,
          sample: parsed.sampleText,
          fileName: file.name,
          rowCount: parsed.rowCount,
          columns: parsed.columns.map((c) => c.name),
        });
      } catch (err) {
        alert(`Failed to parse CSV: ${(err as Error).message}`);
      } finally {
        setParseStage("idle");
        setFileName(null);
        setFileSize(null);
      }
    },
    [onDataLoaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const loadSampleDataset = useCallback(async () => {
    setFileName("YouTube Content Creation.csv");
    setParseStage("reading");
    try {
      const res = await fetch("/sample-dataset.csv");
      const blob = await res.blob();
      const file = new File([blob], "YouTube Content Creation.csv", {
        type: "text/csv",
      });
      setFileSize(formatSize(file.size));
      await processFile(file);
    } catch {
      alert("Failed to load sample dataset.");
      setParseStage("idle");
      setFileName(null);
      setFileSize(null);
    }
  }, [processFile]);

  return (
    <div className="flex flex-col gap-5">
      {/* Upload Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`glass-card glow-card relative flex flex-col items-center justify-center overflow-hidden rounded-2xl p-10 transition-all duration-300 ${
          isDragging
            ? "scale-[1.02] ring-2 ring-indigo-400/50 ring-offset-2 bg-indigo-50/80"
            : ""
        }`}
      >
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-200/30 to-violet-200/30 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-gradient-to-br from-pink-200/30 to-violet-200/30 blur-2xl" />
        </div>

        {isLoading ? (
          <div className="relative z-10 flex w-full max-w-xs flex-col items-center gap-4">
            {/* Progress ring */}
            <div className="relative flex h-16 w-16 items-center justify-center">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke="#e0e7ff"
                  strokeWidth="4"
                />
                <circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke="url(#progress-gradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={175.93}
                  strokeDashoffset={175.93 * (1 - STAGE_PROGRESS[parseStage] / 100)}
                  className="transition-all duration-500 ease-out"
                />
                <defs>
                  <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <FileUp className="absolute h-6 w-6 text-indigo-600" />
            </div>

            {/* Stage text */}
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900 animate-fade-in">
                {STAGE_LABELS[parseStage]}
              </p>
              {fileName && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {fileName}{fileSize ? ` · ${fileSize}` : ""}
                </p>
              )}
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="progress-fill h-full"
                style={{ width: `${STAGE_PROGRESS[parseStage]}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center gap-1">
            {/* Icon */}
            <div className={`mb-3 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 ${
              isDragging
                ? "bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-200"
                : "bg-gradient-to-br from-indigo-100 to-violet-100"
            }`}>
              <Upload className={`h-7 w-7 transition-colors duration-300 ${
                isDragging ? "text-white" : "text-indigo-600"
              }`} />
            </div>

            {isDragging ? (
              <p className="text-base font-semibold text-gradient">
                Drop to analyze
              </p>
            ) : (
              <>
                <p className="text-sm font-semibold text-gray-900">
                  Drag & drop your CSV file here
                </p>
                <p className="text-xs text-muted-foreground">
                  or click anywhere to browse files
                </p>
              </>
            )}

            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>

      {/* Sample Dataset Button */}
      <button
        suppressHydrationWarning
        onClick={loadSampleDataset}
        disabled={isLoading}
        className="glass-card glow-card flex items-center justify-center gap-2.5 rounded-xl px-5 py-3.5 text-sm font-medium transition-all hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
          <Sparkles className="h-4 w-4 text-amber-600" />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-gray-900">Try Sample Dataset</span>
          <span className="text-[11px] text-muted-foreground">YouTube Content Creation · 1,000 rows</span>
        </div>
        <FileSpreadsheet className="ml-auto h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}
