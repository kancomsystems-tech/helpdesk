export type WorkbenchVisibilityMetricTone = "default" | "risk";

export interface WorkbenchVisibilityMetric {
  key: "open" | "sla_breached" | "unassigned" | "closed";
  label: string;
  value: number;
  tone?: WorkbenchVisibilityMetricTone;
}

type TicketRow = Record<string, any>;
type TicketStatus = { category?: string } | undefined;
type GetStatus = (status?: string) => TicketStatus;

// Failed represents a breached first-response or final-resolution SLA in the compact strip.
const slaBreachedStatuses = new Set(["Failed"]);

function parseAssignments(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value !== "string") return [];

  const trimmed = value.trim();
  if (!trimmed || trimmed === "[]") return [];

  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return trimmed ? [trimmed] : [];
  }
}

function isOpen(row: TicketRow, getStatus: GetStatus) {
  return getStatus(row.status)?.category === "Open" || row.status === "Open";
}

function isClosed(row: TicketRow, getStatus: GetStatus) {
  return getStatus(row.status)?.category === "Resolved" || row.status === "Closed";
}

function isSlaBreached(row: TicketRow) {
  return slaBreachedStatuses.has(row.agreement_status);
}

function isUnassigned(row: TicketRow) {
  return parseAssignments(row._assign).length === 0;
}

export function getWorkbenchVisibilityMetrics(
  rows: TicketRow[] = [],
  getStatus: GetStatus
): WorkbenchVisibilityMetric[] {
  return [
    {
      key: "open",
      label: "Open",
      value: rows.filter((row) => isOpen(row, getStatus)).length,
    },
    {
      key: "sla_breached",
      label: "SLA Breached",
      value: rows.filter(isSlaBreached).length,
      tone: "risk",
    },
    {
      key: "unassigned",
      label: "Unassigned",
      value: rows.filter(isUnassigned).length,
    },
    {
      key: "closed",
      label: "Closed",
      value: rows.filter((row) => isClosed(row, getStatus)).length,
    },
  ];
}
