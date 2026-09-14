import { createResource } from "frappe-ui";
import { defineStore } from "pinia";
import { computed } from "vue";

export type KancomCapability =
  | "operations"
  | "travel_requests"
  | "clients"
  | "contacts"
  | "knowledge_base"
  | "basic_reports"
  | "bulk_assign"
  | "sla_monitor"
  | "team_queues"
  | "escalations"
  | "kancom_requests"
  | "advanced_search"
  | "analytics"
  | "workforce"
  | "quality"
  | "managed_configuration"
  | "enterprise_integrations";

export type KancomAction = "bulk_assign";

interface ProductContext {
  edition: "Travel Inbox" | "Direct Client" | "Enterprise";
  capabilities: KancomCapability[];
  persona: "administrator" | "operations_head" | "team_leader" | "agent" | null;
  managed_teams: string[];
  actions: KancomAction[];
  teams?: string[];
}

export const useProductContextStore = defineStore(
  "kancomProductContext",
  () => {
    const contextResource = createResource({
      url: "kancom_custom.api.product_context.get_product_context",
    });

    const context = computed<ProductContext | null>(
      () => (contextResource.data as ProductContext | undefined) ?? null
    );
    const edition = computed(() => context.value?.edition ?? null);
    const capabilities = computed(
      () => new Set<KancomCapability>(context.value?.capabilities ?? [])
    );
    const actions = computed(
      () => new Set<KancomAction>(context.value?.actions ?? [])
    );
    const loading = computed(() => contextResource.loading);
    const error = computed(() => contextResource.error);

    async function init() {
      if (contextResource.fetched) return true;
      try {
        await contextResource.fetch();
        return Boolean(context.value);
      } catch {
        return false;
      }
    }

    function hasCapability(capability: KancomCapability) {
      return capabilities.value.has(capability);
    }

    function hasAction(action: KancomAction) {
      return actions.value.has(action);
    }

    return {
      actions,
      capabilities,
      context,
      edition,
      error,
      hasAction,
      hasCapability,
      init,
      loading,
    };
  }
);
