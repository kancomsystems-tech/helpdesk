<template>
  <SettingsLayoutBase
    :title="__('Setup Summary')"
    :description="
      __('Review the current TravelOS operating setup. This page is read-only.')
    "
  >
    <template #content>
      <div v-if="summary.loading" class="flex justify-center py-16">
        <LoadingIndicator class="size-5" />
      </div>
      <div
        v-else-if="summary.error"
        class="rounded-lg border border-outline-gray-2 bg-surface-gray-1 p-4 text-p-sm text-ink-gray-7"
      >
        {{ __("Setup information could not be loaded. Please try again.") }}
      </div>
      <div v-else-if="data" class="grid gap-4 pb-6 lg:grid-cols-2">
        <SummaryCard :title="__('Product')">
          <SummaryRow :label="__('Product')" :value="data.product.name" />
          <SummaryRow :label="__('Edition')" :value="data.product.edition" />
          <SummaryRow
            :label="__('Capabilities')"
            :value="list(data.product.capabilities)"
          />
        </SummaryCard>

        <SummaryCard :title="__('Teams and personas')">
          <SummaryRow
            :label="__('Teams')"
            :value="list(data.teams.configured.map((team) => team.name))"
          />
          <SummaryRow
            :label="__('Managed by you')"
            :value="list(data.teams.managed_teams)"
          />
          <SummaryRow
            :label="__('Active agents')"
            :value="data.teams.active_agents"
          />
          <SummaryRow
            :label="__('Team leaders')"
            :value="data.teams.team_leaders.length"
          />
          <SummaryRow
            :label="__('Operations heads')"
            :value="data.teams.operations_heads"
          />
        </SummaryCard>

        <SummaryCard :title="__('Mailbox')">
          <div v-if="!data.mailbox.length" class="empty-copy">
            {{ __("No email account is configured yet.") }}
          </div>
          <div
            v-for="account in data.mailbox"
            :key="account.name"
            class="border-b border-outline-gray-1 py-2 last:border-0"
          >
            <div class="text-sm font-medium text-ink-gray-8">
              {{ account.email_account_name || account.name }}
            </div>
            <div class="mt-1 text-p-sm text-ink-gray-6">
              {{ mailboxModes(account) }} · {{ mailboxState(account) }}
            </div>
            <div
              v-if="account.last_received_at"
              class="mt-1 text-xs text-ink-gray-5"
            >
              {{ __("Last received: {0}", account.last_received_at) }}
            </div>
          </div>
        </SummaryCard>

        <SummaryCard :title="__('Workflow')">
          <SummaryRow
            :label="__('Statuses')"
            :value="list(data.workflow.statuses.map((status) => status.name))"
          />
          <SummaryRow
            :label="__('New ticket status')"
            :value="data.workflow.default_ticket_status"
          />
          <SummaryRow
            :label="__('After agent reply')"
            :value="data.workflow.update_status_to"
          />
          <SummaryRow
            :label="__('After customer reply')"
            :value="data.workflow.ticket_reopen_status"
          />
          <SummaryRow
            :label="__('Automatic reply transitions')"
            :value="yesNo(data.workflow.auto_update_status)"
          />
        </SummaryCard>

        <SummaryCard :title="__('SLA policies')" class="lg:col-span-2">
          <div v-if="!data.sla.length" class="empty-copy">
            {{ __("No enabled SLA policy is configured.") }}
          </div>
          <div
            v-for="policy in data.sla"
            :key="policy.service_level"
            class="border-b border-outline-gray-1 py-3 first:pt-0 last:border-0 last:pb-0"
          >
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <span class="text-sm font-medium text-ink-gray-8">{{
                policy.service_level
              }}</span>
              <span class="text-xs text-ink-gray-5">{{
                policy.condition || __("Default policy")
              }}</span>
            </div>
            <div class="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <div
                v-for="target in policy.priorities"
                :key="target.priority"
                class="rounded bg-surface-gray-1 px-3 py-2 text-p-sm text-ink-gray-7"
              >
                <div class="font-medium">{{ target.priority }}</div>
                <div class="mt-1 text-ink-gray-6">
                  {{
                    __(
                      "Respond {0} · Resolve {1}",
                      duration(target.response_time),
                      duration(target.resolution_time)
                    )
                  }}
                </div>
              </div>
            </div>
            <div class="mt-2 text-xs text-ink-gray-5">
              {{ workingHours(policy.working_hours) }}
            </div>
          </div>
        </SummaryCard>

        <SummaryCard :title="__('Assignment and queues')">
          <div
            v-if="
              !data.assignment.enabled_rules.length &&
              !data.assignment.team_routes.length
            "
            class="empty-copy"
          >
            {{
              __(
                "No active ticket assignment rule or team route is configured."
              )
            }}
          </div>
          <SummaryRow
            v-else
            :label="__('Enabled rules')"
            :value="list(data.assignment.enabled_rules)"
          />
          <SummaryRow
            v-for="route in data.assignment.team_routes"
            :key="route.team"
            :label="route.team"
            :value="route.rule"
          />
        </SummaryCard>

        <SummaryCard :title="__('Classification')">
          <SummaryRow
            :label="__('Products')"
            :value="list(data.classification.products)"
          />
          <SummaryRow
            :label="__('Categories')"
            :value="list(data.classification.categories)"
          />
          <SummaryRow
            :label="__('Priorities')"
            :value="list(data.classification.priorities)"
          />
        </SummaryCard>

        <SummaryCard :title="__('Automation and health')">
          <SummaryRow
            :label="__('Overall')"
            :value="statusLabel(data.health.status)"
          />
          <SummaryRow
            :label="__('Scheduler')"
            :value="data.automation.scheduler.label"
          />
          <SummaryRow
            :label="__('Mailbox')"
            :value="data.automation.mailbox.label"
          />
        </SummaryCard>

        <SummaryCard :title="__('About and support')">
          <SummaryRow
            label="TravelOS"
            :value="data.about.versions.kancom_custom"
          />
          <SummaryRow label="Helpdesk" :value="data.about.versions.helpdesk" />
          <SummaryRow label="Frappe" :value="data.about.versions.frappe" />
          <SummaryRow
            :label="__('Support')"
            :value="data.about.support_email"
          />
        </SummaryCard>
      </div>
    </template>
  </SettingsLayoutBase>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from "vue";
