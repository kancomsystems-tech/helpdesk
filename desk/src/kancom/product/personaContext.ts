import type { OperationalPersona, ProductContext } from "./store";

export const operationalPersonaLabels: Record<OperationalPersona, string> = {
  agent: "Agent",
  team_leader: "Team Leader",
  operations_head: "Operations Head",
};

export function shouldShowWorkingPersonaSwitcher(
  personas: OperationalPersona[],
  isPlatformAdministrator = false
) {
  return !isPlatformAdministrator && personas.length >= 2;
}

export function getWorkingPersonaOptions(personas: OperationalPersona[]) {
  return personas.map((value) => ({
    value,
    label: operationalPersonaLabels[value],
  }));
}

export function getWorkingPersonaLandingRoute() {
  return { name: "Dashboard" } as const;
}

export function toWorkingProductContext(
  context: ProductContext
): ProductContext {
  return {
    ...context,
    persona: context.session_operating_persona ?? context.working_persona,
    managed_teams: context.working_managed_teams,
  };
}
