<template>
  <Dropdown :options="options">
    <template #default="{ open }">
      <Button class="kancom-workbench-views-button" theme="gray">
        <template #prefix>
          <LucideRows3 class="h-3.5 w-3.5" />
        </template>
        <span class="truncate">{{ currentView?.label || "Control View" }}</span>
        <template #suffix>
          <LucideChevronUp v-if="open" class="h-3.5 w-3.5" />
          <LucideChevronDown v-else class="h-3.5 w-3.5" />
        </template>
      </Button>
    </template>
    <template #item="{ item }">
      <button
        class="kancom-workbench-view-item group"
        type="button"
        @click="item.onClick"
      >
        <span class="flex min-w-0 items-center">
          <FeatherIcon
            v-if="item.icon && typeof item.icon === 'string'"
            :name="item.icon"
            class="mr-2 h-4 w-4 flex-shrink-0"
            aria-hidden="true"
          />
          <component
            v-else-if="item.icon"
            :is="item.icon"
            class="mr-2 h-4 w-4 flex-shrink-0"
          />
          <span class="truncate">{{ item.label }}</span>
        </span>
        <span v-if="item.name" class="flex items-center gap-1">
          <Dropdown placement="right-start" :options="dropdownActions(item)">
            <template #default>
              <Button
                variant="ghost"
                class="kancom-workbench-view-action"
                icon="more-horizontal"
                @click.stop
              />
            </template>
          </Dropdown>
          <LucideCheck
            v-if="isCurrentView(item)"
            class="h-3.5 w-3.5 flex-shrink-0"
          />
        </span>
      </button>
    </template>
  </Dropdown>
</template>

<script setup lang="ts">
import { Dropdown, FeatherIcon } from "frappe-ui";
import { useRoute } from "vue-router";
import LucideCheck from "~icons/lucide/check";
import LucideChevronDown from "~icons/lucide/chevron-down";
import LucideChevronUp from "~icons/lucide/chevron-up";
import LucideRows3 from "~icons/lucide/rows-3";

defineProps<{
  options: Array<Record<string, any>>;
  dropdownActions: (view: Record<string, any>) => Array<Record<string, any>>;
  currentView: {
    label?: string;
    icon?: any;
  };
}>();

const route = useRoute();

function isCurrentView(item: Record<string, any>) {
  if (!route.query.view) return false;
  return item.name === route.query.view;
}
</script>
