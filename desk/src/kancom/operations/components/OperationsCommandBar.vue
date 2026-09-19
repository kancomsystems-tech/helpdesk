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
    <Dropdown :options="accountOptions" placement="bottom-end">
      <template #default="{ open }">
        <button
          type="button"
          class="travelos-command-user"
          :class="{ 'is-open': open }"
          aria-label="Open account menu"
          title="Account"
        >
          <span>{{ initials }}</span>
        </button>
      </template>
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Dropdown } from "frappe-ui";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useProductContextStore } from "@/kancom/product/store";
import { kancomSecondaryNavigation } from "@/kancom/shell/navigation";
import {
  setActiveSettingsTab,
  settingsModalMode,
  showSettingsModal,
} from "@/components/Settings/settingsModal";
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
function openProfile() {
  settingsModalMode.value = "full";
  setActiveSettingsTab("Profile");
  showSettingsModal.value = true;
}

const accountOptions = computed(() => [
  { label: "Profile", icon: "user", onClick: openProfile },
  ...(productContextStore.context?.is_platform_administrator
    ? [
        {
          label: "System Admin",
          icon: "tool",
          onClick: () => window.location.assign("/app"),
        },
      ]
    : []),
  {
    label: kancomSecondaryNavigation.logout.label,
    icon: kancomSecondaryNavigation.logout.icon,
    onClick: () => authStore.logout(),
  },
]);

function toggleSidebar() {
  isExpanded.value = !isExpanded.value;
}
</script>
