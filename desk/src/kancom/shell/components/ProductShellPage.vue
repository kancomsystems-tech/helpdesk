<template>
  <div class="travelos-page min-h-full overflow-y-auto p-4 lg:p-6">
    <header class="travelos-page-header">
      <div>
        <p class="travelos-eyebrow">TravelOS</p>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
      </div>
      <div class="travelos-header-actions">
        <button type="button">{{ period }}</button>
        <button type="button">Filters</button>
        <button type="button">Export</button>
      </div>
    </header>
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    description: string;
    period?: string;
  }>(),
  {
    period: "Last 30 days",
  }
);
</script>
