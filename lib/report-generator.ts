import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* ── Input Types ─────────────────────────────────────────────────────── */

interface ReportKPI {
  label: string;
  value: string | number;
  description: string;
}

interface ReportChart {
  title: string;
  type: string;
  insight?: string;
  element: HTMLElement;
}

interface ReportQueryResult {
  question: string;
  insight: string;
  sql: string;
  agentType: "data" | "strategy" | "hybrid";
  charts: { title: string; type: string; element: HTMLElement }[];
  strategy?: {
    strategy: string;
    keyRecommendations: string[];
    riskFactors?: string[];
  };
}

export interface ReportInput {
  fileNames: string[];
  totalRows: number;
  totalFiles: number;
  columns: string[][];
  summary: string;
  kpis: ReportKPI[];
  autoDashboardCharts: ReportChart[];
  queryResults: ReportQueryResult[];
  generatedAt: Date;
}

/* ── Colors (RGB) ────────────────────────────────────────────────────── */

const INDIGO: [number, number, number] = [99, 102, 241];
const VIOLET: [number, number, number] = [139, 92, 246];
const TEXT_PRIMARY: [number, number, number] = [17, 24, 39];
const TEXT_SECONDARY: [number, number, number] = [107, 114, 128];
const TEXT_MUTED: [number, number, number] = [156, 163, 175];
const BG_LIGHT: [number, number, number] = [243, 244, 246];
const EMERALD: [number, number, number] = [16, 185, 129];
const AMBER: [number, number, number] = [245, 158, 11];

/* ── Main Export ─────────────────────────────────────────────────────── */

