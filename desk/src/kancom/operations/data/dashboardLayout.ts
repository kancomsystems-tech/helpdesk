export type OperationsKpiCardId =
  | "created_today"
  | "open_inventory"
  | "sla_breached"
  | "closed_today"
  | "unassigned"
  | "due_soon"
  | "vip_priority"
  | "escalations"
  | "my_queue"
  | "sla_performance"
  | "team_sla_performance"
  | "client_sla_monitor"
  | "agent_availability"
  | "today_activity"
  | "client_wise_open"
  | "team_wise_open"
  | "product_wise_open"
  | "category_wise_open"
  | "workload_by_team"
  | "actionable_waiting"
  | "created_resolved"
  | "sla_outcome";

export type OperationsKpiCardType =
  | "live_scalar"
  | "live_breakdown"
  | "live_visual"
  | "preview";
export type OperationsItemGroup = "kpis" | "breakdowns" | "visuals" | "preview";
export type OperationsItemState = "live" | "preview";
export type OperationsPersona =
  | "agent"
  | "team_leader"
  | "operations_head"
  | "administrator";

export interface OperationsKpiCardDefinition {
  id: OperationsKpiCardId;
  label: string;
  helper: string;
  type: OperationsKpiCardType;
  group: OperationsItemGroup;
  state: OperationsItemState;
  defaultVisible: boolean;
  allowedPersonas: OperationsPersona[];
  sourceField?: string;
}

export interface OperationsKpiLayoutPreference {
  order: OperationsKpiCardId[];
  hidden: OperationsKpiCardId[];
}

const allOperationsPersonas: OperationsPersona[] = [
  "agent",
  "team_leader",
  "operations_head",
  "administrator",
];
const managementPersonas: OperationsPersona[] = [
  "team_leader",
  "operations_head",
  "administrator",
];

export const operationsKpiCardLibrary: OperationsKpiCardDefinition[] = [
  {
    id: "created_today",
    label: "Requests Created",
    helper: "Requests created in the selected period",
    type: "live_scalar",
    group: "kpis",
    state: "live",
    defaultVisible: true,
    allowedPersonas: allOperationsPersonas,
    sourceField: "kpis.total_requests_today",
  },
  {
    id: "open_inventory",
    label: "Open Inventory",
    helper: "Current open and paused request inventory",
    type: "live_scalar",
    group: "kpis",
    state: "live",
    defaultVisible: true,
    allowedPersonas: allOperationsPersonas,
    sourceField: "kpis.pending",
  },
  {
    id: "sla_breached",
    label: "SLA Breached",
    helper: "Current open requests with failed SLA",
    type: "live_scalar",
    group: "kpis",
    state: "live",
    defaultVisible: true,
    allowedPersonas: allOperationsPersonas,
    sourceField: "kpis.sla_overdue",
  },
  {
    id: "closed_today",
    label: "Requests Resolved",
    helper: "Requests resolved in the selected period",
    type: "live_scalar",
    group: "kpis",
    state: "live",
    defaultVisible: true,
    allowedPersonas: allOperationsPersonas,
    sourceField: "kpis.closed_today",
  },
  {
    id: "unassigned",
    label: "Unassigned",
    helper: "Current open requests without an owner",
    type: "live_scalar",
    group: "kpis",
    state: "live",
    defaultVisible: true,
    allowedPersonas: allOperationsPersonas,
    sourceField: "kpis.unassigned",
  },
  {
    id: "due_soon",
    label: "Due Soon",
    helper: "Active SLA deadline due within 60 minutes",
    type: "live_scalar",
    group: "kpis",
    state: "live",
    defaultVisible: false,
    allowedPersonas: allOperationsPersonas,
    sourceField: "kpis.due_soon",
  },
  {
    id: "vip_priority",
    label: "High Priority Requests",
    helper: "Open or paused requests with High or Urgent priority",
    type: "live_scalar",
    group: "kpis",
    state: "live",
    defaultVisible: false,
    allowedPersonas: managementPersonas,
    sourceField: "kpis.high_priority",
  },
  {
    id: "escalations",
    label: "Escalations",
    helper: "Requests requiring management attention",
    type: "preview",
    group: "preview",
    state: "preview",
    defaultVisible: false,
    allowedPersonas: managementPersonas,
  },
  {
    id: "my_queue",
    label: "My Assigned",
    helper: "Open or paused requests assigned directly to you",
    type: "live_scalar",
    group: "kpis",
    state: "live",
    defaultVisible: false,
    allowedPersonas: allOperationsPersonas,
    sourceField: "kpis.my_assigned",
  },
  {
    id: "sla_performance",
    label: "SLA Performance",
    helper: "SLA met across evaluated requests",
    type: "live_scalar",
    group: "kpis",
    state: "live",
    sourceField: "sla_performance.percentage",
    defaultVisible: false,
    allowedPersonas: managementPersonas,
  },
  {
    id: "team_sla_performance",
    label: "Team SLA Performance",
    helper: "SLA met by team across evaluated requests",
    type: "live_breakdown",
    group: "breakdowns",
    state: "live",
    defaultVisible: false,
    allowedPersonas: managementPersonas,
    sourceField: "breakdowns.team_sla_performance",
  },
  {
    id: "client_sla_monitor",
    label: "Client SLA Breaches",
    helper: "Top clients by current open SLA breaches",
    type: "live_breakdown",
    group: "breakdowns",
    state: "live",
    defaultVisible: false,
    allowedPersonas: managementPersonas,
    sourceField: "breakdowns.client_sla_breaches",
  },
  {
    id: "agent_availability",
    label: "Agent Availability",
    helper: "Current agent availability by status",
    type: "preview",
    group: "preview",
    state: "preview",
    defaultVisible: false,
    allowedPersonas: managementPersonas,
  },
  {
    id: "today_activity",
    label: "Today's Activity",
    helper: "Recent operational events and changes",
    type: "preview",
    group: "preview",
    state: "preview",
    defaultVisible: false,
    allowedPersonas: managementPersonas,
  },
  {
    id: "client_wise_open",
    label: "Client-wise Open",
    helper: "Top clients by open and paused requests",
    type: "live_breakdown",
    group: "breakdowns",
    state: "live",
    defaultVisible: false,
    allowedPersonas: allOperationsPersonas,
    sourceField: "breakdowns.clients",
  },
  {
    id: "team_wise_open",
    label: "Team-wise Open",
    helper: "Top teams by open and paused requests",
    type: "live_breakdown",
    group: "breakdowns",
    state: "live",
    defaultVisible: false,
    allowedPersonas: allOperationsPersonas,
    sourceField: "breakdowns.teams",
  },
  {
    id: "product_wise_open",
    label: "Product-wise Open",
    helper: "Top products by open and paused requests",
    type: "live_breakdown",
    group: "breakdowns",
    state: "live",
    defaultVisible: false,
    allowedPersonas: allOperationsPersonas,
    sourceField: "breakdowns.products",
  },
  {
    id: "category_wise_open",
    label: "Category-wise Open",
    helper: "Top categories by open and paused requests",
    type: "live_breakdown",
    group: "breakdowns",
    state: "live",
    defaultVisible: false,
    allowedPersonas: allOperationsPersonas,
    sourceField: "breakdowns.categories",
  },
  {
    id: "workload_by_team",
    label: "Workload by Team",
    helper: "Relative unresolved workload by team; counts show actual workload",
    type: "live_visual",
    group: "visuals",
    state: "live",
    defaultVisible: false,
    allowedPersonas: allOperationsPersonas,
    sourceField: "visuals.workload_by_team",
  },
  {
    id: "actionable_waiting",
    label: "Actionable vs Waiting",
    helper: "Current open and paused workload composition",
    type: "live_visual",
    group: "visuals",
    state: "live",
    defaultVisible: false,
    allowedPersonas: allOperationsPersonas,
    sourceField: "visuals.actionable_waiting",
  },
  {
    id: "created_resolved",
    label: "Created vs Resolved",
    helper: "Requests created and resolved in the selected period",
    type: "live_visual",
    group: "visuals",
    state: "live",
    defaultVisible: false,
    allowedPersonas: allOperationsPersonas,
    sourceField: "visuals.created_resolved",
  },
  {
    id: "sla_outcome",
    label: "SLA Outcome",
    helper: "Met and breached outcomes across evaluated requests",
    type: "live_visual",
    group: "visuals",
    state: "live",
    defaultVisible: false,
    allowedPersonas: managementPersonas,
    sourceField: "sla_performance",
  },
];

