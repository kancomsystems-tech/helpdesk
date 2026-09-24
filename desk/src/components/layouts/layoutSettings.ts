import LucideBookOpen from "~icons/lucide/book-open";
import LucideLayoutDashboard from "~icons/lucide/layout-dashboard";
import LucideLineChart from "~icons/lucide/line-chart";
import LucideTicket from "~icons/lucide/ticket";
import LucideUsersRound from "~icons/lucide/users-round";
import { OrganizationsIcon } from "../icons";
import { __ } from "@/translation";
import { travelosShellLabels } from "@/kancom/shell/navigation";
import type { KancomEffectivePermission } from "@/kancom/product/store";

export function getAgentPortalSidebarOptions(
  hasCapability: (
    capability: "analytics" | "basic_reports" | "team_queues"
  ) => boolean,
  hasEffectivePermission: (permission: KancomEffectivePermission) => boolean
) {
  const reports =
    hasCapability("basic_reports") && hasEffectivePermission("view_reports")
      ? {
          label: __("Reports"),
          icon: LucideLineChart,
          to: "OperationalReports",
        }
      : null;

  const canManageTeamQueues =
    hasCapability("team_queues") && hasEffectivePermission("view_team_queues");

  return [
    {
      label: __("My Queues"),
      icon: LucideLayoutDashboard,
      to: {
        name: "TicketsAgent",
        query: { scope: "queues", entry: "my_queues" },
      },
    },
    {
      label: __(travelosShellLabels.tickets),
      icon: LucideTicket,
      to: "TicketsAgent",
    },
    ...(canManageTeamQueues
      ? [
          {
            label: __("Team Queues"),
            icon: LucideUsersRound,
            to: {
              name: "TicketsAgent",
              query: { scope: "queues", entry: "team_queues" },
            },
          },
        ]
      : []),
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
