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
    enabled: true,
  },
  {
    key: "unassigned",
    label: "Unassigned",
    enabled: true,
  },
  {
    key: "closed",
    label: "Closed",
    enabled: true,
  },
];

export type PrimaryWorkbenchScope =
  | "control"
  | "assigned"
  | "queues"
  | "triage"
  | "team"
  | "sla_breached"
  | "unassigned"
  | "closed";

export interface WorkbenchProductContext {
  persona?:
    | "administrator"
    | "operations_head"
    | "team_leader"
    | "agent"
    | null;
  managed_teams?: string[];
  teams?: string[];
  effective_permissions?: string[];
}

export interface PrimaryWorkbenchState {
  scope: PrimaryWorkbenchScope;
  team: string;
  filters: Record<string, any>;
}

const primaryFilterKeys = new Set([
  "_assign",
  "agent_group",
  "agreement_status",
  "status_category",
]);

export const SLA_BREACHED_AGREEMENT_STATUS = "Failed";
export const RESOLVED_STATUS_CATEGORY = "Resolved";

export const exceptionScopeFilters = {
  sla_breached: { agreement_status: SLA_BREACHED_AGREEMENT_STATUS },
  unassigned: { _assign: ["is", "not set"] },
  closed: { status_category: RESOLVED_STATUS_CATEGORY },
} as const;

export function getQueueTeams(context?: WorkbenchProductContext | null) {
  if (!context) return [];
  const teams =
    context.persona === "agent" ? context.teams : context.managed_teams;
  return Array.from(new Set((teams || []).filter(Boolean))).sort();
}

export function canUseTriage(context?: WorkbenchProductContext | null) {
  return hasEffectivePermission(context, "view_control");
}

export function hasEffectivePermission(
  context: WorkbenchProductContext | null | undefined,
  permission: string
) {
  return Boolean(context?.effective_permissions?.includes(permission));
}

export function getVisibleWorkbenchChips(
  context?: WorkbenchProductContext | null
) {
  return workbenchChips.filter((chip) => {
    if (["control_view", "triage"].includes(chip.key)) {
      return hasEffectivePermission(context, "view_control");
    }
    if (chip.key === "unassigned") {
      return hasEffectivePermission(context, "view_unassigned");
    }
    return true;
  });
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
  const exceptionFilters =
    exceptionScopeFilters[scope as keyof typeof exceptionScopeFilters];
  if (exceptionFilters) return { ...exceptionFilters };
  return {};
}

export function resolvePrimaryWorkbenchState(
  query: Record<string, any>,
  currentUser: string,
  context?: WorkbenchProductContext | null
): PrimaryWorkbenchState {
  const queueTeams = getQueueTeams(context);
  const defaultScope = hasEffectivePermission(context, "view_control")
    ? "control"
    : "queues";
  const requestedScope = String(
    query.scope || defaultScope
  ) as PrimaryWorkbenchScope;
  const requestedTeam = String(query.team || "");
  const allowedScopes: PrimaryWorkbenchScope[] = [
    "assigned",
    "queues",
    "sla_breached",
    "closed",
  ];

  if (hasEffectivePermission(context, "view_control")) {
    allowedScopes.push("control");
  }
  if (hasEffectivePermission(context, "view_unassigned")) {
    allowedScopes.push("unassigned");
  }
  if (canUseTriage(context)) allowedScopes.push("triage");
  if (requestedTeam && queueTeams.includes(requestedTeam)) {
    allowedScopes.push("team");
  }

  const scope = allowedScopes.includes(requestedScope)
    ? requestedScope
    : defaultScope;
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
