<template>
  <SettingsLayoutBase
    :title="__('Add User')"
    :description="
      __('Add an operational user without managing raw platform roles.')
    "
  >
    <template #content>
      <div v-if="options.loading" class="flex justify-center py-16">
        <LoadingIndicator class="size-5" />
      </div>
      <form v-else class="max-w-xl space-y-5" @submit.prevent="submit">
        <div
          v-if="options.error"
          class="rounded-lg border border-outline-gray-2 bg-surface-gray-1 p-4 text-p-sm text-ink-gray-7"
        >
          {{ __("Onboarding options could not be loaded. Please try again.") }}
        </div>

        <FormControl v-model="form.fullName" :label="__('Name')" required />
        <FormControl
          v-model="form.email"
          :label="__('Email')"
          type="email"
          required
        />
        <FormControl
          v-model="form.operationalRole"
          :label="__('Operational Role')"
          type="select"
          :options="roleOptions"
          required
        />

        <div
          class="flex items-center justify-between rounded-lg bg-surface-gray-1 px-3 py-2"
        >
          <div>
            <div class="text-sm font-medium text-ink-gray-8">
              {{ __("Works tickets?") }}
            </div>
            <div class="text-xs text-ink-gray-5">
              {{
                __(
                  "Creates an active Helpdesk agent and worker-team membership."
                )
              }}
            </div>
          </div>
          <Switch v-model="form.worksTickets" :disabled="isAgent" />
        </div>

        <MultiSelectCombobox
          v-if="form.worksTickets"
          v-model="form.workerTeams"
          :label="__('Worker Teams')"
          :options="teamOptions"
          :multiple="true"
          :placeholder="__('Select worker teams')"
        />

        <MultiSelectCombobox
          v-if="isTeamLeader"
          v-model="form.managedTeams"
          :label="__('Managed Teams')"
          :options="teamOptions"
          :multiple="true"
          :placeholder="__('Select managed teams')"
        />

        <div
          class="flex items-center justify-between rounded-lg bg-surface-gray-1 px-3 py-2"
        >
          <div>
            <div class="text-sm font-medium text-ink-gray-8">
              {{ __("Send invitation email") }}
            </div>
            <div class="text-xs text-ink-gray-5">
              {{
                __("The user receives the native secure password setup link.")
              }}
            </div>
          </div>
          <Switch v-model="form.sendInvite" />
        </div>

        <div
          v-if="errorMessage"
          role="alert"
          class="rounded-lg border border-outline-gray-2 bg-surface-gray-1 p-3 text-p-sm text-ink-gray-7"
        >
          {{ errorMessage }}
        </div>
        <div
          v-if="success"
          class="rounded-lg border border-outline-gray-2 bg-surface-gray-1 p-3 text-p-sm text-ink-gray-7"
        >
          <div class="font-medium text-ink-gray-8">
            {{ __("User added successfully") }}
          </div>
          <div class="mt-1">{{ successSummary }}</div>
        </div>

        <div class="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            :label="__('Cancel')"
            @click="reset"
          />
          <Button
            type="submit"
            variant="solid"
            :label="__('Add User')"
            :loading="addUser.loading"
            :disabled="!canSubmit"
          />
        </div>
      </form>
    </template>
  </SettingsLayoutBase>
</template>

<script setup lang="ts">
import MultiSelectCombobox from "@/components/frappe-ui/MultiSelectCombobox.vue";
import SettingsLayoutBase from "@/components/layouts/SettingsLayoutBase.vue";
import { __ } from "@/translation";
import {
  Button,
  FormControl,
  LoadingIndicator,
  Switch,
  createResource,
  toast,
} from "frappe-ui";
import { computed, reactive, ref, watch } from "vue";

type OperationalRole = "agent" | "team_leader" | "operations_head";
type Option = { label: string; value: string };

const emptyForm = () => ({
  fullName: "",
  email: "",
  operationalRole: "agent" as OperationalRole,
  worksTickets: true,
  workerTeams: [] as Option[],
  managedTeams: [] as Option[],
  sendInvite: true,
});

const form = reactive(emptyForm());
const success = ref<Record<string, any> | null>(null);
const errorMessage = ref("");

const options = createResource({
  url: "kancom_custom.api.operational_user_onboarding.get_add_user_options",
  method: "GET",
  auto: true,
});

const roleLabels: Record<OperationalRole, string> = {
  agent: "Agent",
  team_leader: "Team Leader",
  operations_head: "Operations Head",
};
const roleOptions = computed(() =>
  (options.data?.operational_roles || []).map((value: OperationalRole) => ({
    value,
    label: __(roleLabels[value]),
  }))
);
const teamOptions = computed(() =>
  (options.data?.teams || []).map((team: string) => ({
    label: team,
    value: team,
  }))
);
const isAgent = computed(() => form.operationalRole === "agent");
const isTeamLeader = computed(() => form.operationalRole === "team_leader");
const selectedValues = (values: Option[]) =>
  values.map((option) => option.value);

watch(
  () => form.operationalRole,
  (role) => {
    if (role === "agent") form.worksTickets = true;
    if (role !== "team_leader") form.managedTeams = [];
  }
);
watch(
  () => form.worksTickets,
  (enabled) => {
    if (!enabled) form.workerTeams = [];
  }
);

const canSubmit = computed(
  () =>
    Boolean(form.fullName.trim() && form.email.trim()) &&
    (!form.worksTickets || form.workerTeams.length > 0) &&
    (!isTeamLeader.value || form.managedTeams.length > 0)
);

const addUser = createResource({
  url: "kancom_custom.api.operational_user_onboarding.add_operational_user",
  onSuccess(data) {
    success.value = data;
    errorMessage.value = "";
    toast.success(__("User added successfully"));
    window.dispatchEvent(new CustomEvent("kancom:operational-user-added"));
  },
  onError(error) {
    success.value = null;
    errorMessage.value = safeError(error);
  },
});

const submit = () => {
  success.value = null;
  errorMessage.value = "";
  return addUser.submit({
    full_name: form.fullName.trim(),
    email: form.email.trim(),
    operational_role: form.operationalRole,
    works_tickets: form.worksTickets,
    worker_teams: selectedValues(form.workerTeams),
    managed_teams: selectedValues(form.managedTeams),
    send_invite: form.sendInvite,
  });
};

const successSummary = computed(() => {
  if (!success.value) return "";
  const parts = [
    __(roleLabels[success.value.operational_role as OperationalRole]),
  ];
  if (success.value.managed_teams?.length)
    parts.push(__("Manages: {0}", success.value.managed_teams.join(", ")));
  if (success.value.worker_teams?.length)
    parts.push(
      __("Works tickets in: {0}", success.value.worker_teams.join(", "))
    );
  return parts.join(" · ");
});

function reset() {
  Object.assign(form, emptyForm());
  success.value = null;
  errorMessage.value = "";
}

function safeError(error: any) {
  return (
    error?.messages?.[0] ||
    __("The user could not be added. Review the details and try again.")
  );
}
</script>
