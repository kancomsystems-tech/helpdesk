import type { KancomCapability } from "@/kancom/product/store";
import { kancomShellLabels } from "./labels";
import LucideActivity from "~icons/lucide/activity";
import LucideBarChart3 from "~icons/lucide/bar-chart-3";
import LucideLayoutDashboard from "~icons/lucide/layout-dashboard";
import LucideShieldCheck from "~icons/lucide/shield-check";
import LucideUsersRound from "~icons/lucide/users-round";

export const travelosShellLabels = {
  dashboard: "Operations Dashboard",
  tickets: "Travel Requests",
  customers: "Clients",
  knowledgeBase: kancomShellLabels.knowledgeBase,
  contacts: kancomShellLabels.contacts,
};

export const kancomSidebarLabels = {
  dashboard: travelosShellLabels.dashboard,
};

export type KancomPersona =
  | "administrator"
  | "operations_head"
  | "team_leader"
  | "agent"
  | null;

export function getKancomPersonaLabel(persona: KancomPersona) {
  if (!persona) return "";

  const labels: Record<Exclude<KancomPersona, null>, string> = {
    administrator: "Administrator",
    operations_head: "Operations Head",
    team_leader: "Team Leader",
    agent: "Agent",
  };
  return labels[persona];
}

export const travelosBrand = {
  product: "TravelOS",
  subtitle: "Travel Operations",
  poweredBy: "Powered by Kancom",
  icon: LucideActivity,
};

export const travelosModuleNavigation = [
  {
    label: "Operations",
    icon: LucideLayoutDashboard,
    to: { name: "Dashboard" },
    activeRoutes: ["Dashboard", "TicketsAgent", "CustomerList"],
    capability: "operations",
  },
  {
    label: "Analytics",
    icon: LucideBarChart3,
    to: { name: "AnalyticsDashboard" },
    activeRoutes: ["AnalyticsDashboard"],
    capability: "analytics",
  },
  {
    label: "Workforce",
    icon: LucideUsersRound,
    to: { name: "WorkforceDashboard" },
    activeRoutes: ["WorkforceDashboard"],
    capability: "workforce",
  },
  {
    label: "Quality",
    icon: LucideShieldCheck,
    to: { name: "QualityDashboard" },
    activeRoutes: ["QualityDashboard"],
    capability: "quality",
  },
] as const;

export function filterCapabilityNavigation<
  T extends { capability?: KancomCapability }
>(
  items: readonly T[],
  hasCapability: (capability: KancomCapability) => boolean
): T[] {
  return items.filter(
    (item) => !item.capability || hasCapability(item.capability)
  );
}

export const kancomSecondaryNavigation = {
  knowledgeBase: {
    label: travelosShellLabels.knowledgeBase,
    icon: "book-open",
    routeName: "AgentKnowledgeBase",
  },
  contacts: {
    label: travelosShellLabels.contacts,
    icon: "user",
    routeName: "ContactList",
  },
  kancomRequests: {
    label: "Kancom Requests",
    icon: "ticket",
    path: "/kancom-request",
    capability: "kancom_requests" as KancomCapability,
  },
  settings: {
    label: "Settings",
    icon: "settings",
  },
  docs: {
    label: "Help / Docs",
    icon: "book-open",
    url: "https://docs.frappe.io/helpdesk",
  },
  logout: {
    label: "Log out",
    icon: "log-out",
  },
};

export type KancomSetupPersona =
  | "administrator"
  | "operations_head"
  | "team_leader"
  | "agent"
  | null;

const operationalSetupTabs: Partial<
  Record<KancomSetupPersona & string, string[]>
> = {
  team_leader: ["Profile", "Saved Replies"],
  operations_head: ["Profile", "Teams", "Saved Replies"],
};

export function getKancomSetupTabs(
  persona: KancomSetupPersona,
  hasManagedConfiguration: boolean,
  hasNativeManagement: boolean
) {
  if (hasNativeManagement) {
    return kancomAdminSetupNavigation.items.map((item) => item.label);
  }
  if (!hasManagedConfiguration || !persona) return [];
  return operationalSetupTabs[persona] || [];
}

export const kancomAdminSetupNavigation = {
  group: "Setup",
  items: [
    { label: "Profile", icon: "user", settingsTab: "Profile" },
    { label: "Agents", icon: "user", settingsTab: "Agents" },
    { label: "Teams", icon: "users", settingsTab: "Teams" },
    {
      label: "Assignment Rules",
      icon: "settings",
      settingsTab: "Assignment Rules",
    },
    { label: "SLA Policies", icon: "shield", settingsTab: "SLA Policies" },
    {
      label: "Saved Replies",
      icon: "message-square",
      settingsTab: "Saved Replies",
    },
  ],
} as const;
