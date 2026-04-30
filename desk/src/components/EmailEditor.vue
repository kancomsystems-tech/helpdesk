<template>
  <TextEditor
    ref="editorRef"
    :editor-class="[
      'prose-sm max-w-full mx-6 md:mx-10 py-3 [&_table]:w-full [&_table]:max-w-full [&_table]:table-fixed [&_td]:break-words [&_th]:break-words [&_td:first-child]:min-w-[40px] [&_th:first-child]:min-w-[40px]',
      getFontFamily(newEmail),
      '[&_p.reply-to-content]:hidden',
    ]"
    :content="newEmail"
    :starterkit-options="{ heading: { levels: [2, 3, 4, 5, 6] } }"
    :placeholder="placeholder"
    :editable="editable"
    @change="editable ? (newEmail = $event) : null"
    :extensions="[ComponentUtils, HandleExcelPaste]"
    :uploadFunction="(file:any)=>uploadFunction(file, doctype, ticketId)"
    @keydown.capture="handleKeydown"
  >
    <template #top>
      <div class="mx-6 md:mx-10 flex items-center gap-2 border-y py-2.5">
        <span class="text-xs text-gray-500">TO:</span>
        <MultiSelectInput
          v-model="toEmailsClone"
          class="flex-1"
          :validate="validateEmailWithZod"
          :error-message="(value) => `${value} is an invalid email address`"
        />
        <Button
          :label="'CC'"
          :class="[cc ? 'bg-gray-300 hover:bg-gray-200' : '']"
          @click="toggleCC()"
        />
        <Button
          :label="'BCC'"
          :class="[bcc ? 'bg-gray-300 hover:bg-gray-200' : '']"
          @click="toggleBCC()"
        />
      </div>
      <div
        v-if="showCC || cc"
        class="mx-10 flex items-center gap-2 py-2.5"
        :class="cc || showCC ? 'border-b' : ''"
      >
        <span class="text-xs text-gray-500">CC:</span>
        <MultiSelectInput
          ref="ccInput"
          v-model="ccEmailsClone"
          class="flex-1"
          :validate="validateEmailWithZod"
          :error-message="(value) => `${value} is an invalid email address`"
        />
      </div>
      <div
        v-if="showBCC || bcc"
        class="mx-10 flex items-center gap-2 py-2.5"
        :class="bcc || showBCC ? 'border-b' : ''"
      >
        <span class="text-xs text-gray-500">BCC:</span>
        <MultiSelectInput
          ref="bccInput"
          v-model="bccEmailsClone"
          class="flex-1"
          :validate="validateEmailWithZod"
          :error-message="(value) => `${value} is an invalid email address`"
        />
      </div>
    </template>

    <template #editor>
      <div class="overflow-y-auto min-h-[12rem] max-h-[50vh]">
        <EditorContent :editor="editor" />

      </div>
    </template>
    <template #bottom>
      <!-- Attachments -->
      <div class="flex flex-wrap gap-2 px-10">
        <AttachmentItem
          v-for="a in attachments"
          :key="a.file_url"
          :label="a.file_name"
          :url="!['MOV', 'MP4'].includes(a.file_type) ? a.file_url : null"
        >
          <template #suffix>
            <FeatherIcon
              class="h-3.5"
              name="x"
              @click.self.stop="removeAttachment(a)"
            />
          </template>
        </AttachmentItem>
      </div>
      <!-- TextEditor Fixed Menu -->
      <div
        class="flex justify-between overflow-scroll pl-10 py-2.5 items-center"
      >
        <div class="flex items-center overflow-x-auto w-[60%]">
          <div class="flex gap-1">
            <FileUploader
              :upload-args="{
                doctype: doctype,
                docname: ticketId,
                private: true,
              }"
              @success="
                (f) => {
                  attachments.push(f);
                }
              "
            >
              <template #default="{ openFileSelector, uploading }">
                {{ void (isUploading = uploading) }}
                <Button
                  variant="ghost"
                  @click="openFileSelector()"
                  :loading="uploading"
                >
                  <template #icon>
                    <AttachmentIcon
                      class="h-4"
                      style="color: #000000; stroke-width: 1.5 !important"
                    />
                  </template>
                </Button>
              </template>
            </FileUploader>
            <Button
              variant="ghost"
              @click="showSavedRepliesSelectorModal = true"
            >
              <template #icon>
                <SavedReplyIcon class="h-4" />
              </template>
            </Button>
          </div>
          <TextEditorFixedMenu class="ml-1" :buttons="textEditorMenuButtons" />
        </div>
        <div
          class="flex items-center justify-end space-x-2 sm:mt-0 w-[40%] mr-9"
        >
          <Button label="Discard" @click="handleDiscard" />
          <Button
            variant="solid"
            :disabled="isDisabled"
            :loading="sendMail.loading"
            :label="label"
            @click="
              () => {
                submitMail();
              }
            "
          />
        </div>
      </div>
    </template>
  </TextEditor>
  <SavedRepliesSelectorModal
    v-if="showSavedRepliesSelectorModal"
    v-model="showSavedRepliesSelectorModal"
    :doctype="doctype"
    @apply="applySavedReplies"
    :ticketId="ticketId"
  />
