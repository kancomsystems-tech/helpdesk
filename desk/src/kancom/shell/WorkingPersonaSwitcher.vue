<template>
  <Dropdown v-if="showSwitcher" :options="options" placement="right">
    <button
      type="button"
      class="travelos-persona-control flex w-full items-center justify-between gap-2 rounded-md border border-outline-gray-2 bg-surface-white px-2.5 py-2 text-left text-xs text-ink-gray-8 shadow-sm transition hover:border-outline-gray-3 hover:bg-surface-gray-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-5"
      :disabled="switching"
    >
      <span class="truncate"
        >{{ __("Operating as:") }} <strong>{{ selectedLabel }}</strong></span
      >
      <LucideChevronDown class="size-3.5 shrink-0" />
    </button>
  </Dropdown>
</template>

<script setup lang="ts">
import { useProductContextStore } from "@/kancom/product/store";
import type { OperationalPersona } from "@/kancom/product/store";
import { getKancomPersonaLabel } from "@/kancom/shell/navigation";
import {
  getWorkingPersonaLandingRoute,
  getWorkingPersonaOptions,
  shouldShowWorkingPersonaSwitcher,
} from "@/kancom/product/personaContext";
import { __ } from "@/translation";
import { Dropdown, toast } from "frappe-ui";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import LucideChevronDown from "~icons/lucide/chevron-down";

const productContextStore = useProductContextStore();
const route = useRoute();
const router = useRouter();
const switching = ref(false);

const showSwitcher = computed(() =>
  shouldShowWorkingPersonaSwitcher(
    productContextStore.authorizedOperationalPersonas,
    productContextStore.context?.is_platform_administrator
  )
);
const selectedLabel = computed(() =>
  getKancomPersonaLabel(productContextStore.workingPersona)
);
const options = computed(() =>
  getWorkingPersonaOptions(
    productContextStore.authorizedOperationalPersonas
  ).map(({ value, label }) => ({
    label: __(label),
    icon: value === productContextStore.workingPersona ? "check" : undefined,
    onClick: () => switchPersona(value),
  }))
);

async function switchPersona(persona: OperationalPersona) {
  if (persona === productContextStore.workingPersona || switching.value) return;
  switching.value = true;
  try {
    await productContextStore.setWorkingPersona(persona);
    if (route.name !== "Dashboard")
      await router.push(getWorkingPersonaLandingRoute());
  } catch {
    toast.error(__("Working persona could not be changed."));
  } finally {
    switching.value = false;
  }
}
</script>