export const defaultOperationsKpiOrder = operationsKpiCardLibrary.map(
  (card) => card.id
);
export const defaultVisibleOperationsKpiIds = operationsKpiCardLibrary
  .filter((card) => card.defaultVisible)
  .map((card) => card.id);

export function getAvailableOperationsKpiIds(
  persona: string | null | undefined,
  hasOperationsCapability: boolean
) {
  if (!hasOperationsCapability) return [];
  return operationsKpiCardLibrary
    .filter((card) =>
      card.allowedPersonas.includes(persona as OperationsPersona)
    )
    .map((card) => card.id);
}

function uniqueAllowedIds(values: unknown, allowed: Set<OperationsKpiCardId>) {
  if (!Array.isArray(values)) return [];
  return Array.from(
    new Set(
      values.filter(
        (value): value is OperationsKpiCardId =>
          typeof value === "string" && allowed.has(value as OperationsKpiCardId)
      )
    )
  );
}

export function resolveOperationsKpiLayout(
  preference: unknown,
  availableIds: OperationsKpiCardId[] = defaultOperationsKpiOrder
): OperationsKpiLayoutPreference {
  const allowedIds = defaultOperationsKpiOrder.filter((id) =>
    availableIds.includes(id)
  );
  const allowed = new Set(allowedIds);
  if (!preference || typeof preference !== "object") {
    return {
      order: allowedIds,
      hidden: allowedIds.filter(
        (id) => !defaultVisibleOperationsKpiIds.includes(id)
      ),
    };
  }

  const value = preference as Partial<OperationsKpiLayoutPreference>;
  if (!Array.isArray(value.order)) {
    return resolveOperationsKpiLayout(null, availableIds);
  }
  const requestedOrder = uniqueAllowedIds(value.order, allowed);
  const newlyAvailable = allowedIds.filter(
    (id) => !requestedOrder.includes(id)
  );
  return {
    order: [...requestedOrder, ...newlyAvailable],
    hidden: Array.from(
      new Set([
        ...uniqueAllowedIds(value.hidden, allowed),
        ...newlyAvailable.filter(
          (id) => !defaultVisibleOperationsKpiIds.includes(id)
        ),
      ])
    ),
  };
}

export function getVisibleOperationsKpiIds(
  preference: unknown,
  availableIds: OperationsKpiCardId[] = defaultOperationsKpiOrder
) {
  const layout = resolveOperationsKpiLayout(preference, availableIds);
  return layout.order.filter((id) => !layout.hidden.includes(id));
}

export function parseOperationsKpiPreference(settings: unknown) {
  if (typeof settings === "string") {
    try {
      settings = JSON.parse(settings);
    } catch {
      return null;
    }
  }
  if (!settings || typeof settings !== "object") return null;
  return (settings as Record<string, unknown>).kpi_layout ?? null;
}
