const capabilityLabels: Record<string, string> = {
  advanced_search: "Advanced Search",
  analytics: "Analytics",
  basic_reports: "Basic Reports",
  bulk_assign: "Bulk Assignment",
  clients: "Clients",
  contacts: "Contacts",
  enterprise_integrations: "Enterprise Integrations",
  escalations: "Escalations",
  kancom_requests: "Kancom Requests",
  knowledge_base: "Knowledge Base",
  managed_configuration: "Managed Configuration",
  operations: "Operations",
  quality: "Quality",
  sla_monitor: "SLA Monitoring",
  team_queues: "Team Queues",
  travel_requests: "Travel Requests",
  workforce: "Workforce",
};

export function getCapabilityLabel(capability: string) {
  return (
    capabilityLabels[capability] ||
    capability
      .split("_")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}
