<template>
  <div class="travelos-command-bar">
    <button type="button" class="travelos-command-menu" aria-label="Toggle sidebar" @click="toggleSidebar">
      <LucideMenu class="size-5" />
    </button>
    <button type="button" class="travelos-command-search">
      <LucideSearch class="size-4" />
      <span>Search by PNR, Request No., Email, Client, Booking ID...</span>
    </button>
    <RouterLink to="/tickets/new" class="travelos-command-create">
      <LucidePlus class="size-4" />
      Quick Create
      <LucideChevronDown class="size-4 opacity-80" />
    </RouterLink>
    <button type="button" class="travelos-command-icon" aria-label="Notifications" @click="notificationStore.toggle()">
      <LucideBell class="size-5" />
      <span v-if="notificationStore.unread" class="travelos-command-badge">{{ notificationStore.unread > 9 ? "9+" : notificationStore.unread }}</span>
    </button>
    <button type="button" class="travelos-command-icon" aria-label="Inbox">
      <LucideMail class="size-5" />
      <span class="travelos-command-badge is-green">8</span>
    </button>
    <button type="button" class="travelos-command-user">
      <span>{{ initials }}</span>
      <div>
        <strong>{{ userName }}</strong>
        <small>{{ profileLabel }}</small>
      </div>
      <LucideChevronDown class="size-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import { useSidebarStore } from "@/stores/sidebar";
import LucideBell from "~icons/lucide/bell";
import LucideChevronDown from "~icons/lucide/chevron-down";
import LucideMail from "~icons/lucide/mail";
import LucideMenu from "~icons/lucide/menu";
import LucidePlus from "~icons/lucide/plus";
import LucideSearch from "~icons/lucide/search";

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const { isExpanded } = storeToRefs(useSidebarStore());

const userName = computed(() => authStore.userName || authStore.userFirstName || "Kapil Verma");
const initials = computed(() =>
  userName.value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
);
const profileLabel = computed(() => {
  if (authStore.isAdmin) return "Admin";
  if (authStore.isManager) return "Operations Manager";
  return "Travel Desk";
});

function toggleSidebar() {
  isExpanded.value = !isExpanded.value;
}
</script>
