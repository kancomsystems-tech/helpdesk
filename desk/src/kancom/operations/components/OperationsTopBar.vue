<template>
  <header class="travelos-ops-hero">
    <div>
      <h1>Good day, {{ userName }}</h1>
      <p>Here is what is happening with your TravelOS operations today.</p>
    </div>
    <div class="travelos-date-selector">
      <LucideCalendarDays class="size-4" />
      {{ currentDate }}
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import LucideCalendarDays from "~icons/lucide/calendar-days";

const authStore = useAuthStore();
const userName = computed(
  () => authStore.userFirstName || authStore.userName || "there"
);
const currentDate = computed(() =>
  new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    weekday: "long",
  }).format(new Date())
);
</script>