export async function generateReport(input: ReportInput): Promise<void> {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PAGE_W = 210;
  const PAGE_H = 297;
  const M = 20; // margin
  const CW = PAGE_W - M * 2; // content width
  let y = M;

  /* ── Helpers ─────────────────────────────────────────── */

  function checkBreak(needed: number) {
    if (y + needed > PAGE_H - M) {
      pdf.addPage();
      y = M;
    }
  }

  function setColor(c: [number, number, number]) {
    pdf.setTextColor(c[0], c[1], c[2]);
  }

  function drawWrapped(text: string, x: number, maxW: number, size: number, color: [number, number, number], style: "normal" | "bold" = "normal"): number {
    pdf.setFontSize(size);
    pdf.setFont("helvetica", style);
    setColor(color);
    const lines: string[] = pdf.splitTextToSize(text, maxW);
    for (const line of lines) {
      checkBreak(size * 0.4 + 2);
      pdf.text(line, x, y);
      y += size * 0.4 + 1;
    }
    return y;
  }

  function sectionHeader(title: string) {
    checkBreak(16);
    y += 4;
    pdf.setFillColor(INDIGO[0], INDIGO[1], INDIGO[2]);
    pdf.rect(M, y - 3, 3, 10, "F");
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    setColor(TEXT_PRIMARY);
    pdf.text(title, M + 7, y + 4);
    y += 14;
  }

  function drawLine() {
    pdf.setDrawColor(228, 228, 231);
    pdf.setLineWidth(0.3);
    pdf.line(M, y, PAGE_W - M, y);
    y += 4;
  }

  async function captureElement(el: HTMLElement): Promise<string | null> {
    try {
      const canvas = await html2canvas(el, {
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        scale: 2,
      } as Parameters<typeof html2canvas>[1] & { scale?: number });
      return canvas.toDataURL("image/png");
    } catch {
      return null;
    }
  }

  function formatValue(v: string | number): string {
    if (typeof v === "number") {
      if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
      if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
      return v.toLocaleString();
    }
    return String(v);
  }

  const dateStr = input.generatedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  /* ── 1. Cover Page ───────────────────────────────────── */

  // Brand accent bar
  pdf.setFillColor(INDIGO[0], INDIGO[1], INDIGO[2]);
  pdf.rect(0, 0, PAGE_W, 4, "F");
  pdf.setFillColor(VIOLET[0], VIOLET[1], VIOLET[2]);
  pdf.rect(PAGE_W * 0.6, 0, PAGE_W * 0.4, 4, "F");

  y = 70;
  pdf.setFontSize(32);
  pdf.setFont("helvetica", "bold");
  setColor(INDIGO);
  pdf.text("QueryQuill", PAGE_W / 2, y, { align: "center" });

  y += 14;
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "normal");
  setColor(TEXT_SECONDARY);
  pdf.text("Data Analytics Report", PAGE_W / 2, y, { align: "center" });

  y += 12;
  pdf.setFontSize(10);
  setColor(TEXT_MUTED);
  pdf.text(dateStr, PAGE_W / 2, y, { align: "center" });

  // Dataset info box
  y += 20;
  pdf.setFillColor(BG_LIGHT[0], BG_LIGHT[1], BG_LIGHT[2]);
  const boxH = 12 + input.fileNames.length * 6;
  pdf.roundedRect(M + 20, y, CW - 40, boxH, 3, 3, "F");

  y += 8;
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  setColor(TEXT_PRIMARY);
  pdf.text(`${input.totalFiles} Dataset${input.totalFiles > 1 ? "s" : ""}  |  ${input.totalRows.toLocaleString()} Total Rows`, PAGE_W / 2, y, { align: "center" });

  y += 6;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  setColor(TEXT_SECONDARY);
  for (const name of input.fileNames) {
    pdf.text(name, PAGE_W / 2, y, { align: "center" });
    y += 5;
  }

  /* ── 2. Executive Summary ───────────────────────────── */

  pdf.addPage();
  y = M;

  if (input.summary) {
    sectionHeader("Executive Summary");
    drawWrapped(input.summary, M, CW, 10, TEXT_PRIMARY);
    y += 6;
    drawLine();
  }

  /* ── 3. Key Metrics ─────────────────────────────────── */

  if (input.kpis.length > 0) {
    sectionHeader("Key Metrics");

    const cardW = (CW - 6) / 2;
    const cardH = 22;
    const accents: [number, number, number][] = [INDIGO, VIOLET, [236, 72, 153], [6, 182, 212]];

    for (let i = 0; i < input.kpis.length; i++) {
      const col = i % 2;
      if (col === 0) checkBreak(cardH + 4);

      const kpi = input.kpis[i];
      const x = M + col * (cardW + 6);

      // Card background
      pdf.setFillColor(BG_LIGHT[0], BG_LIGHT[1], BG_LIGHT[2]);
      pdf.roundedRect(x, y, cardW, cardH, 2, 2, "F");

      // Accent left border
      const accent = accents[i % accents.length];
      pdf.setFillColor(accent[0], accent[1], accent[2]);
      pdf.rect(x, y + 2, 2, cardH - 4, "F");

      // Label
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      setColor(TEXT_MUTED);
      pdf.text(kpi.label, x + 6, y + 6);

      // Value
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      setColor(accent);
      pdf.text(formatValue(kpi.value), x + 6, y + 14);

      // Description
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      setColor(TEXT_SECONDARY);
      const desc = pdf.splitTextToSize(kpi.description, cardW - 10);
      pdf.text(desc[0] || "", x + 6, y + 19);

      if (col === 1 || i === input.kpis.length - 1) {
        y += cardH + 4;
      }
    }

    y += 4;
    drawLine();
  }

  /* ── 4. AI-Generated Charts ─────────────────────────── */

  if (input.autoDashboardCharts.length > 0) {
    sectionHeader("AI-Generated Insights");

    for (const chart of input.autoDashboardCharts) {
      checkBreak(100);

      const imgData = await captureElement(chart.element);
      if (imgData) {
        // Chart image
        const imgW = CW;
        const imgH = 75;
        pdf.addImage(imgData, "PNG", M, y, imgW, imgH);
        y += imgH + 3;
      } else {
        // Fallback
        pdf.setFillColor(BG_LIGHT[0], BG_LIGHT[1], BG_LIGHT[2]);
        pdf.roundedRect(M, y, CW, 20, 2, 2, "F");
        drawWrapped(`[Chart: ${chart.title}]`, M + 4, CW - 8, 9, TEXT_MUTED);
        y += 10;
      }

      // Insight below chart
      if (chart.insight) {
        checkBreak(20);
        pdf.setFillColor(238, 242, 255); // indigo-50
        const insightLines: string[] = pdf.splitTextToSize(chart.insight, CW - 12);
        const insightH = insightLines.length * 4.5 + 6;
        pdf.roundedRect(M, y, CW, insightH, 2, 2, "F");
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        setColor(TEXT_SECONDARY);
        pdf.text(insightLines, M + 6, y + 5);
        y += insightH + 6;
      }
    }

    drawLine();
  }

  /* ── 5. Chat Q&A Analysis ───────────────────────────── */

  if (input.queryResults.length > 0) {
    pdf.addPage();
    y = M;
    sectionHeader("Exploratory Analysis");

    for (const result of input.queryResults) {
      checkBreak(30);

      // Question bubble
      pdf.setFillColor(INDIGO[0], INDIGO[1], INDIGO[2]);
      const qLines: string[] = pdf.splitTextToSize(result.question, CW - 20);
      const qH = qLines.length * 4.5 + 6;
      pdf.roundedRect(M + CW * 0.3, y, CW * 0.7, qH, 3, 3, "F");
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 255, 255);
      pdf.text(qLines, M + CW * 0.3 + 6, y + 5);
      y += qH + 4;

      // Charts
      for (const chart of result.charts) {
        checkBreak(85);
        const imgData = await captureElement(chart.element);
        if (imgData) {
          pdf.addImage(imgData, "PNG", M, y, CW, 70);
          y += 73;
        }
      }

      // Insight
      if (result.insight && result.agentType !== "strategy") {
        checkBreak(20);
        pdf.setFillColor(238, 242, 255);
        const iLines: string[] = pdf.splitTextToSize(result.insight, CW - 12);
        const iH = iLines.length * 4.5 + 6;
        pdf.roundedRect(M, y, CW, iH, 2, 2, "F");
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        setColor(TEXT_SECONDARY);
        pdf.text(iLines, M + 6, y + 5);
        y += iH + 4;
      }

      // Strategy section
      if (result.strategy) {
        checkBreak(40);

        // Strategy header
        pdf.setFillColor(236, 253, 245); // emerald-50
        pdf.roundedRect(M, y, CW, 8, 2, 2, "F");
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        setColor(EMERALD);
        pdf.text("Strategy Advisor", M + 4, y + 5.5);
        y += 12;

        // Strategy text
        drawWrapped(result.strategy.strategy.replace(/\*\*/g, ""), M, CW, 9, TEXT_PRIMARY);
        y += 4;

        // Recommendations
        if (result.strategy.keyRecommendations.length > 0) {
          checkBreak(10);
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "bold");
          setColor(EMERALD);
          pdf.text("Key Recommendations:", M, y);
          y += 5;

          for (let i = 0; i < result.strategy.keyRecommendations.length; i++) {
            checkBreak(8);
            drawWrapped(`${i + 1}. ${result.strategy.keyRecommendations[i]}`, M + 4, CW - 8, 8, TEXT_PRIMARY);
            y += 1;
          }
        }

        // Risk factors
        if (result.strategy.riskFactors && result.strategy.riskFactors.length > 0) {
          y += 3;
          checkBreak(10);
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "bold");
          setColor(AMBER);
          pdf.text("Risk Factors:", M, y);
          y += 5;

          for (const risk of result.strategy.riskFactors) {
            checkBreak(8);
            drawWrapped(`- ${risk}`, M + 4, CW - 8, 8, TEXT_SECONDARY);
            y += 1;
          }
        }

        y += 6;
      }

      drawLine();
    }
  }

  /* ── 6. Page Numbers & Footer ───────────────────────── */

  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    setColor(TEXT_MUTED);
    pdf.text("Generated by QueryQuill", M, PAGE_H - 10);
    pdf.text(`Page ${i} of ${totalPages}`, PAGE_W / 2, PAGE_H - 10, { align: "center" });
    pdf.text(dateStr, PAGE_W - M, PAGE_H - 10, { align: "right" });
  }

  /* ── Save ───────────────────────────────────────────── */

  const fileName = `QueryQuill_Report_${input.generatedAt.toISOString().slice(0, 10)}.pdf`;
  pdf.save(fileName);
}
