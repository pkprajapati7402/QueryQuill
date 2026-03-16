"use client";

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

const CHART_TYPE_META: Record<string, { icon: typeof BarChart3; label: string }> = {
  bar: { icon: BarChart3, label: "Bar Chart" },
  line: { icon: TrendingUp, label: "Line Chart" },
  pie: { icon: PieChartIcon, label: "Pie Chart" },
  area: { icon: Activity, label: "Area Chart" },
};

interface ChartRendererProps {
  config: ChartConfig;
  data: Record<string, string | number>[];
  insight?: string;
  index?: number;
}

export default function ChartRenderer({ config, data, insight, index = 0 }: ChartRendererProps) {
  if (!data || data.length === 0) {
    return (
      <div className="glass-card flex h-64 flex-col items-center justify-center gap-2 rounded-2xl p-6">
        <BarChart3 className="h-8 w-8 text-gray-300" />
        <p className="text-sm text-muted-foreground">No data to display</p>
      </div>
    );
  }

  const yKeys = Array.isArray(config.y_key) ? config.y_key : [config.y_key];
  const color = config.color || COLORS[0];
  const meta = CHART_TYPE_META[config.type] || CHART_TYPE_META.bar;
  const TypeIcon = meta.icon;

  const tooltipStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(99, 102, 241, 0.12)",
    borderRadius: "12px",
    fontSize: "12px",
    color: "#0a0a0a",
    boxShadow: "0 4px 24px rgba(99, 102, 241, 0.1)",
  };

  const commonProps = {
    data,
    margin: { top: 5, right: 20, left: 10, bottom: 5 },
  };

  const renderChart = () => {
    switch (config.type) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis
              dataKey={config.x_key}
              tick={{ fontSize: 12, fill: "#71717a" }}
              angle={data.length > 8 ? -45 : 0}
              textAnchor={data.length > 8 ? "end" : "middle"}
              height={data.length > 8 ? 80 : 30}
            />
            <YAxis tick={{ fontSize: 12, fill: "#71717a" }} />
            <Tooltip contentStyle={tooltipStyle} />
            {yKeys.length > 1 && <Legend />}
            {yKeys.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                fill={COLORS[i % COLORS.length]}
                radius={[6, 6, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis
              dataKey={config.x_key}
              tick={{ fontSize: 12, fill: "#71717a" }}
              angle={data.length > 8 ? -45 : 0}
              textAnchor={data.length > 8 ? "end" : "middle"}
              height={data.length > 8 ? 80 : 30}
            />
            <YAxis tick={{ fontSize: 12, fill: "#71717a" }} />
            <Tooltip contentStyle={tooltipStyle} />
            {yKeys.length > 1 && <Legend />}
            {yKeys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis
              dataKey={config.x_key}
              tick={{ fontSize: 12, fill: "#71717a" }}
            />
            <YAxis tick={{ fontSize: 12, fill: "#71717a" }} />
            <Tooltip contentStyle={tooltipStyle} />
            {yKeys.length > 1 && <Legend />}
            {yKeys.map((key, i) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[i % COLORS.length]}
                fill={COLORS[i % COLORS.length]}
                fillOpacity={0.12}
                strokeWidth={2.5}
              />
            ))}
          </AreaChart>
        );

      case "pie":
        return (
          <PieChart>
            <Pie
              data={data}
              nameKey={config.x_key}
              dataKey={yKeys[0]}
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={50}
              paddingAngle={2}
              label={(props: PieLabelRenderProps) =>
                `${props.name ?? ""}: ${(((props.percent as number) ?? 0) * 100).toFixed(0)}%`
              }
              labelLine={true}
            >
              {data.map((_, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={COLORS[idx % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        );

      default:
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis dataKey={config.x_key} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey={yKeys[0]} fill={color} radius={[6, 6, 0, 0]} />
          </BarChart>
        );
    }
  };

  return (
    <div
      className="glass-card glow-card overflow-hidden rounded-2xl animate-fade-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Gradient accent strip */}
      <div
        className="h-1"
        style={{
          background: `linear-gradient(90deg, ${color}, ${color}44, transparent)`,
        }}
      />

      <div className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">{config.title}</h3>
          <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1">
            <TypeIcon className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
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
}
