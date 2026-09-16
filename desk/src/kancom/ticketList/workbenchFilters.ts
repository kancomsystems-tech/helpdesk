export type WorkbenchChipKey =
  | "control_view"
  | "my_assigned"
  | "my_queues"
  | "triage"
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
  { key: "my_queues", label: "My Queues", enabled: true },
  { key: "triage", label: "Triage", enabled: true },
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

export type PrimaryWorkbenchScope =
  | "control"
  | "assigned"
  | "queues"
  | "triage"
  | "team";

export interface WorkbenchProductContext {
  persona?:
    | "administrator"
    | "operations_head"
    | "team_leader"
    | "agent"
    | null;
  managed_teams?: string[];
  teams?: string[];
}

export interface PrimaryWorkbenchState {
  scope: PrimaryWorkbenchScope;
  team: string;
  filters: Record<string, any>;
}

const primaryFilterKeys = new Set(["_assign", "agent_group"]);

export function getQueueTeams(context?: WorkbenchProductContext | null) {
  if (!context) return [];
  const teams =
    context.persona === "agent" ? context.teams : context.managed_teams;
  return Array.from(new Set((teams || []).filter(Boolean))).sort();
}

export function canUseTriage(context?: WorkbenchProductContext | null) {
  return ["administrator", "operations_head"].includes(context?.persona || "");
}

export function getVisibleWorkbenchChips(
  context?: WorkbenchProductContext | null
) {
  return workbenchChips.filter(
    (chip) => chip.key !== "triage" || canUseTriage(context)
  );
}

export function getPrimaryWorkbenchFilters(
  scope: PrimaryWorkbenchScope,
  currentUser: string,
  queueTeams: string[],
  team?: string
) {
  if (scope === "assigned") {
    return currentUser ? { _assign: ["LIKE", "%" + currentUser + "%"] } : {};
  }
  if (scope === "queues") return { agent_group: ["in", queueTeams] };
  if (scope === "triage") return { agent_group: ["is", "not set"] };
  if (scope === "team" && team && queueTeams.includes(team)) {
    return { agent_group: team };
  }
  return {};
}

export function resolvePrimaryWorkbenchState(
  query: Record<string, any>,
  currentUser: string,
  context?: WorkbenchProductContext | null
): PrimaryWorkbenchState {
  const queueTeams = getQueueTeams(context);
  const requestedScope = String(
    query.scope || "control"
  ) as PrimaryWorkbenchScope;
  const requestedTeam = String(query.team || "");
  const allowedScopes: PrimaryWorkbenchScope[] = [
    "control",
    "assigned",
    "queues",
  ];

  if (canUseTriage(context)) allowedScopes.push("triage");
  if (requestedTeam && queueTeams.includes(requestedTeam)) {
    allowedScopes.push("team");
  }

  const scope = allowedScopes.includes(requestedScope)
    ? requestedScope
    : "control";
  const team = scope === "team" ? requestedTeam : "";
  return {
    scope,
    team,
    filters: getPrimaryWorkbenchFilters(scope, currentUser, queueTeams, team),
  };
}

export function replacePrimaryWorkbenchFilters(
  currentFilters: Record<string, any> = {},
  primaryFilters: Record<string, any> = {}
) {
  const secondaryFilters = Object.fromEntries(
    Object.entries(currentFilters).filter(
      ([key]) => !primaryFilterKeys.has(key)
    )
  );
  return { ...secondaryFilters, ...primaryFilters };
}

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
