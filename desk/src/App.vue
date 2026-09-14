<template>
  <FrappeUIProvider>
    <PortalRoot />
  </FrappeUIProvider>
  <Dialogs />
</template>

<script setup lang="ts">
import { Dialogs } from "@/components/dialogs";
import { useConfigStore } from "@/stores/config";
import { FrappeUIProvider, toast, setConfig } from "frappe-ui";
import { computed, defineAsyncComponent, h, onMounted, onUnmounted } from "vue";
import Wifi from "~icons/lucide/wifi";
import WifiOff from "~icons/lucide/wifi-off";
import { useAuthStore } from "./stores/auth";
import { useFavicon } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { __ } from "./translation";
import { isCustomerPortal, getBrowserTimezone } from "./utils";

const configStore = useConfigStore();
const { favicon } = storeToRefs(configStore);

useFavicon(favicon);

onMounted(() => {
  window.addEventListener("online", () => {
    toast.create({
      message: __("You are now online"),
      icon: h(Wifi, { class: "text-white" }),
    });
  });

  window.addEventListener("offline", () => {
    toast.create({
      message: __("You are now offline"),
      icon: h(WifiOff, { class: "text-white" }),
    });
  });
  !isCustomerPortal.value && setConfig("localTimezone", window.timezone?.user);
  setConfig("systemTimezone", window.timezone?.system || null);
});

const AgentPortalRoot = defineAsyncComponent(
  () => import("@/pages/desk/AgentRoot.vue")
);
const CustomerPortalRoot = defineAsyncComponent(
  () => import("@/pages/CustomerPortalRoot.vue")
);

const PortalRoot = computed(() => {
  const authStore = useAuthStore();
  // hasDeskAccess is server-derived. It selects the TravelOS/Helpdesk shell for
  // approved operational manager/admin personas; router guards and backend
  // permissions remain the final authorization layer for each route/action.
  if (authStore.hasDeskAccess) {
    return AgentPortalRoot;
  } else {
    return CustomerPortalRoot;
  }
});
</script>
