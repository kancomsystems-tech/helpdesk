<template>
  <header class="travelos-ops-hero">
    <div>
      <h1>Good day, {{ userName }}</h1>
      <p>Here is what is happening with your TravelOS operations today.</p>
    </div>
    <button type="button" class="travelos-date-selector">
      <LucideCalendarDays class="size-4" />
      24 Jul 2026, Friday
      <LucideChevronDown class="size-4" />
    </button>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import LucideCalendarDays from "~icons/lucide/calendar-days";
import LucideChevronDown from "~icons/lucide/chevron-down";

const authStore = useAuthStore();
const userName = computed(() => authStore.userFirstName || authStore.userName || "Kapil");
</script>
