<template>
  <Dialog
    v-model="show"
    :options="{ title: 'Customize Dashboard', size: 'md' }"
  >
    <template #body-content>
      <div class="flex flex-col gap-5">
        <section v-for="group in groupedCards" :key="group.id">
          <h3
            class="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-gray-5"
          >
            {{ group.label }}
          </h3>
          <div
            v-for="(card, index) in group.cards"
            :key="card.id"
            class="flex min-h-12 items-center gap-3 border-b border-outline-gray-1 py-2 last:border-0"
          >
            <Checkbox
              :model-value="!draftHidden.has(card.id)"
              :aria-label="`Show ${card.label}`"
              @update:model-value="toggle(card.id)"
            />
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="truncate text-sm text-ink-gray-8">{{
                  card.label
                }}</span>
                <span
                  class="rounded border border-outline-gray-2 px-1.5 py-0.5 text-xs font-medium"
                  :class="
                    card.state === 'preview'
                      ? 'bg-surface-gray-1 text-ink-gray-6'
                      : 'text-ink-gray-7'
                  "
                >
                  {{ card.state === "preview" ? "Preview" : "Live" }}
                </span>
              </div>
              <p class="mt-0.5 text-xs text-ink-gray-5">{{ card.helper }}</p>
            </div>
            <Button
              variant="ghost"
              :disabled="index === 0"
              title="Move up"
              :aria-label="`Move ${card.label} up`"
              @click="moveWithinGroup(group.cards, index, -1)"
            >
              <LucideChevronUp class="size-4" />
            </Button>
            <Button
              variant="ghost"
              :disabled="index === group.cards.length - 1"
              title="Move down"
              :aria-label="`Move ${card.label} down`"
              @click="moveWithinGroup(group.cards, index, 1)"
            >
              <LucideChevronDown class="size-4" />
            </Button>
          </div>
        </section>
      </div>
    </template>
    <template #actions>
      <div class="flex w-full justify-between gap-2">
        <Button label="Reset to Default" @click="$emit('reset')" />
        <div class="flex gap-2">
          <Button label="Cancel" @click="show = false" />
          <Button
            label="Save"
            variant="solid"
            :loading="saving"
            @click="save"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { Button, Checkbox, Dialog } from "frappe-ui";
import { computed, ref, watch } from "vue";
import type {
  OperationsKpiCardDefinition,
  OperationsKpiCardId,
  OperationsKpiLayoutPreference,
} from "../data/dashboardLayout";
import LucideChevronDown from "~icons/lucide/chevron-down";
import LucideChevronUp from "~icons/lucide/chevron-up";

const show = defineModel<boolean>();
const props = defineProps<{
  cards: OperationsKpiCardDefinition[];
  preference: OperationsKpiLayoutPreference;
  saving?: boolean;
}>();
const emit = defineEmits<{
  save: [preference: OperationsKpiLayoutPreference];
  reset: [];
}>();

const draftOrder = ref<OperationsKpiCardId[]>([]);
const draftHidden = ref(new Set<OperationsKpiCardId>());
const orderedCards = computed(() =>
  draftOrder.value
    .map((id) => props.cards.find((card) => card.id === id))
    .filter((card): card is OperationsKpiCardDefinition => Boolean(card))
);
const groupLabels = {
  kpis: "KPIs",
  breakdowns: "Breakdowns",
  visuals: "Visuals",
  preview: "Preview / Coming",
} as const;
const groupedCards = computed(() =>
  (Object.keys(groupLabels) as Array<keyof typeof groupLabels>)
    .map((id) => ({
      id,
      label: groupLabels[id],
      cards: orderedCards.value.filter((card) => card.group === id),
    }))
    .filter((group) => group.cards.length)
);

watch(
  () => show.value,
  (open) => {
    if (!open) return;
    draftOrder.value = [...props.preference.order];
    draftHidden.value = new Set(props.preference.hidden);
  },
  { immediate: true }
);

function toggle(id: OperationsKpiCardId) {
  const next = new Set(draftHidden.value);
  next.has(id) ? next.delete(id) : next.add(id);
  draftHidden.value = next;
}

function moveWithinGroup(
  cards: OperationsKpiCardDefinition[],
  index: number,
  offset: number
) {
  const target = index + offset;
  if (target < 0 || target >= cards.length) return;
  const currentIndex = draftOrder.value.indexOf(cards[index].id);
  const targetIndex = draftOrder.value.indexOf(cards[target].id);
  const next = [...draftOrder.value];
  [next[currentIndex], next[targetIndex]] = [
    next[targetIndex],
    next[currentIndex],
  ];
  draftOrder.value = next;
}

function save() {
  emit("save", {
    order: [...draftOrder.value],
    hidden: Array.from(draftHidden.value),
  });
}
</script>
