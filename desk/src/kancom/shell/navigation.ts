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
  },
  {
    label: "Analytics",
    icon: LucideBarChart3,
    to: { name: "AnalyticsDashboard" },
    activeRoutes: ["AnalyticsDashboard"],
  },
  {
    label: "Workforce",
    icon: LucideUsersRound,
    to: { name: "WorkforceDashboard" },
    activeRoutes: ["WorkforceDashboard"],
  },
  {
    label: "Quality",
    icon: LucideShieldCheck,
    to: { name: "QualityDashboard" },
    activeRoutes: ["QualityDashboard"],
  },
] as const;

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

export const kancomAdminSetupNavigation = {
  group: "Setup",
  items: [
    {
      label: "Profile",
      icon: "user",
      settingsTab: "Profile",
    },
    {
      label: "Agents",
      icon: "user",
      settingsTab: "Agents",
    },
    {
      label: "Teams",
      icon: "users",
      settingsTab: "Teams",
    },
    {
      label: "Assignment Rules",
      icon: "settings",
      settingsTab: "Assignment Rules",
    },
    {
      label: "SLA Policies",
      icon: "shield",
      settingsTab: "SLA Policies",
    },
    {
      label: "Saved Replies",
      icon: "message-square",
      settingsTab: "Saved Replies",
    },
  ],
} as const;
