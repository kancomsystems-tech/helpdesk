export type KpiTone =
  | "default"
  | "blue"
  | "warning"
  | "yellow"
  | "danger"
  | "success";
export type HealthTone = "good" | "watch" | "warning" | "risk" | "neutral";

export interface OperationsKpi {
  label: string;
  value: string;
  helper: string;
  tone?: KpiTone;
}

export interface AttentionItem {
  label: string;
  detail: string;
  count: number;
  tone: KpiTone;
}

export interface DepartmentQueue {
  team: string;
  load: number;
  tone: HealthTone;
  route: string;
}

export type OperationsPeriod =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days";

export interface OperationsSummary {
  period: OperationsPeriod;
  period_label: string;
  from_date: string;
  to_date: string;
  generated_at: string;
  timezone: string;
  scope: {
    type: "personal" | "managed_teams" | "global";
    teams: string[];
  };
  kpis: {
    total_requests_today: number;
    pending: number;
    sla_overdue: number;
    closed_today: number;
    unassigned: number;
  };
  department_load: Array<{
    team: string;
    load: number;
  }>;
}

export const attentionDefinitions: Omit<AttentionItem, "count">[] = [
  {
    label: "SLA Overdue",
    detail: "Failed first response or resolution clocks",
    tone: "danger",
  },
  {
    label: "Unassigned",
    detail: "Open requests waiting for ownership",
    tone: "blue",
  },
];
