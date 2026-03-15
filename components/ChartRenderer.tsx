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

interface ChartRendererProps {
  config: ChartConfig;
  data: Record<string, string | number>[];
}

export default function ChartRenderer({ config, data }: ChartRendererProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        No data to display
      </div>
    );
  }

  const yKeys = Array.isArray(config.y_key) ? config.y_key : [config.y_key];
  const color = config.color || COLORS[0];

  const commonProps = {
    data,
    margin: { top: 5, right: 20, left: 10, bottom: 5 },
  };

  const renderChart = () => {
    switch (config.type) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey={config.x_key}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              angle={data.length > 8 ? -45 : 0}
              textAnchor={data.length > 8 ? "end" : "middle"}
              height={data.length > 8 ? 80 : 30}
            />
            <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "var(--foreground)",
              }}
            />
            {yKeys.length > 1 && <Legend />}
            {yKeys.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                fill={COLORS[i % COLORS.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey={config.x_key}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              angle={data.length > 8 ? -45 : 0}
              textAnchor={data.length > 8 ? "end" : "middle"}
              height={data.length > 8 ? 80 : 30}
            />
            <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "var(--foreground)",
              }}
            />
            {yKeys.length > 1 && <Legend />}
            {yKeys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey={config.x_key}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "var(--foreground)",
              }}
            />
            {yKeys.length > 1 && <Legend />}
            {yKeys.map((key, i) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[i % COLORS.length]}
                fill={COLORS[i % COLORS.length]}
                fillOpacity={0.15}
                strokeWidth={2}
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
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "var(--foreground)",
              }}
            />
          </PieChart>
        );

      default:
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey={config.x_key} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey={yKeys[0]} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        );
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 text-sm font-semibold">{config.title}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
