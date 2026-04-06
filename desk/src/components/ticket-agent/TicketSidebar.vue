<template>
  <Resizer
    class="flex flex-col justify-between border-l"
    :class="isCollapsed ? '!w-12' : ''"
    side="right"
  >
    <div class="flex items-center justify-end px-2 py-2">
      <Button
        variant="ghost"
        size="sm"
        :icon="isCollapsed ? 'chevron-left' : 'chevron-right'"
        @click="isCollapsed = !isCollapsed"
      />
    </div>

    <TabButtons
      v-show="!isCollapsed"
      :buttons="tabs"
      v-model="currentTab"
      class="tab-buttons mb-1 px-5 mt-3.5"
    />

    <div v-show="!isCollapsed" class="flex-1 max-h-full">
      <TicketDetailsTab v-if="currentTab === 'details'" />
      <TicketContactTab v-else />
    </div>
  </Resizer>
</template>

<script setup lang="ts">
import { TabButtons } from "frappe-ui";
import { ref } from "vue";
import Resizer from "../Resizer.vue";
import TicketContactTab from "./TicketContactTab.vue";
import TicketDetailsTab from "./TicketDetailsTab.vue";

const currentTab = ref("details");
const isCollapsed = ref(false);

const tabs = [
  {
    label: "Details",
    value: "details",
  },
  {
    label: "Contact",
    value: "contact",
  },
];
</script>

<style>
.tab-buttons div,
.tab-buttons button {
  width: 100%;
  flex: 1;
}
</style>