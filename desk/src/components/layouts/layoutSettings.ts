import LucideBookOpen from "~icons/lucide/book-open";
import LucideLayoutDashboard from "~icons/lucide/layout-dashboard";
import LucideLineChart from "~icons/lucide/line-chart";
import LucideTicket from "~icons/lucide/ticket";
import LucideUsersRound from "~icons/lucide/users-round";
import { OrganizationsIcon } from "../icons";
import { __ } from "@/translation";
import { travelosShellLabels } from "@/kancom/shell/navigation";

const basicReportsPath = "/app/hd-ticket/view/report";

export function getAgentPortalSidebarOptions(
  hasCapability: (capability: "analytics" | "basic_reports") => boolean
) {
  const reports = hasCapability("analytics")
    ? {
        label: __("Reports"),
        icon: LucideLineChart,
        to: "AnalyticsDashboard",
      }
    : hasCapability("basic_reports")
    ? {
        label: __("Reports"),
        icon: LucideLineChart,
        onClick: () => window.location.assign(basicReportsPath),
      }
    : null;

  return [
    {
      label: __("My Queues"),
      icon: LucideLayoutDashboard,
      to: { name: "TicketsAgent", query: { scope: "queues" } },
    },
    {
      label: __(travelosShellLabels.tickets),
      icon: LucideTicket,
      to: "TicketsAgent",
    },
    {
      label: __("Team Queues"),
      icon: LucideUsersRound,
      to: { name: "TicketsAgent", query: { scope: "queues" } },
    },
    {
      label: __(travelosShellLabels.customers),
      icon: OrganizationsIcon,
      to: "CustomerList",
    },
    ...(reports ? [reports] : []),
    {
      label: __(travelosShellLabels.knowledgeBase),
      icon: LucideBookOpen,
      to: "AgentKnowledgeBase",
    },
  ];
}

export const customerPortalSidebarOptions = [
  {
    label: __(travelosShellLabels.tickets),
    icon: LucideTicket,
    to: "TicketsCustomer",
  },
  {
    label: __(travelosShellLabels.knowledgeBase),
    icon: LucideBookOpen,
    to: "CustomerKnowledgeBase",
  },
];
