export type KpiTone = "default" | "blue" | "warning" | "yellow" | "danger" | "success";
export type HealthTone = "good" | "watch" | "warning" | "risk" | "neutral";

export interface OperationsKpi {
  label: string;
  value: string;
  helper: string;
  trend: string;
  comparison: string;
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
  focus: string;
  load: number;
  unread: number;
  pending: number;
  breached: number;
  sla: number;
  owner: string;
  availability: string;
  tone: HealthTone;
  route: string;
}

export interface ActivityItem {
  time: string;
  label: string;
  detail: string;
  tone: HealthTone;
}

export interface QueueState {
  label: string;
  value: number;
  tone: HealthTone;
}

export interface SlaStatusRow {
  label: string;
  value: number;
  tone: HealthTone;
}

export interface ClientSlaRow {
  client: string;
  status: string;
  detail: string;
  tone: HealthTone;
}

export interface AgentAvailabilitySlice {
  label: string;
  value: number;
  tone: HealthTone;
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

export const fallbackKpis: OperationsKpi[] = [
  {
    label: "Total Requests Today",
    value: "1,286",
    helper: "Across TravelOS queues",
    trend: "+12%",
    comparison: "vs yesterday",
    tone: "blue",
  },
  {
    label: "Pending",
    value: "214",
    helper: "Awaiting action",
    trend: "+8%",
    comparison: "vs yesterday",
    tone: "warning",
  },
  {
    label: "SLA Overdue",
    value: "7",
    helper: "Breached clocks",
    trend: "-3%",
    comparison: "vs yesterday",
    tone: "danger",
  },
  {
    label: "Due Soon",
    value: "18",
    helper: "Due in 15 minutes",
    trend: "+5%",
    comparison: "vs yesterday",
    tone: "yellow",
  },
  {
    label: "Closed Today",
    value: "842",
    helper: "Completed requests",
    trend: "+15%",
    comparison: "vs yesterday",
    tone: "success",
  },
];

export const attentionItems: AttentionItem[] = [
  {
    label: "SLA Overdue",
    detail: "Failed first response or resolution clocks",
    count: 7,
    tone: "danger",
    route: "/tickets",
  },
  {
    label: "SLA Expiring",
    detail: "Requests due inside the current service window",
    count: 18,
    tone: "yellow",
    route: "/tickets",
  },
  {
    label: "VIP / Priority Requests",
    detail: "Urgent movement, escalations and priority clients",
    count: 5,
    tone: "warning",
    route: "/tickets",
  },
  {
    label: "Escalations",
    detail: "Manager attention required before closure",
    count: 3,
    tone: "danger",
    route: "/tickets",
  },
  {
    label: "Unassigned",
    detail: "New intake waiting for ownership",
    count: 12,
    tone: "blue",
    route: "/tickets",
  },
];

export const departmentQueues: DepartmentQueue[] = [
  { team: "AirOps", focus: "Flights, changes, refunds", load: 245, unread: 34, pending: 65, breached: 7, sla: 98, owner: "Air Agent", availability: "Available", tone: "good", route: "/tickets" },
  { team: "MICE", focus: "Groups and corporate events", load: 87, unread: 11, pending: 23, breached: 2, sla: 82, owner: "ETS Agent", availability: "Watch", tone: "watch", route: "/tickets" },
  { team: "Corporate", focus: "Corporate service desk", load: 52, unread: 7, pending: 18, breached: 2, sla: 91, owner: "Air Agent", availability: "Stable", tone: "good", route: "/tickets" },
  { team: "Refunds", focus: "Airline and vendor refunds", load: 42, unread: 7, pending: 19, breached: 4, sla: 74, owner: "Air Agent", availability: "Risk", tone: "risk", route: "/tickets" },
  { team: "HotelOps", focus: "Hotels and confirmations", load: 38, unread: 6, pending: 14, breached: 1, sla: 90, owner: "Hotel Agent", availability: "Available", tone: "good", route: "/tickets" },
  { team: "VisaOps", focus: "Documents and consular tracking", load: 29, unread: 4, pending: 11, breached: 2, sla: 88, owner: "Visa Agent", availability: "Focused", tone: "watch", route: "/tickets" },
  { team: "Finance", focus: "Approvals and billing follow-up", load: 24, unread: 3, pending: 9, breached: 1, sla: 85, owner: "Air Agent", availability: "Stable", tone: "good", route: "/tickets" },
  { team: "Complaints", focus: "Service recovery and issue closure", load: 15, unread: 2, pending: 6, breached: 2, sla: 78, owner: "Hotel Agent", availability: "Watch", tone: "watch", route: "/tickets" },
  { team: "ETS", focus: "Employee transport service", load: 29, unread: 4, pending: 11, breached: 0, sla: 93, owner: "ETS Agent", availability: "Available", tone: "good", route: "/tickets" },
  { team: "Others", focus: "General travel support", load: 16, unread: 2, pending: 7, breached: 1, sla: 89, owner: "Visa Agent", availability: "Stable", tone: "good", route: "/tickets" },
];

export const myQueueStates: QueueState[] = [
  { label: "Assigned to Me", value: 41, tone: "good" },
  { label: "Unread", value: 12, tone: "neutral" },
  { label: "Waiting Customer", value: 8, tone: "watch" },
  { label: "Waiting Vendor/Airline", value: 11, tone: "watch" },
  { label: "Follow-up Today", value: 9, tone: "neutral" },
  { label: "Overdue", value: 2, tone: "risk" },
  { label: "Closed Today", value: 39, tone: "good" },
];

export const slaStatusRows: SlaStatusRow[] = [
  { label: "AirOps", value: 98, tone: "good" },
  { label: "MICE", value: 82, tone: "watch" },
  { label: "Corporate", value: 91, tone: "good" },
  { label: "Refunds", value: 74, tone: "risk" },
  { label: "VisaOps", value: 88, tone: "watch" },
];

export const recentActivity: ActivityItem[] = [
  { time: "09:35", label: "Refund queue crossed SLA", detail: "AirOps manager review opened", tone: "risk" },
  { time: "09:31", label: "Kapil assigned 12 requests", detail: "Unassigned intake moved to owners", tone: "neutral" },
  { time: "09:28", label: "VIP complaint received", detail: "Escalation card added to manager rail", tone: "risk" },
  { time: "09:25", label: "Supervisor closed escalation", detail: "Hotel vendor issue completed", tone: "good" },
  { time: "09:17", label: "Corporate queue cleared", detail: "Pending count back under threshold", tone: "good" },
];

export const clientSlaMonitor: ClientSlaRow[] = [
  { client: "ABC Travels", status: "8m left", detail: "Domestic air request", tone: "watch" },
  { client: "XYZ Holidays", status: "Overdue", detail: "Hotel vendor confirmation", tone: "risk" },
  { client: "Google Travel", status: "Healthy", detail: "Corporate desk", tone: "good" },
];

export const agentAvailability: AgentAvailabilitySlice[] = [
  { label: "Online", value: 28, tone: "good" },
  { label: "Busy", value: 12, tone: "watch" },
  { label: "Break", value: 3, tone: "warning" },
  { label: "Offline", value: 6, tone: "neutral" },
];
