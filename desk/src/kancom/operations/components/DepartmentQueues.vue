<template>
  <section class="travelos-v2-queues">
    <div class="travelos-v2-section-heading">
      <div>
        <h2>Department Queues</h2>
        <p>Load, pending work and SLA health across TravelOS teams.</p>
      </div>
      <RouterLink to="/tickets">View All Queues</RouterLink>
    </div>
    <div class="travelos-v2-queue-grid">
      <RouterLink
        v-for="queue in queues"
        :key="queue.team"
        :to="queue.route"
        class="travelos-v2-queue-card"
        :class="[`is-` + queue.tone, queueClass(queue.team)]"
      >
        <div class="travelos-v2-queue-top">
          <div class="travelos-v2-queue-icon" :class="queueClass(queue.team)">
            <component :is="queueIcon(queue.team)" class="size-6" />
          </div>
          <div>
            <h3>{{ queue.team }}</h3>
            <strong>{{ queue.load }}</strong>
          </div>
        </div>
        <div class="travelos-v2-queue-meta">
          <span>Unread <b>{{ queue.unread }}</b></span>
          <span>Pending <b>{{ queue.pending }}</b></span>
        </div>
        <div class="travelos-v2-queue-sla">
          <div><span>SLA {{ queue.sla }}%</span><small>{{ queue.availability }}</small></div>
          <div><span :style="{ width: `${queue.sla}%` }" /></div>
        </div>
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import LucideBed from "~icons/lucide/bed";
import LucideBuilding2 from "~icons/lucide/building-2";
import LucideBus from "~icons/lucide/bus";
import LucideCreditCard from "~icons/lucide/credit-card";
import LucideMegaphone from "~icons/lucide/megaphone";
import LucideMoreHorizontal from "~icons/lucide/more-horizontal";
import LucidePlane from "~icons/lucide/plane";
import LucideReceiptText from "~icons/lucide/receipt-text";
import LucideStamp from "~icons/lucide/stamp";
import LucideUsersRound from "~icons/lucide/users-round";
import type { DepartmentQueue } from "../data/dashboardData";

defineProps<{ queues: DepartmentQueue[] }>();

function queueClass(team: string) {
  return {
    "is-air": team === "AirOps",
    "is-hotel": team === "HotelOps",
    "is-visa": team === "VisaOps",
    "is-ets": team === "ETS",
    "is-refund": team === "Refunds",
    "is-corporate": team === "Corporate",
    "is-finance": team === "Finance",
    "is-complaints": team === "Complaints",
    "is-mice": team === "MICE",
    "is-neutral": team === "Others",
  };
}

function queueIcon(team: string) {
  if (team === "HotelOps") return LucideBed;
  if (team === "VisaOps") return LucideStamp;
  if (team === "ETS") return LucideBus;
  if (team === "MICE") return LucideUsersRound;
  if (team === "Refunds") return LucideReceiptText;
  if (team === "Corporate") return LucideBuilding2;
  if (team === "Finance") return LucideCreditCard;
  if (team === "Complaints") return LucideMegaphone;
  if (team === "Others") return LucideMoreHorizontal;
  return LucidePlane;
}
</script>
