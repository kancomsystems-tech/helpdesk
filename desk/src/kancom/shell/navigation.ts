import type {
  KancomCapability,
  KancomEffectivePermission,
} from "@/kancom/product/store";
import type { KancomPersona } from "@/kancom/product/accessPolicy";
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
    analytics: true,
    effectivePermission: "view_analytics",
  },
  {
    label: "Workforce",
    icon: LucideUsersRound,
    to: { name: "WorkforceDashboard" },
    activeRoutes: ["WorkforceDashboard"],
    capability: "workforce",
    manager: true,
    effectivePermission: "view_workforce",
  },
  {
    label: "Quality",
    icon: LucideShieldCheck,
    to: { name: "QualityDashboard" },
    activeRoutes: ["QualityDashboard"],
    capability: "quality",
    manager: true,
    effectivePermission: "view_quality",
  },
] as const;

export function filterCapabilityNavigation<
  T extends {
    capability?: KancomCapability;
    manager?: boolean;
    admin?: boolean;
    analytics?: boolean;
    effectivePermission?: KancomEffectivePermission;
  }
>(
  items: readonly T[],
  hasCapability: (capability: KancomCapability) => boolean,
  hasManagerAccess = false,
  hasAdminAccess = false,
  hasAnalyticsAccess = false,
  hasEffectivePermission: (
    permission: KancomEffectivePermission
  ) => boolean = () => true
): T[] {
  return items.filter(
    (item) =>
      (!item.capability || hasCapability(item.capability)) &&
      (!item.manager || hasManagerAccess) &&
      (!item.admin || hasAdminAccess) &&
      (!item.analytics || hasAnalyticsAccess) &&
      (!item.effectivePermission ||
        hasEffectivePermission(item.effectivePermission))
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
  logout: {
    label: "Log out",
    icon: "log-out",
  },
};

export { getKancomSetupTabs } from "@/kancom/product/productAdministration";

export const kancomAdminSetupNavigation = {
  group: "Setup",
  items: [
    { label: "Profile", icon: "user", settingsTab: "Profile" },
    {
      label: "Setup Summary",
      icon: "clipboard",
      settingsTab: "Setup Summary",
    },
    {
      label: "Team Members",
      icon: "users",
      settingsTab: "Team Members",
    },
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
