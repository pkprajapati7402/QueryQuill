"use client";

import { forwardRef } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import type { ChartConfig } from "@/lib/gemini";
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  Activity,
  Lightbulb,
} from "lucide-react";

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#a855f7",
];

const GRADIENTS = [
  { id: "grad0", from: "#6366f1", to: "#818cf8" },
  { id: "grad1", from: "#8b5cf6", to: "#a78bfa" },
  { id: "grad2", from: "#ec4899", to: "#f472b6" },
  { id: "grad3", from: "#f43f5e", to: "#fb7185" },
  { id: "grad4", from: "#f97316", to: "#fb923c" },
  { id: "grad5", from: "#eab308", to: "#facc15" },
  { id: "grad6", from: "#22c55e", to: "#4ade80" },
  { id: "grad7", from: "#06b6d4", to: "#22d3ee" },
  { id: "grad8", from: "#3b82f6", to: "#60a5fa" },
  { id: "grad9", from: "#a855f7", to: "#c084fc" },
];

const CHART_TYPE_META: Record<string, { icon: typeof BarChart3; label: string; accent: string; accentTo: string }> = {
  bar: { icon: BarChart3, label: "Bar Chart", accent: "#6366f1", accentTo: "#818cf8" },
  line: { icon: TrendingUp, label: "Line Chart", accent: "#8b5cf6", accentTo: "#c084fc" },
  pie: { icon: PieChartIcon, label: "Pie Chart", accent: "#ec4899", accentTo: "#f472b6" },
  area: { icon: Activity, label: "Area Chart", accent: "#06b6d4", accentTo: "#22d3ee" },
};

interface ChartRendererProps {
  config: ChartConfig;
  data: Record<string, string | number>[];
  insight?: string;
  index?: number;
}

