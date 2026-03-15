"use client";

import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";

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

export default function FileUpload({
  onDataLoaded,
  currentFile,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".csv")) {
        alert("Please upload a CSV file.");
        return;
      }

      setIsLoading(true);

      // Dynamic import to avoid SSR issues
      const { parseCSVData } = await import("@/lib/csv-engine");

      try {
        const parsed = await parseCSVData(file);
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
        setIsLoading(false);
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
    setIsLoading(true);
    try {
      const res = await fetch("/sample-dataset.csv");
      const blob = await res.blob();
      const file = new File([blob], "YouTube Content Creation.csv", {
        type: "text/csv",
      });
      await processFile(file);
    } catch {
      alert("Failed to load sample dataset.");
    } finally {
      setIsLoading(false);
    }
  }, [processFile]);

  return (
    <div className="flex flex-col gap-4">
      {/* Upload Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        }`}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Parsing CSV data...
            </p>
          </div>
        ) : (
          <>
            <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="mb-1 text-sm font-medium">
              Drag & drop your CSV file here
            </p>
            <p className="mb-4 text-xs text-muted-foreground">
              or click to browse
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </>
        )}
      </div>

      {/* Sample Dataset Button */}
      <button
        onClick={loadSampleDataset}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium transition-all hover:bg-muted disabled:opacity-50"
      >
        <FileSpreadsheet className="h-4 w-4 text-primary" />
        Use Sample Dataset (YouTube Content Creation)
      </button>

      {/* Current File Indicator */}
      {currentFile && (
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm">
          <FileSpreadsheet className="h-4 w-4 text-primary" />
          <span className="font-medium">{currentFile}</span>
        </div>
      )}
    </div>
  );
}
