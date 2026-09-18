import { getProductContextUrl } from "@/extensions/registry";
import "@/kancom/registerExtension";
import { call, createResource } from "frappe-ui";
import { defineStore } from "pinia";
import { computed } from "vue";
import { toWorkingProductContext } from "./personaContext";

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

export type OperationalPersona = "operations_head" | "team_leader" | "agent";

export interface ProductContext {
  edition: "Travel Inbox" | "Direct Client" | "Enterprise";
  capabilities: KancomCapability[];
  persona: "administrator" | "operations_head" | "team_leader" | "agent" | null;
  authoritative_persona:
    | "administrator"
    | "operations_head"
    | "team_leader"
    | "agent"
    | null;
  authorized_operational_personas: OperationalPersona[];
  working_persona: OperationalPersona | null;
  is_platform_administrator: boolean;
  managed_teams: string[];
  working_managed_teams: string[];
  actions: KancomAction[];
  teams?: string[];
}

export const useProductContextStore = defineStore(
  "kancomProductContext",
  () => {
    const contextResource = createResource({
      url: getProductContextUrl() || "",
    });

    const context = computed<ProductContext | null>(
      () => (contextResource.data as ProductContext | undefined) ?? null
    );
    const edition = computed(() => context.value?.edition ?? null);
    const workingPersona = computed(
      () => context.value?.working_persona ?? null
    );
    const authorizedOperationalPersonas = computed(
      () => context.value?.authorized_operational_personas ?? []
    );
    const workingContext = computed<ProductContext | null>(() => {
      if (!context.value) return null;
      return toWorkingProductContext(context.value);
    });
    const capabilities = computed(
      () => new Set<string>(context.value?.capabilities ?? [])
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

    function hasCapability(capability: string) {
      return capabilities.value.has(capability);
    }

    function hasAction(action: KancomAction) {
      if (!actions.value.has(action)) return false;
      if (action === "bulk_assign") {
        return ["team_leader", "operations_head"].includes(
          workingPersona.value || ""
        );
      }
      return true;
    }

    async function setWorkingPersona(persona: OperationalPersona) {
      const next = (await call(
        "kancom_custom.api.product_context.set_working_persona",
        { working_persona: persona }
      )) as ProductContext;
      contextResource.data = next;
      return next;
    }

    return {
      actions,
      authorizedOperationalPersonas,
      capabilities,
      context,
      edition,
      error,
      hasAction,
      hasCapability,
      init,
      loading,
      setWorkingPersona,
      workingContext,
      workingPersona,
    };
  }
);
