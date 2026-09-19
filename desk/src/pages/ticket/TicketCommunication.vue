<template>
  <div
    class="border flex-1 px-3 pt-2.5 mb-4 border-transparent bg-surface-white rounded-md shadow text-base leading-6 transition-all duration-300 ease-in-out"
  >
    <div class="mb-4 flex items-center justify-between text-base">
      <div class="flex items-center gap-0.5">
        <UserAvatar v-bind="user" size="lg" expand strong :hide-avatar="true" />
        <LucideDot class="text-gray-500 size-4" />
        <Tooltip :text="dateFormat(date, dateTooltipFormat)">
          <span class="text-gray-600">
            {{ timeAgo(date) }}
          </span>
        </Tooltip>
      </div>
    </div>

    <div v-if="channel.id !== 'email'" class="mb-2 text-sm text-gray-500">
      {{ channel.label }}
    </div>

    <EmailContent :content="sanitize(content)" />
    <div class="flex flex-wrap gap-2 mb-2">
      <AttachmentItem
        v-for="a in attachments"
        :key="a.file_url"
        :label="a.file_name"
        :url="a.file_url"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { AttachmentItem, UserAvatar } from "@/components";
import { dayjs } from "@/dayjs";
import { UserInfo } from "@/types";
import { dateFormat, dateTooltipFormat, timeAgo } from "@/utils";
import { getHelpdeskCommunicationChannel } from "@/extensions/registry";
import { Tooltip } from "frappe-ui";
import sanitizeHtml from "sanitize-html";
import { computed } from "vue";

interface Attachment {
  file_name: string;
  file_url: string;
}

interface P {
  content: string;
  date: string;
  medium?: string | null;
  user: UserInfo;
  cc?: string;
  bcc?: string;
  attachments?: Attachment[];
}

const props = withDefaults(defineProps<P>(), {
  cc: () => "",
  bcc: () => "",
  attachments: () => [],
});

const channel = computed(() => getHelpdeskCommunicationChannel(props.medium));

function sanitize(html: string) {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "video"]),
    allowedAttributes: {
      a: ["href"],
      video: ["src", "controls"],
      img: ["src"],
      table: ["border", "cellpadding", "cellspacing", "width", "data-type"],
      td: ["colspan", "rowspan", "width", "align", "valign"],
      th: ["colspan", "rowspan", "width", "align", "valign"],
    },
  });
}
</script>
