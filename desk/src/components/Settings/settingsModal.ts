import { computed, h, markRaw, ref, watch } from "vue";
import Agents from "./Agents.vue";
import EmailConfig from "./EmailConfig.vue";
import TeamsConfig from "./Teams/TeamsConfig.vue";
import Sla from "./Sla/Sla.vue";
import HolidayList from "./Holiday/Holiday.vue";
import FieldDependencyConfig from "./FieldDependency/FieldDependencyConfig.vue";
import InviteAgents from "./InviteAgents.vue";
import LucideMail from "~icons/lucide/mail";
import LucideMailOpen from "~icons/lucide/mail-open";
import LucideUser from "~icons/lucide/user";
import LucideUserPlus from "~icons/lucide/user-plus";
import LucideUsers from "~icons/lucide/users";
import ShieldCheck from "~icons/lucide/shield-check";
import Briefcase from "~icons/lucide/briefcase";
import AssignmentRules from "./Assignment Rules/AssignmentRules.vue";
import Settings from "~icons/lucide/settings-2";
import { FieldDependencyIcon, PhoneIcon } from "@/components/icons";
import Telephony from "./Telephony/Telephony.vue";
import { EmailNotifications } from "./EmailNotifications";
import { __ } from "@/translation";
import SavedReplies from "./SavedReplies/SavedReplies.vue";
import Profile from "./Profile/Profile.vue";
import { Avatar } from "frappe-ui";
import { useAuthStore } from "@/stores/auth";
import { useProductContextStore } from "@/kancom/product/store";
import { getKancomSetupTabs } from "@/kancom/shell/navigation";
import General from "./General/General.vue";
import SettingsGear from "~icons/lucide/settings";
import SavedReplyIcon from "../icons/SavedReplyIcon.vue";
import SetupSummary from "./SetupSummary.vue";
import TeamMembers from "./TeamMembers.vue";
import AddOperationalUser from "@/kancom/product/AddOperationalUser.vue";
import LucideClipboardCheck from "~icons/lucide/clipboard-check";
import LucideContactRound from "~icons/lucide/contact-round";

export const showSettingsModal = ref(false);
export const settingsModalMode = ref<"full" | "setup">("full");

const auth = useAuthStore();
const productContextStore = useProductContextStore();

const isKancomSetupTab = (label: string) =>
  getKancomSetupTabs(
    productContextStore.context?.authoritative_persona || null,
    productContextStore.hasCapability("managed_configuration"),
    Boolean(productContextStore.context?.is_platform_administrator)
  ).some((tabName) => label === __(tabName));

export const tabs = computed(() => {
  const _tabs = [
    {
      label: __("My Settings"),
      items: [
        {
          label: __("Profile"),
          icon: h(Avatar, {
            image: auth.userImage,
            label: auth.userName,
            size: "xs",
          }),
          component: markRaw(Profile),
        },
        {
          label: __("Saved Replies"),
          icon: markRaw(SavedReplyIcon),
          component: markRaw(SavedReplies),
        },
      ],
    },
    {
      label: __("People & Teams"),
      items: [
        {
          label: __("Add User"),
          icon: markRaw(LucideUserPlus),
          component: markRaw(AddOperationalUser),
        },
        {
          label: __("Team Members"),
          icon: markRaw(LucideContactRound),
          component: markRaw(TeamMembers),
        },
        {
          label: __("Agents"),
          icon: markRaw(LucideUser),
          component: markRaw(Agents),
        },
        {
          label: __("Invite Agents"),
          icon: markRaw(LucideUserPlus),
          component: markRaw(InviteAgents),
        },
        {
          label: __("Teams"),
          icon: markRaw(LucideUsers),
          component: markRaw(TeamsConfig),
        },
      ],
    },
    {
      label: __("Operations Configuration"),
      items: [
        {
          label: __("SLA Policies"),
          icon: markRaw(ShieldCheck),
          component: markRaw(Sla),
        },
        {
          label: __("Business Holidays"),
          icon: markRaw(Briefcase),
          component: markRaw(HolidayList),
        },
        {
          label: __("Assignment Rules"),
          icon: markRaw(h(Settings, { class: "rotate-90" })),
          component: markRaw(AssignmentRules),
        },
      ],
    },
    {
      label: __("System"),
      items: [
        {
          label: __("Setup Summary"),
          icon: markRaw(LucideClipboardCheck),
          component: markRaw(SetupSummary),
        },
      ],
    },
    {
      label: __("Technical Administration"),
      items: [
        {
          label: __("Email Accounts"),
          icon: markRaw(LucideMail),
          component: markRaw(EmailConfig),
        },
        {
          label: __("Email Notifications"),
          icon: markRaw(LucideMailOpen),
          component: markRaw(EmailNotifications),
        },
        {
          label: __("General"),
          icon: markRaw(SettingsGear),
          component: markRaw(General),
        },
        {
          label: __("Field Dependencies"),
          icon: markRaw(FieldDependencyIcon),
          component: markRaw(FieldDependencyConfig),
        },
        {
          label: __("Telephony"),
          icon: markRaw(PhoneIcon),
          component: markRaw(Telephony),
        },
      ],
    },
  ];

  return _tabs
    .map((tab) => ({
      ...tab,
      items: tab.items.filter((item) => isKancomSetupTab(item.label)),
    }))
    .filter((tab) => tab.items.length);
});

const getFirstSettingsTab = () => tabs.value[0]?.items[0] || null;

export const activeTab = ref(getFirstSettingsTab());

export const nextActiveTab = ref(null);

export const disableSettingModalOutsideClick = ref(false);

type TabName =
  | "Profile"
  | "Add User"
  | "Setup Summary"
  | "Team Members"
  | "Email Accounts"
  | "Email Notifications"
  | "General"
  | "Agents"
  | "Invite Agents"
  | "Teams"
  | "SLA Policies"
  | "Business Holidays"
  | "Assignment Rules"
  | "Field Dependencies"
  | "Telephony"
  | "Saved Replies";

export const setActiveSettingsTab = (tabName: TabName) => {
  const availableItems = tabs.value.map((tab) => tab.items).flat();
  activeTab.value =
    (tabName &&
      availableItems.find((tab) => tab.label == __(tabName))) ||
    availableItems[0] ||
    null;
};

watch(
  tabs,
  (availableTabs) => {
    const availableItems = availableTabs.map((tab) => tab.items).flat();
    if (!availableItems.length) {
      activeTab.value = null;
    } else if (
      !activeTab.value ||
      !availableItems.some((tab) => tab.label === activeTab.value?.label)
    ) {
      activeTab.value = availableItems[0];
    }
  },
  { immediate: true }
);

watch(showSettingsModal, (show) => {
  if (!show) {
    settingsModalMode.value = "full";
  }
});
