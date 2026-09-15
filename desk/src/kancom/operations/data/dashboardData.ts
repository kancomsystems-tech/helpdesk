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
  route: string;
}

export interface DepartmentQueue {
  team: string;
  load: number;
  tone: HealthTone;
  route: string;
}

export interface OperationsSummary {
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

export const kpiDefinitions: Omit<OperationsKpi, "value">[] = [
  {
    label: "Total Requests Today",
    helper: "Requests created today",
    tone: "blue",
  },
  { label: "Pending", helper: "Open request inventory", tone: "warning" },
  {
    label: "SLA Overdue",
    helper: "Open requests with failed SLA",
    tone: "danger",
  },
  { label: "Closed Today", helper: "Requests resolved today", tone: "success" },
  {
    label: "Unassigned",
    helper: "Open requests without an owner",
    tone: "blue",
  },
];

export const attentionDefinitions: Omit<AttentionItem, "count">[] = [
  {
    label: "SLA Overdue",
    detail: "Failed first response or resolution clocks",
    tone: "danger",
    route: "/tickets",
  },
  {
    label: "Unassigned",
    detail: "Open requests waiting for ownership",
    tone: "blue",
    route: "/tickets",
  },
];
