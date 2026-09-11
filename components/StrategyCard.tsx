"use client";

import { Target, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";

interface StrategyCardProps {
  strategy: string;
  keyRecommendations: string[];
  riskFactors?: string[];
  index?: number;
}

function renderMarkdown(text: string) {
  // Split into paragraphs and render bold markers
  return text.split(/\n\n+/).map((para, i) => {
    const parts = para.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="mb-3 last:mb-0 text-sm leading-relaxed text-gray-700">
        {parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={j} className="font-semibold text-gray-900">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={j}>{part}</span>;
        })}
      </p>
    );
  });
}

export default function StrategyCard({
  strategy,
  keyRecommendations,
  riskFactors,
  index = 0,
}: StrategyCardProps) {
  return (
    <div
      className="strategy-card rounded-2xl overflow-hidden transition-all duration-300"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Accent strip */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-200">
              <Target className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Strategy Advisor</h3>
              <p className="text-[11px] text-gray-500">AI-powered business insights</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 border border-emerald-200">
            <Sparkles className="h-3 w-3" />
            Strategy
          </span>
        </div>

        {/* Strategy text */}
        <div className="rounded-xl bg-gradient-to-br from-gray-50 to-emerald-50/30 p-4 border border-emerald-100/50">
          {renderMarkdown(strategy)}
        </div>

        {/* Key Recommendations */}
        {keyRecommendations.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Key Recommendations
            </h4>
            <div className="space-y-2">
              {keyRecommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl bg-white p-3 border border-emerald-100 shadow-sm transition-all hover:shadow-md hover:border-emerald-200"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-700 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Factors */}
        {riskFactors && riskFactors.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-3 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Risk Factors
            </h4>
            <div className="space-y-2">
              {riskFactors.map((risk, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl bg-amber-50/60 p-3 border border-amber-200/60"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                  <p className="text-sm text-amber-900 leading-relaxed">{risk}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
