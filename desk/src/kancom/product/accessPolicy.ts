export type KancomPersona =
  | "administrator"
  | "operations_head"
  | "team_leader"
  | "agent"
  | null;

export function canAccessAnalytics(
  authoritativePersona: KancomPersona,
  isPlatformAdministrator: boolean
) {
  return isPlatformAdministrator || authoritativePersona === "operations_head";
}