</template>

<script setup lang="ts">
import {
  AttachmentItem,
  MultiSelectInput,
  SavedRepliesSelectorModal,
} from "@/components";
import { EditorContent } from "@tiptap/vue-3";
import { AttachmentIcon } from "@/components/icons";
import { useTyping } from "@/composables/realtime";
import { useAuthStore } from "@/stores/auth";
import { ComponentUtils, HandleExcelPaste } from "@/tiptap-extensions";
import {
  getFontFamily,
  isContentEmpty,
  removeAttachmentFromServer,
  textEditorMenuButtons,
  uploadFunction,
  validateEmailWithZod,
} from "@/utils";
import { useStorage } from "@vueuse/core";
import {
  FileUploader,
  TextEditor,
  TextEditorFixedMenu,
  createResource,
  toast,
} from "frappe-ui";
import { useOnboarding } from "frappe-ui/frappe";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import SavedReplyIcon from "./icons/SavedReplyIcon.vue";

const editorRef = ref(null);
const showSavedRepliesSelectorModal = ref(false);

const props = defineProps({
  ticketId: {
    type: String,
    default: null,
  },
  placeholder: {
    type: String,
    default: null,
  },
  label: {
    type: String,
    default: "Send",
  },
  editable: {
    type: Boolean,
    default: true,
  },
  doctype: {
    type: String,
    default: "HD Ticket",
  },
  toEmails: {
    type: Array,
    default: () => [],
  },
  ccEmails: {
    type: Array,
    default: () => [],
  },
  bccEmails: {
    type: Array,
    default: () => [],
  },
});

const label = computed(() => {
  return sendMail.loading ? "Sending..." : props.label;
});

const emit = defineEmits(["submit", "discard"]);

const newEmail = useStorage<null | string>(
  "emailBoxContent" + props.ticketId,
  null
);


const { updateOnboardingStep } = useOnboarding("helpdesk");
const { isManager } = useAuthStore();

// Initialize typing composable
const { onUserType, cleanup } = useTyping(props.ticketId);

const attachments = ref([]);
const isUploading = ref(false);
const isDisabled = computed(() => {
  return isContentEmpty(newEmail.value) || sendMail.loading || isUploading.value;
});

// Watch for changes in email content to trigger typing events
watch(newEmail, (newValue, oldValue) => {
  if (newValue !== oldValue && newValue) {
    onUserType();
  }
});

onBeforeUnmount(() => {
  cleanup();
});

const toEmailsClone = ref([...props.toEmails]);
const ccEmailsClone = ref([...props.ccEmails]);
const bccEmailsClone = ref([...props.bccEmails]);
const showCC = ref(false);
const showBCC = ref(false);
const cc = computed(() => (ccEmailsClone.value?.length ? true : false));
const bcc = computed(() => (bccEmailsClone.value?.length ? true : false));
const ccInput = ref(null);
const bccInput = ref(null);

function applySavedReplies(template: string) {
  isContentEmpty(newEmail.value)
    ? (newEmail.value = template)
    : (newEmail.value = newEmail.value + "\n" + template);
  showSavedRepliesSelectorModal.value = false;
}

