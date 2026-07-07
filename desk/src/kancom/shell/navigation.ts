import { kancomShellLabels } from "./labels";

export const kancomSidebarLabels = {
  dashboard: kancomShellLabels.dashboard,
};

export const kancomSecondaryNavigation = {
  knowledgeBase: {
    label: kancomShellLabels.knowledgeBase,
    icon: "book-open",
    routeName: "AgentKnowledgeBase",
  },
  contacts: {
    label: kancomShellLabels.contacts,
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
