<template>
  <div class="flex flex-1 flex-col overflow-hidden overflow-y-auto border-b">
    <TicketField
      v-for="field in fields"
      :key="field.fieldname"
      :field="field"
      :value="ticket[field.fieldname]"
      :class="{
        'kancom-ticket-detail-select-field': isProductOrCategoryField(field),
      }"
      @change="(data) => update(data.fieldname, data.value)"
    />
  </div>
</template>

<script setup lang="ts">
import { Field, FieldValue } from "@/types";
import { toast } from "frappe-ui";
import { computed } from "vue";
import TicketField from "../TicketField.vue";
const emit = defineEmits(["update"]);

const props = defineProps({
  ticket: {
    type: Object,
    required: true,
  },
});

const fields = computed(() => {
  return props.ticket.fields;
});

function isProductOrCategoryField(field: Field) {
  const fieldname = String(field.fieldname || "").toLowerCase();
  const label = String(field.label || "").toLowerCase();
  return (
    fieldname === "product" ||
    fieldname === "category" ||
    label === "product" ||
    label === "category"
  );
}

function update(field: Field["fieldname"], value: FieldValue, event = null) {
  if (field === "subject" && value === "") {
    toast.error("Subject is required");
    event.target.value = props.ticket.subject;
    return;
  }
  emit("update", { field, value });
}
</script>
<style scoped>
:deep(.form-control input:not([type="checkbox"])),
:deep(.form-control select),
:deep(.form-control textarea),
:deep(.form-control button) {
  border-color: transparent;
  background: white;
}
:deep(.form-control textarea) {
  field-sizing: content;
}

:deep(.form-control button) {
  gap: 0;
}
:deep(.form-control [type="checkbox"]) {
  margin-left: 9px;
  cursor: pointer;
}

:deep(.form-control button > div) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.form-control button svg) {
  color: white;
  width: 0;
}

:deep(.kancom-ticket-detail-select-field .form-control input:not([type="checkbox"])),
:deep(.kancom-ticket-detail-select-field .form-control textarea),
:deep(.kancom-ticket-detail-select-field .form-control button) {
  min-height: 28px;
  border: 1px solid var(--outline-gray-3) !important;
  border-radius: 6px;
  background: white !important;
  color: var(--ink-gray-9);
  padding: 4px 8px;
  line-height: 20px;
}

:deep(.kancom-ticket-detail-select-field .form-control textarea) {
  resize: none;
  overflow: hidden;
}

:deep(.kancom-ticket-detail-select-field .form-control button) {
  gap: 6px;
}

:deep(.kancom-ticket-detail-select-field .form-control button svg) {
  width: 14px;
  color: var(--ink-gray-5);
}
</style>