function GradientDefs() {
  return (
    <defs>
      {GRADIENTS.map((g) => (
        <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={g.from} stopOpacity={0.9} />
          <stop offset="100%" stopColor={g.to} stopOpacity={0.7} />
        </linearGradient>
      ))}
      {GRADIENTS.map((g) => (
        <linearGradient key={`${g.id}-area`} id={`${g.id}-area`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={g.from} stopOpacity={0.35} />
          <stop offset="100%" stopColor={g.to} stopOpacity={0.03} />
        </linearGradient>
      ))}
    </defs>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-white/80 bg-white/95 px-4 py-3 shadow-xl shadow-indigo-100/40 backdrop-blur-md">
      <p className="mb-1.5 text-xs font-semibold text-gray-900">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full shadow-sm"
            style={{ background: entry.color || entry.fill }}
          />
          <span className="text-gray-500">{entry.name}:</span>
          <span className="font-semibold text-gray-900">
            {typeof entry.value === "number"
              ? entry.value.toLocaleString()
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};
/* eslint-enable @typescript-eslint/no-explicit-any */

const ChartRenderer = forwardRef<HTMLDivElement, ChartRendererProps>(function ChartRenderer({ config, data, insight, index = 0 }, ref) {
  if (!data || data.length === 0) {
    return (
      <div className="glass-card flex h-64 flex-col items-center justify-center gap-2 rounded-2xl p-6">
        <BarChart3 className="h-8 w-8 text-gray-300" />
        <p className="text-sm text-muted-foreground">No data to display</p>
      </div>
    );
  }

  const yKeys = Array.isArray(config.y_key) ? config.y_key : [config.y_key];
  const meta = CHART_TYPE_META[config.type] || CHART_TYPE_META.bar;
  const TypeIcon = meta.icon;

  const commonProps = {
    data,
    margin: { top: 10, right: 20, left: 10, bottom: 5 },
  };

  const renderChart = () => {
    switch (config.type) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <GradientDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} strokeOpacity={0.5} />
            <XAxis
              dataKey={config.x_key}
              tick={{ fontSize: 11, fill: "#71717a", fontWeight: 500 }}
              axisLine={{ stroke: "#e4e4e7" }}
              tickLine={false}
              angle={data.length > 8 ? -45 : 0}
              textAnchor={data.length > 8 ? "end" : "middle"}
              height={data.length > 8 ? 80 : 30}
            />
            <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99, 102, 241, 0.04)" }} />
            {yKeys.length > 1 && (
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" iconSize={8} />
            )}
            {yKeys.map((key, i) =>
              yKeys.length === 1 ? (
                <Bar key={key} dataKey={key} radius={[8, 8, 0, 0]} barSize={data.length > 12 ? undefined : 36}>
                  {data.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={`url(#${GRADIENTS[idx % GRADIENTS.length].id})`} />
                  ))}
                </Bar>
              ) : (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={`url(#${GRADIENTS[i % GRADIENTS.length].id})`}
                  radius={[8, 8, 0, 0]}
                  barSize={data.length > 12 ? undefined : 28}
                />
              )
            )}
          </BarChart>
        );

      case "line":
        return (
          <LineChart {...commonProps}>
            <GradientDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} strokeOpacity={0.5} />
            <XAxis
              dataKey={config.x_key}
              tick={{ fontSize: 11, fill: "#71717a", fontWeight: 500 }}
              axisLine={{ stroke: "#e4e4e7" }}
              tickLine={false}
              angle={data.length > 8 ? -45 : 0}
              textAnchor={data.length > 8 ? "end" : "middle"}
              height={data.length > 8 ? 80 : 30}
            />
            <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {yKeys.length > 1 && (
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" iconSize={8} />
            )}
            {yKeys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: COLORS[i % COLORS.length] }}
                activeDot={{ r: 7, strokeWidth: 3, fill: COLORS[i % COLORS.length], stroke: "#fff" }}
              />
            ))}
          </LineChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            <GradientDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} strokeOpacity={0.5} />
            <XAxis
              dataKey={config.x_key}
              tick={{ fontSize: 11, fill: "#71717a", fontWeight: 500 }}
              axisLine={{ stroke: "#e4e4e7" }}
              tickLine={false}
              angle={data.length > 8 ? -45 : 0}
              textAnchor={data.length > 8 ? "end" : "middle"}
              height={data.length > 8 ? 80 : 30}
            />
            <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {yKeys.length > 1 && (
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" iconSize={8} />
            )}
            {yKeys.map((key, i) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[i % COLORS.length]}
                fill={`url(#${GRADIENTS[i % GRADIENTS.length].id}-area)`}
                strokeWidth={2.5}
              />
            ))}
          </AreaChart>
        );

      case "pie": {
        const RADIAN = Math.PI / 180;
        const renderLabel = (props: PieLabelRenderProps) => {
          const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props;
          const cxN = Number(cx);
          const cyN = Number(cy);
          const pct = Number(percent);
          if (pct < 0.04) return null;
          const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 1.45;
          const x = cxN + radius * Math.cos(-Number(midAngle) * RADIAN);
          const y = cyN + radius * Math.sin(-Number(midAngle) * RADIAN);
          return (
            <text
              x={x}
              y={y}
              fill="#374151"
              textAnchor={x > cxN ? "start" : "end"}
              dominantBaseline="central"
              fontSize={11}
              fontWeight={600}
            >
              {`${name}: ${(pct * 100).toFixed(0)}%`}
            </text>
          );
        };

        return (
          <PieChart>
            <GradientDefs />
            <Pie
              data={data}
              nameKey={config.x_key}
              dataKey={yKeys[0]}
              cx="50%"
              cy="50%"
              outerRadius={105}
              innerRadius={55}
              paddingAngle={3}
              label={renderLabel}
              labelLine={{ stroke: "#d1d5db", strokeWidth: 1 }}
              strokeWidth={2}
              stroke="#fff"
            >
              {data.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={`url(#${GRADIENTS[idx % GRADIENTS.length].id})`} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => (
                <span style={{ color: "#374151", fontWeight: 500 }}>{value}</span>
              )}
            />
          </PieChart>
        );
      }

      default:
        return (
          <BarChart {...commonProps}>
            <GradientDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
            <XAxis dataKey={config.x_key} tick={{ fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={yKeys[0]} radius={[8, 8, 0, 0]}>
              {data.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={`url(#${GRADIENTS[idx % GRADIENTS.length].id})`} />
              ))}
            </Bar>
          </BarChart>
        );
    }
  };

  return (
    <div
      ref={ref}
      className="glass-card glow-card overflow-hidden rounded-2xl animate-fade-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Gradient accent strip */}
      <div
        className="h-1.5"
        style={{
          background: `linear-gradient(90deg, ${meta.accent}, ${meta.accentTo}, transparent)`,
        }}
      />

      <div className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">{config.title}</h3>
          <div
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{ background: `${meta.accent}10` }}
          >
            <TypeIcon className="h-3 w-3" style={{ color: meta.accent }} />
            <span
              className="text-[10px] font-medium uppercase tracking-wider"
              style={{ color: meta.accent }}
            >
              {meta.label}
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>

        {/* Inline insight */}
        {insight && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-indigo-50/60 p-3.5">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
            <p className="text-xs leading-relaxed text-gray-700">{insight}</p>
          </div>
        )}
      </div>
    </div>
  );
});

export default ChartRenderer;
