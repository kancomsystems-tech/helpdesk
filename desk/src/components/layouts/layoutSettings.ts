import LucideAlertTriangle from "~icons/lucide/alert-triangle";
import LucideBookOpen from "~icons/lucide/book-open";
import LucideCircleGauge from "~icons/lucide/gauge-circle";
import LucideLayoutDashboard from "~icons/lucide/layout-dashboard";
import LucideLineChart from "~icons/lucide/line-chart";
import LucideTicket from "~icons/lucide/ticket";
import LucideUsersRound from "~icons/lucide/users-round";
import { OrganizationsIcon } from "../icons";
import { __ } from "@/translation";
import { travelosShellLabels } from "@/kancom/shell/navigation";

export const agentPortalSidebarOptions = [
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
    label: __("Escalations"),
    icon: LucideAlertTriangle,
    to: "TicketsAgent",
  },
  {
    label: __("SLA Monitor"),
    icon: LucideCircleGauge,
    to: "TicketsAgent",
  },
  {
    label: __(travelosShellLabels.customers),
    icon: OrganizationsIcon,
    to: "CustomerList",
  },
  {
    label: __("Reports"),
    icon: LucideLineChart,
    to: "AnalyticsDashboard",
  },
  {
    label: __(travelosShellLabels.knowledgeBase),
    icon: LucideBookOpen,
    to: "AgentKnowledgeBase",
  },
];

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
