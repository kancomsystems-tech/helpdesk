export type WorkbenchChipKey =
  | "control_view"
  | "my_assigned"
  | "team_open"
  | "client_replied"
  | "sla_risk"
  | "unassigned"
  | "closed";

export interface WorkbenchChip {
  key: WorkbenchChipKey;
  label: string;
  enabled: boolean;
  reason?: string;
}

export const workbenchChips: WorkbenchChip[] = [
  { key: "control_view", label: "Control View", enabled: true },
  { key: "my_assigned", label: "My Assigned", enabled: true },
  {
    key: "team_open",
    label: "Team Open",
    enabled: false,
    reason: "Parked until Kancom team ownership rules are defined.",
  },
  {
    key: "client_replied",
    label: "Follow-up",
    enabled: false,
    reason: "Parked until reply-state mapping is verified.",
  },
  {
    key: "sla_risk",
    label: "SLA Breached",
    enabled: false,
    reason: "Parked until SLA-breached query semantics are verified.",
  },
  {
    key: "unassigned",
    label: "Unassigned",
    enabled: false,
    reason: "Parked until empty-assignment filter semantics are verified.",
  },
  {
    key: "closed",
    label: "Closed",
    enabled: false,
    reason: "Parked to avoid silently replacing saved-view behavior.",
  },
];

function normalizeUserId(userId?: string | { value?: string }) {
  if (!userId) return "";
  if (typeof userId === "string") return userId;
  return userId.value || "";
}

export function getWorkbenchChipFilters(
  chip: WorkbenchChip,
  userId?: string | { value?: string }
) {
  const currentUser = normalizeUserId(userId);
  if (!chip.enabled) return null;
  if (chip.key === "control_view") return {};
  if (chip.key !== "my_assigned" || !currentUser) return null;

  return {
    _assign: ["LIKE", `%${currentUser}%`],
  };
}
