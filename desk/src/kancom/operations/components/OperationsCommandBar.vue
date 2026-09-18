<template>
  <div class="travelos-command-bar">
    <button
      type="button"
      class="travelos-command-menu"
      aria-label="Toggle sidebar"
      @click="toggleSidebar"
    >
      <LucideMenu class="size-5" />
    </button>
    <div class="travelos-command-spacer" aria-hidden="true" />
    <RouterLink to="/tickets/new" class="travelos-command-create">
      <LucidePlus class="size-4" />
      New Request
    </RouterLink>
    <button
      type="button"
      class="travelos-command-icon"
      aria-label="Notifications"
      @click="notificationStore.toggle()"
    >
      <LucideBell class="size-5" />
      <span v-if="notificationStore.unread" class="travelos-command-badge">{{
        notificationStore.unread > 9 ? "9+" : notificationStore.unread
      }}</span>
    </button>
    <div class="travelos-command-user">
      <span>{{ initials }}</span>
      <div>
        <strong>{{ userName }}</strong>
        <small>{{ profileLabel }}</small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useProductContextStore } from "@/kancom/product/store";
import { getKancomPersonaLabel } from "@/kancom/shell/navigation";
import { useNotificationStore } from "@/stores/notification";
import { useSidebarStore } from "@/stores/sidebar";
import LucideBell from "~icons/lucide/bell";
import LucideMenu from "~icons/lucide/menu";
import LucidePlus from "~icons/lucide/plus";

const authStore = useAuthStore();
const productContextStore = useProductContextStore();
const notificationStore = useNotificationStore();
const { isExpanded } = storeToRefs(useSidebarStore());

const userName = computed(
  () => authStore.userName || authStore.userFirstName || authStore.userId || ""
);
const initials = computed(() =>
  userName.value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
);
const profileLabel = computed(() =>
  getKancomPersonaLabel(
    productContextStore.workingPersona ||
      productContextStore.context?.authoritative_persona ||
      null
  )
);

function toggleSidebar() {
  isExpanded.value = !isExpanded.value;
}
</script>
