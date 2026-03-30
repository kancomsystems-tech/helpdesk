<template>
  <div>
    <!-- Your existing template content -->
  </div>
</template>

<script>
import { nextTick } from 'vue';

export default {
  methods: {
    async reloadAndScrollLatest() {
      await activities.reload();
      await nextTick();
      await nextTick();
      requestAnimationFrame(() => {
        ticketAgentActivitiesRef.value?.scrollToLatestActivity?.();
      });
    }
  }
};
</script>

<style scoped>
/* Your existing styles */
</style>