const sendMail = createResource({
  url: "run_doc_method",
  makeParams: () => ({
    dt: props.doctype,
    dn: props.ticketId,
    method: "reply_via_agent",
    args: {
      attachments: attachments.value.map((x) => x.name),
      to: toEmailsClone.value.join(","),
      cc: ccEmailsClone.value?.join(","),
      bcc: bccEmailsClone.value?.join(","),
      message: newEmail.value,
    },
  }),
  onSuccess: () => {
    resetState();
    emit("submit");

    if (isManager) {
      updateOnboardingStep("reply_on_ticket");
    }
  },
  debounce: 300,
});

function submitMail() {
  if (isContentEmpty(newEmail.value)) {
    return false;
  }
  if (!toEmailsClone.value.length) {
    toast.warning(
      "Email has no recipients. Please add at least one email address in the 'TO' field."
    );
    return false;
  }

  sendMail.submit();
}

function toggleCC() {
  showCC.value = !showCC.value;

  showCC.value &&
    nextTick(() => {
      ccInput.value.setFocus();
    });
}

function toggleBCC() {
  showBCC.value = !showBCC.value;
  showBCC.value &&
    nextTick(() => {
      bccInput.value.setFocus();
    });
}

async function removeAttachment(attachment) {
  attachments.value = attachments.value.filter((a) => a !== attachment);
  await removeAttachmentFromServer(attachment.name);
}

function addToReply(
  body: string,
  toEmails: string[],
  ccEmails: string[],
  bccEmails: string[],
  originalEmail: Record<string, any> = {}
) {
  const isForward = toEmails.includes("__FORWARD_EMPTY_TO__");

  toEmailsClone.value = isForward ? [] : toEmails;
  ccEmailsClone.value = ccEmails;
  bccEmailsClone.value = bccEmails;

  const cleanBody = (body || "")
    .split(/<p[^>]*>\s*On earlier email[\s\S]*$/i)[0]
    .split(/On earlier email[\s\S]*$/i)[0]
    .replace(/__FORWARD_EMPTY_TO__/g, "")
    .trim();

  const quoteRecipients = [
    originalEmail.to?.length ? `to ${originalEmail.to.join(", ")}` : "",
    originalEmail.cc?.length ? `cc ${originalEmail.cc.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("; ");

  const formattedDate = originalEmail.date
    ? new Date(originalEmail.date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "earlier email";

  const quoteHeader = [
    "<p><br></p>",
    "<hr>",
    `<p style="color:#555;font-size:13px;line-height:1.35;">On ${formattedDate}, ${originalEmail.from || "sender"}${quoteRecipients ? ` (${quoteRecipients})` : ""} wrote:</p>`,
  ].join("");

  const replyContent = `
    ${quoteHeader}
    <blockquote style="border-left:2px solid #d1d5db;margin:6px 0;padding-left:10px;color:#4b5563;font-size:13px;line-height:1.35;">
      ${cleanBody}
    </blockquote>
  `;

  editorRef.value.editor.chain().setContent(replyContent).run();

  nextTick(() => {
    editorRef.value.editor.commands.focus("start");
    newEmail.value = editorRef.value.editor.getHTML();
  });
}

function resetState() {
  newEmail.value = null;
  attachments.value = [];
}

function handleDiscard() {
  attachments.value = [];
  newEmail.value = null;
  ccEmailsClone.value = [];
  bccEmailsClone.value = [];
  showCC.value = false;
  showBCC.value = false;

  emit("discard");
}

function handleSelectAll(e: KeyboardEvent) {
  const active = document.activeElement;
  const editorContext = editorRef.value?.editor;
  const editorDom = editorContext?.view?.dom as HTMLElement | undefined;
  if (!editorDom || !editorDom.contains(active)) return;

  e.preventDefault();
  editorContext?.commands.selectAll();
}

function handleKeydown(e: KeyboardEvent) {
  const key = e.key.toLowerCase();

  if ((e.metaKey || e.ctrlKey) && key === "a") {
    handleSelectAll(e);
  }
}

const editor = computed(() => {
  return editorRef.value.editor;
});

defineExpose({
  addToReply,
  editor,
  submitMail,
});
</script>
