export type ProductAdministrationPersona =
  | "administrator"
  | "operations_head"
  | "team_leader"
  | "agent"
  | null;

export const productAdministrationTabs = {
  agent: ["Profile", "Saved Replies"],
  team_leader: ["Profile", "Setup Summary", "Team Members", "Saved Replies"],
  operations_head: [
    "Profile",
    "Setup Summary",
    "Team Members",
    "Saved Replies",
  ],
  operations_head_managed: ["Add User", "Agents", "Teams"],
  administrator: [
    "Add User",
    "Profile",
    "Saved Replies",
    "Team Members",
    "Agents",
    "Invite Agents",
    "Teams",
    "SLA Policies",
    "Business Holidays",
    "Assignment Rules",
    "Setup Summary",
    "Email Accounts",
    "Email Notifications",
    "General",
    "Field Dependencies",
    "Telephony",
  ],
} as const;

export function getKancomSetupTabs(
  authoritativePersona: ProductAdministrationPersona,
  hasManagedConfiguration: boolean,
  isPlatformAdministrator: boolean
): string[] {
  if (isPlatformAdministrator)
    return [...productAdministrationTabs.administrator];
  if (!authoritativePersona) return [];
  if (authoritativePersona === "operations_head") {
    return [
      ...productAdministrationTabs.operations_head,
      ...(hasManagedConfiguration
        ? productAdministrationTabs.operations_head_managed
        : []),
    ];
  }
  if (authoritativePersona === "team_leader") {
    return [...productAdministrationTabs.team_leader];
  }
  if (authoritativePersona === "agent") {
    return [...productAdministrationTabs.agent];
  }
  return [];
}