import { createResource, LoadingIndicator } from "frappe-ui";
import { __ } from "@/translation";
import SettingsLayoutBase from "../layouts/SettingsLayoutBase.vue";

const summary = createResource({
  url: "kancom_custom.api.setup_summary.get_setup_summary",
  auto: true,
});

const data = computed(() => summary.data as any);
const emptyValue = () => __("Not configured");
const list = (values: unknown[] = []) =>
  values.filter(Boolean).join(", ") || emptyValue();
const yesNo = (value: unknown) => (value ? __("Enabled") : __("Disabled"));
const statusLabel = (value: string) =>
  ({
    healthy: __("Healthy"),
    attention: __("Needs attention"),
    unknown: __("Unknown"),
  }[value] || __("Unknown"));
const duration = (seconds: number) => {
  if (!seconds) return __("Not configured");
  const hours = seconds / 3600;
  return hours >= 1
    ? __("{0} h", String(Number(hours.toFixed(1))))
    : __("{0} min", String(Math.round(seconds / 60)));
};
const workingHours = (rows: any[]) =>
  rows?.length
    ? rows
        .map((row) => `${row.workday} ${row.start_time}–${row.end_time}`)
        .join(" · ")
    : __("Working hours not configured");
const mailboxModes = (account: any) => {
  const modes = [];
  if (account.enable_incoming) modes.push(__("Incoming"));
  if (account.enable_outgoing) modes.push(__("Outgoing"));
  return modes.join(" + ") || __("Disabled");
};
const mailboxState = (account: any) =>
  account.awaiting_password || account.no_failed
    ? __("Needs attention")
    : __("Configured");

const SummaryCard = defineComponent({
  props: { title: String },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "section",
        {
          ...attrs,
          class: [attrs.class, "rounded-lg border border-outline-gray-2 p-4"],
        },
        [
          h(
            "h2",
            { class: "mb-3 text-base font-medium text-ink-gray-8" },
            props.title
          ),
          slots.default?.(),
        ]
      );
  },
});

const SummaryRow = defineComponent({
  props: { label: String, value: [String, Number] },
  setup(props) {
    return () =>
      h(
        "div",
        {
          class:
            "grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-3 border-b border-outline-gray-1 py-2 first:pt-0 last:border-0 last:pb-0",
        },
        [
          h("dt", { class: "text-p-sm text-ink-gray-5" }, props.label),
          h(
            "dd",
            { class: "text-p-sm text-ink-gray-8" },
            props.value ?? __("Not configured")
          ),
        ]
      );
  },
});
</script>

<style scoped>
.empty-copy {
  @apply rounded bg-surface-gray-1 px-3 py-4 text-p-sm text-ink-gray-6;
}
</style>
