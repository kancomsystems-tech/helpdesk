<template>
  <section class="travelos-v2-queues">
    <div class="travelos-v2-section-heading">
      <div>
        <h2>Department Queues</h2>
        <p>Open requests by current operational team.</p>
      </div>
      <RouterLink to="/tickets">View All Queues</RouterLink>
    </div>
    <div class="travelos-v2-queue-grid">
      <RouterLink
        v-for="queue in queues"
        :key="queue.team"
        :to="queue.route"
        class="travelos-v2-queue-card is-neutral"
      >
        <div class="travelos-v2-queue-top">
          <div class="travelos-v2-queue-icon">
            <component :is="queueIcon" class="size-6" />
          </div>
          <div>
            <h3>{{ queue.team }}</h3>
            <strong>{{ queue.load }}</strong>
            <span>Open</span>
          </div>
        </div>
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import LucidePlane from "~icons/lucide/plane";
import type { DepartmentQueue } from "../data/dashboardData";
defineProps<{ queues: DepartmentQueue[] }>();

const queueIcon = LucidePlane;
</script>
