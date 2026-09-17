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
  | "client_sla_monitor"
  | "agent_availability"
  | "today_activity";

export type OperationsKpiCardState = "live" | "preview";
export type OperationsPersona =
  | "agent"
  | "team_leader"
  | "operations_head"
  | "administrator";

export interface OperationsKpiCardDefinition {
  id: OperationsKpiCardId;
  label: string;
  helper: string;
  state: OperationsKpiCardState;
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
    state: "live",
    defaultVisible: true,
    allowedPersonas: allOperationsPersonas,
    sourceField: "kpis.total_requests_today",
  },
  {
    id: "open_inventory",
    label: "Open Inventory",
    helper: "Current open request inventory",
    state: "live",
    defaultVisible: true,
    allowedPersonas: allOperationsPersonas,
    sourceField: "kpis.pending",
  },
  {
    id: "sla_breached",
    label: "SLA Breached",
    helper: "Current open requests with failed SLA",
    state: "live",
    defaultVisible: true,
    allowedPersonas: allOperationsPersonas,
    sourceField: "kpis.sla_overdue",
  },
  {
    id: "closed_today",
    label: "Requests Resolved",
    helper: "Requests resolved in the selected period",
    state: "live",
    defaultVisible: true,
    allowedPersonas: allOperationsPersonas,
    sourceField: "kpis.closed_today",
  },
  {
    id: "unassigned",
    label: "Unassigned",
    helper: "Current open requests without an owner",
    state: "live",
    defaultVisible: true,
    allowedPersonas: allOperationsPersonas,
    sourceField: "kpis.unassigned",
  },
  {
    id: "due_soon",
    label: "Due Soon",
    helper: "Upcoming SLA-risk requests",
    state: "preview",
    defaultVisible: false,
    allowedPersonas: allOperationsPersonas,
  },
  {
    id: "vip_priority",
    label: "VIP / Priority Requests",
    helper: "Priority client requests needing attention",
    state: "preview",
    defaultVisible: false,
    allowedPersonas: managementPersonas,
  },
  {
    id: "escalations",
    label: "Escalations",
    helper: "Requests requiring management attention",
    state: "preview",
    defaultVisible: false,
    allowedPersonas: managementPersonas,
  },
  {
    id: "my_queue",
    label: "My Queue",
    helper: "Assigned and waiting work in your queue",
    state: "preview",
    defaultVisible: false,
    allowedPersonas: allOperationsPersonas,
  },
  {
    id: "sla_performance",
    label: "SLA Performance",
    helper: "SLA health across operational teams",
    state: "preview",
    defaultVisible: false,
    allowedPersonas: managementPersonas,
  },
  {
    id: "client_sla_monitor",
    label: "Client SLA Monitor",
    helper: "Client requests approaching SLA risk",
    state: "preview",
    defaultVisible: false,
    allowedPersonas: managementPersonas,
  },
  {
    id: "agent_availability",
    label: "Agent Availability",
    helper: "Current agent availability by status",
    state: "preview",
    defaultVisible: false,
    allowedPersonas: managementPersonas,
  },
  {
    id: "today_activity",
    label: "Today's Activity",
    helper: "Recent operational events and changes",
    state: "preview",
    defaultVisible: false,
    allowedPersonas: managementPersonas,
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
