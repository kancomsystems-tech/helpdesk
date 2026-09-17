export type OperationsKpiCardId =
  | "created_today"
  | "open_inventory"
  | "sla_breached"
  | "closed_today"
  | "unassigned";

export interface OperationsKpiLayoutPreference {
  order: OperationsKpiCardId[];
  hidden: OperationsKpiCardId[];
}

export const operationsKpiCardLibrary: Array<{
  id: OperationsKpiCardId;
  label: string;
}> = [
  { id: "created_today", label: "Requests Created" },
  { id: "open_inventory", label: "Open Inventory" },
  { id: "sla_breached", label: "SLA Breached" },
  { id: "closed_today", label: "Requests Resolved" },
  { id: "unassigned", label: "Unassigned" },
];

export const defaultOperationsKpiOrder = operationsKpiCardLibrary.map(
  (card) => card.id
);

export function getAvailableOperationsKpiIds(
  persona: string | null | undefined,
  hasOperationsCapability: boolean
) {
  if (
    !hasOperationsCapability ||
    !["agent", "team_leader", "operations_head", "administrator"].includes(
      persona || ""
    )
  ) {
    return [];
  }
  return [...defaultOperationsKpiOrder];
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
    return { order: allowedIds, hidden: [] };
  }

  const value = preference as Partial<OperationsKpiLayoutPreference>;
  const requestedOrder = uniqueAllowedIds(value.order, allowed);
  const order = [
    ...requestedOrder,
    ...allowedIds.filter((id) => !requestedOrder.includes(id)),
  ];
  return {
    order,
    hidden: uniqueAllowedIds(value.hidden, allowed),
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
