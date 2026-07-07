import LucideBookOpen from "~icons/lucide/book-open";
import LucideTicket from "~icons/lucide/ticket";
import { OrganizationsIcon } from "../icons";
import { __ } from "@/translation";
import { kancomShellLabels } from "@/kancom/shell/labels";

export const agentPortalSidebarOptions = [
  {
    label: __(kancomShellLabels.tickets),
    icon: LucideTicket,
    to: "TicketsAgent",
  },
  {
    label: __(kancomShellLabels.customers),
    icon: OrganizationsIcon,
    to: "CustomerList",
  },
];

export const customerPortalSidebarOptions = [
  {
    label: __(kancomShellLabels.tickets),
    icon: LucideTicket,
    to: "TicketsCustomer",
  },
  {
    label: __(kancomShellLabels.knowledgeBase),
    icon: LucideBookOpen,
    to: "CustomerKnowledgeBase",
  },
];
