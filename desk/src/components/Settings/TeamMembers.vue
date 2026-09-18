<template>
  <SettingsLayoutBase
    :title="__('Team Members')"
    :description="
      __(
        'See who is configured for TravelOS and their operational team scope. This page is read-only.'
      )
    "
  >
    <template #content>
      <div v-if="members.loading" class="flex justify-center py-16">
        <LoadingIndicator class="size-5" />
      </div>
      <div
        v-else-if="members.error"
        class="rounded-lg border border-outline-gray-2 bg-surface-gray-1 p-4 text-p-sm text-ink-gray-7"
      >
        {{ __("Team members could not be loaded. Please try again.") }}
      </div>
      <div
        v-else-if="!members.data?.members?.length"
        class="rounded-lg bg-surface-gray-1 p-6 text-center text-p-sm text-ink-gray-6"
      >
        {{ __("No operational team members are configured in your scope.") }}
      </div>
      <div
        v-else
        class="overflow-hidden rounded-lg border border-outline-gray-2"
      >
        <div
          class="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto] gap-4 border-b border-outline-gray-2 bg-surface-gray-1 px-4 py-2 text-xs font-medium text-ink-gray-6 md:grid"
        >
          <div>{{ __("Member") }}</div>
          <div>{{ __("Persona") }}</div>
          <div>{{ __("Teams") }}</div>
          <div>{{ __("Status") }}</div>
        </div>
        <div
          v-for="member in members.data.members"
          :key="member.email"
          class="grid gap-3 border-b border-outline-gray-1 p-4 last:border-0 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto] md:items-center"
        >
          <div class="min-w-0">
            <div class="truncate text-sm font-medium text-ink-gray-8">
              {{ member.name }}
            </div>
            <div class="truncate text-xs text-ink-gray-5">
              {{ member.email }}
            </div>
          </div>
          <div class="text-p-sm text-ink-gray-7">{{ member.persona }}</div>
          <div class="text-p-sm text-ink-gray-7">
            <div>{{ list(member.teams) }}</div>
            <div
              v-if="member.managed_teams.length"
              class="mt-1 text-xs text-ink-gray-5"
            >
              {{ __("Manages: {0}", list(member.managed_teams)) }}
            </div>
          </div>
          <div
            class="w-fit rounded bg-surface-gray-2 px-2 py-1 text-xs font-medium text-ink-gray-7"
          >
            {{ member.active ? __("Active") : __("Inactive") }}
          </div>
        </div>
      </div>
    </template>
  </SettingsLayoutBase>
</template>

<script setup lang="ts">
import { createResource, LoadingIndicator } from "frappe-ui";
import { onMounted, onUnmounted } from "vue";
import { __ } from "@/translation";
import SettingsLayoutBase from "../layouts/SettingsLayoutBase.vue";

const members = createResource({
  url: "kancom_custom.api.setup_summary.get_team_members",
  auto: true,
});

const refresh = () => members.reload();
onMounted(() =>
  window.addEventListener("kancom:operational-user-added", refresh)
);
onUnmounted(() =>
  window.removeEventListener("kancom:operational-user-added", refresh)
);

const list = (values: string[] = []) =>
  values.length ? values.join(", ") : __("No team assigned");
</script>
