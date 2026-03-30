<template>
  <div class="flex flex-col max-h-[40vh] sm:max-h-[45vh] md:max-h-[50vh] overflow-y-auto">
    <div ref="quotedContentRef" contenteditable="false" aria-readonly="true">
      <!-- Quoted content goes here -->
    </div>
  </div>
</template>

<script>
import { nextTick } from 'vue';

export default {
  methods: {
    reloadAndScrollLatest() {
      activities.value.reload();
      nextTick().then(() => {
        nextTick().then(() => {
          requestAnimationFrame(() => {
            ticketAgentActivitiesRef.value.scrollToLatestActivity();
          });
        });
      });
    }
  }
};
</script>
