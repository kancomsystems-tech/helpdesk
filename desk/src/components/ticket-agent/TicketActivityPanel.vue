<template>
  <div class="flex flex-col h-full min-h-0 overflow-hidden">
    <!-- Reply editor -->
    <div class="border-t relative bg-white flex flex-col flex-1 basis-[60%] min-h-0">
      <CommunicationArea
        ref="communicationAreaRef"
        :ticketId="String(ticket.doc?.name)"
        :to-emails="[ticket.doc?.raised_by]"
        :cc-emails="[]"
        :bcc-emails="[]"
        :key="ticket.doc?.name"
        @update="
          () => {
            activities.reload();
            ticketAgentActivitiesRef?.scrollToLatestActivity();
          }
        "
      />
    </div>

    <!-- Activity / Emails / Comments -->
    <div class="min-h-0 overflow-hidden basis-[40%]">
      <Tabs
        :modelValue="tabIndex"
        :tabs="tabs"
        @update:modelValue="changeTabTo"
        class="flex h-full min-h-0 flex-col [&_[role='tab']]:px-0 [&_[role='tablist']]:px-5 [&_[role='tablist']]:gap-7.5 [&_[role='tablist']]:flex-shrink-0"
      >
        <template #tab-panel="{ tab }">
          <div class="flex-1 min-h-0 overflow-auto">
            <TicketAgentActivities
              ref="ticketAgentActivitiesRef"
              :activities="filterActivities(tab.name as TicketTab)"
              :title="tab.label"
              :ticket-status="ticket.doc.status"
              @email:reply="handleReply"
              @update="handleUpdate"
            />
          </div>
        </template>
      </Tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ActivityIcon,
  CommentIcon,
  EmailIcon,
  PhoneIcon,
} from "@/components/icons";
import { useActiveTabManager } from "@/composables/useActiveTabManager";
import { useTelephonyStore } from "@/stores/telephony";
import {
  ActivitiesSymbol,
  FeedbackActivity,
  TabObject,
  TicketSymbol,
  TicketTab,
} from "@/types";
import { LoadingIndicator, Tabs } from "frappe-ui";
import { storeToRefs } from "pinia";
import { computed, ComputedRef, defineAsyncComponent, inject, onMounted, ref } from "vue";
import TicketAgentActivities from "../ticket/TicketAgentActivities.vue";

const CommunicationArea = defineAsyncComponent(
  () => import("@/components/CommunicationArea.vue")
);

const ticket = inject(TicketSymbol)!;
const activities = inject(ActivitiesSymbol)!;

const ticketAgentActivitiesRef = ref(null);
const communicationAreaRef = ref(null);
const telephonyStore = useTelephonyStore();
const { isCallingEnabled } = storeToRefs(telephonyStore);

const tabs: ComputedRef<TabObject[]> = computed(() => {
  const _tabs: TabObject[] = [
    {
      name: "activity",
      label: "Activity",
      icon: ActivityIcon,
    },
    {
      name: "email",
      label: "Emails",
      icon: EmailIcon,
    },
    {
      name: "comment",
      label: "Comments",
      icon: CommentIcon,
    },
  ];

  if (isCallingEnabled.value) {
    _tabs.push({
      name: "call",
      label: "Calls",
      icon: PhoneIcon,
    });
  }
  return _tabs;
});

const { tabIndex, changeTabTo } = useActiveTabManager(tabs);

onMounted(() => {
  changeTabTo(1);
});

// TODO: refactor for pagination
// can be done once we sort out the backend
const _activities = computed(() => {
  if (!activities.value?.data) {
    return [];
  }

  const emailProps = activities.value?.data?.communications.map(
    (email, idx: number) => {
      return {
        subject: email.subject,
        content: email.content,
        sender: { name: email.user.email, full_name: email.user.name },
        to: email.recipients,
        type: "email",
        key: email.creation,
        cc: email.cc,
        bcc: email.bcc,
        creation: email.communication_date || email.creation,
        attachments: email.attachments,
        name: email.name,
        deliveryStatus: email.delivery_status,
        isFirstEmail: idx === 0,
      };
    }
  );

  const commentProps = activities.value.data.comments.map((comment) => {
    return {
      name: comment.name,
      type: "comment",
      key: comment.creation,
      commentedBy: comment.commented_by,
      commenter: comment.user.name,
      creation: comment.creation,
      content: comment.content,
      attachments: comment.attachments,
    };
  });

  const historyProps = [
    ...activities.value.data.history,
    ...activities.value.data.views,
  ].map((h) => {
    return {
      type: "history",
      key: h.creation,
      content: h.action ? h.action : "viewed this",
      creation: h.creation,
      user: h.user.name + " ",
    };
  });

  const callProps = activities.value.data.calls.map((call) => {
    return {
      ...call,
      type: "call",
      name: call.name,
      key: call.creation,
      call_type: call.type,
      content: `${call.caller || "Unknown"} made a call to ${
        call.receiver || "Unknown"
      }`,
      duration: call.duration ? call.duration + "s" : "0s",
    };
  });

  const sorted = [
    ...emailProps,
    ...commentProps,
    ...historyProps,
    ...callProps,
  ].sort((a, b) => new Date(a.creation) - new Date(b.creation));
  const data = [];
  let i = 0;

  while (i < sorted.length) {
    const currentActivity = sorted[i];

    if (currentActivity.type === "history") {
      currentActivity.relatedActivities = [currentActivity];
      for (let j = i + 1; j < sorted.length + 1; j++) {
        const nextActivity = sorted[j];

        if (
          nextActivity &&
          nextActivity.user === currentActivity.user &&
          nextActivity.content !== "viewed this" &&
          !nextActivity.content.includes("assigned") &&
          !nextActivity.content.includes("unassigned")
        ) {
          currentActivity.relatedActivities.push(nextActivity);
        } else {
          data.push(currentActivity);
          i = j - 1;
          break;
        }
      }
    } else {
      data.push(currentActivity);
    }
    i++;
  }
  // add feedback data at the last always
  // name is email
  // full_name is name

  if (ticket.value.doc.feedback_rating === 0) {
    return data;
  }
  let feedbackActivity: FeedbackActivity[] = [
    {
      type: "feedback",
      key: "feedback-activity",
      feedback_rating: ticket.value?.doc.feedback_rating,
      feedback_extra: ticket.value?.doc.feedback_extra,
      feedback: ticket.value?.doc.feedback,
      sender: {
        name: ticket.value?.doc.raised_by,
        full_name: ticket.value?.doc.contact,
      },
    },
  ];
  data.push(...feedbackActivity);

  return data;
});


import { nextTick } from "vue";

function handleReply(e) {
  communicationAreaRef.value?.replyToEmail(e);

  nextTick(() => {
    document.querySelector(".comm-area")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
}

function handleUpdate() {
  activities.reload();
  ticketAgentActivitiesRef.value?.scrollToLatestActivity();
}



function filterActivities(eventType: TicketTab) {
  if (eventType === "activity") {
    return _activities.value.filter(
      (activity) => activity.type !== "email" && activity.type !== "comment"
    );
  }
  return _activities.value.filter((activity) => activity.type === eventType);
}

</script>

<style scoped></style>
