export type KPICategory =
  | "revenue"
  | "growth"
  | "distribution"
  | "volume"
  | "efficiency"
  | "comparison"
  | "ranking"
  | "temporal";

export type KPIFormat = "number" | "currency" | "percentage" | "decimal" | "text";

export interface KPIDefinition {
  label: string;
  sql: string;
  description: string;
  category: KPICategory;
  format: KPIFormat;
  trendSQL?: string;
  icon?: string;
}

export interface MiniChartDefinition {
  label: string;
  sql: string;
  chartType: "sparkline" | "minibar" | "donut";
  xKey: string;
  yKey: string;
}

export interface KPIDashboardAIResponse {
  kpis: KPIDefinition[];
  miniCharts: MiniChartDefinition[];
  dashboardTitle: string;
  error: string | null;
}

export interface ResolvedKPI {
  label: string;
  value: string | number;
  description: string;
  category: KPICategory;
  format: KPIFormat;
  trendValue?: string | number;
  changePercent?: number;
  icon?: string;
}

export interface ResolvedMiniChart {
  label: string;
  data: Record<string, string | number>[];
  chartType: "sparkline" | "minibar" | "donut";
  xKey: string;
  yKey: string;
}

export interface KPIDashboardData {
  kpis: ResolvedKPI[];
  miniCharts: ResolvedMiniChart[];
  dashboardTitle: string;
}
