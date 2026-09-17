export interface AnalyticsKpis {
  total_requests: number;
  resolved: number;
  open_inventory: number;
  sla_breached_current: number;
  avg_response_seconds: number | null;
  avg_resolution_seconds: number | null;
}

export interface AnalyticsTrendPoint {
  date: string;
  count: number;
}

export interface AnalyticsTeamSla {
  team: string;
  evaluated_count: number;
  fulfilled_count: number;
  sla_percent: number | null;
}

export interface AnalyticsResolutionItem {
  category: string;
  count: number;
}

export interface AnalyticsClientPerformance {
  client: string;
  requests: number;
  evaluated_count: number;
  fulfilled_count: number;
  sla_percent: number | null;
  previous_requests: number;
  trend_percent: number | null;
}

export interface AnalyticsSummary {
  from_date: string;
  to_date: string;
  period_label: string;
  generated_at: string;
  timezone: string;
  scope: {
    type: "global";
    teams: string[];
  };
  kpis: AnalyticsKpis;
  request_trend: AnalyticsTrendPoint[];
  sla_by_team: AnalyticsTeamSla[];
  resolution_mix: AnalyticsResolutionItem[];
  clients: AnalyticsClientPerformance[];
  agent_performance: {
    state: "preview";
    reason: string;
  };
}

export const analyticsPeriodOptions = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
] as const;
