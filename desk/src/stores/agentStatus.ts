import { useLocalStorage } from "@vueuse/core";
import { useAuthStore } from "@/stores/auth";
import { globalStore } from "@/stores/globalStore";
import { __ } from "@/translation";
import { HDAgent, HDAgentStatus } from "@/types/doctypes";
import { createListResource, createResource, toast } from "frappe-ui";
import { defineStore, storeToRefs } from "pinia";
import { computed, reactive, watch } from "vue";

interface LiveAvailability {
  availability: string;
  changedOn: string;
}

interface AvailabilityEvent {
  agent: string;
  availability: string;
  availability_changed_on: string;
  changed_by: string;
}

const statusColorMap: Record<string, string> = {
  black: "bg-surface-gray-9",
  gray: "bg-surface-gray-7",
  blue: "bg-surface-gray-6",
  green: "bg-surface-gray-8",
  red: "bg-surface-gray-3",
  pink: "bg-surface-gray-5",
  orange: "bg-surface-gray-4",
  amber: "bg-surface-gray-5",
  yellow: "bg-surface-gray-4",
  cyan: "bg-surface-gray-6",
  teal: "bg-surface-gray-6",
  violet: "bg-surface-gray-5",
  purple: "bg-surface-gray-5",
  active: "bg-surface-gray-8",
  away: "bg-surface-gray-5",
  unavailable: "bg-surface-gray-3",
};

const defaultColor = "bg-surface-gray-6";

export const useAgentStatusStore = defineStore("agentStatus", () => {
  const auth = useAuthStore();
  const {
    availability,
    availabilityChangedBy,
    availabilityChangedOn,
    hasAgentRecord,
    isAdmin,
    isManager,
    userId,
  } = storeToRefs(auth);
  const canLoadAvailability = computed(
    () => hasAgentRecord.value || isManager.value || isAdmin.value
  );
  const myAgentName = computed(() =>
    hasAgentRecord.value ? userId.value || "" : ""
  );
  const lastSeenStatusChange = useLocalStorage("hd_status_change_seen", "");
  const liveStatuses = reactive<Record<string, LiveAvailability>>({});

  function noteStatusChange(
    availability?: string,
    changedOn?: string,
    changedBy?: string
  ) {
    if (!availability || !changedOn || changedOn === lastSeenStatusChange.value) {
      return;
    }
    const firstVisit = !lastSeenStatusChange.value;
    lastSeenStatusChange.value = changedOn;
    if (firstVisit || !changedBy || changedBy === userId.value) {
      return;
    }
    toast.info(__("Your status was changed to {0}.", [__(availability)]));
  }

  const statuses = createListResource({
    doctype: "HD Agent Status",
    cache: ["HD Agent Status", "list"],
    fields: ["name", "agent_status", "category", "color", "enabled", "status_order"],
    orderBy: "`tabHD Agent Status`.status_order asc, `tabHD Agent Status`.name asc",
    pageLength: 1000,
    auto: false,
  });

  const agents = createListResource({
    doctype: "HD Agent",
    fields: ["name", "availability", "availability_changed_on"],
    pageLength: 1000,
    auto: false,
  });

  const { $socket } = globalStore();
  const availabilityListener = (data: AvailabilityEvent) => {
    if (data.agent === myAgentName.value) {
      noteStatusChange(
        data.availability,
        data.availability_changed_on,
        data.changed_by
      );
    }
    applyLive(data.agent, data.availability, data.availability_changed_on);
  };

  watch(
    canLoadAvailability,
    (enabled) => {
      if (enabled) {
        if (typeof $socket.off === "function") {
          $socket.off("agent_availability_updated", availabilityListener);
        }
        $socket.on("agent_availability_updated", availabilityListener);
        if (!statuses.fetched) {
          statuses.fetch();
        }
        if (!agents.fetched) {
          agents.fetch();
        }
        return;
      }

      if (typeof $socket.off === "function") {
        $socket.off("agent_availability_updated", availabilityListener);
      }
    },
    { immediate: true }
  );

  function applyLive(agent?: string, availability?: string, changedOn?: string) {
    if (!agent || !availability) {
      return;
    }
    liveStatuses[agent] = { availability, changedOn: changedOn ?? "" };
  }

  watch(
    () => agents.data,
    (rows?: HDAgent[]) => {
      if (!rows) return;
      rows.forEach((row) =>
        applyLive(row.name, row.availability, row.availability_changed_on)
      );
    },
    { immediate: true }
  );

  watch(
    availability,
    (currentAvailability) =>
      applyLive(myAgentName.value, currentAvailability, availabilityChangedOn.value),
    { immediate: true }
  );

  watch(
    availabilityChangedOn,
    (changedOn) => {
      if (!myAgentName.value) return;
      noteStatusChange(availability.value, changedOn, availabilityChangedBy.value);
    },
    { immediate: true }
  );

  const setMyAvailability = createResource({
    url: "frappe.client.set_value",
    onSuccess: () => toast.success(__("Status updated successfully.")),
    onError: () => toast.error(__("Could not update status.")),
  });

  const myStatus = computed(
    () => (myAgentName.value && liveStatuses[myAgentName.value]?.availability) || ""
  );

  const statusOptions = computed<string[]>(() =>
    (statuses.data ?? [])
      .filter((status: HDAgentStatus) => status.enabled)
      .map((status: HDAgentStatus) => status.agent_status)
  );

  function setMyStatus(status: string) {
    if (!myAgentName.value || !status || status === myStatus.value) {
      return;
    }

    const previous = liveStatuses[myAgentName.value];
    applyLive(myAgentName.value, status);
    setMyAvailability.submit(
      {
        doctype: "HD Agent",
        name: myAgentName.value,
        fieldname: "availability",
        value: status,
      },
      {
        onError: () => {
          if (previous) {
            liveStatuses[myAgentName.value] = previous;
          } else {
            delete liveStatuses[myAgentName.value];
          }
        },
      }
    );
  }

  function getStatus(name?: string): HDAgentStatus | undefined {
    if (!name) return undefined;
    return statuses.data?.find(
      (status: HDAgentStatus) => status.agent_status === name
    );
  }

  function getAgentAvailability(agent?: string): string {
    if (!agent) return "";
    return liveStatuses[agent]?.availability || "";
  }

  function statusColor(name?: string): string {
    const status = getStatus(name);
    const color = status?.color?.toLowerCase();
    const category = status?.category?.toLowerCase();
    return (
      (color && statusColorMap[color]) ||
      (category && statusColorMap[category]) ||
      defaultColor
    );
  }

  return {
    agents,
    statuses,
    liveStatuses,
    myStatus,
    statusOptions,
    setMyStatus,
    getStatus,
    getAgentAvailability,
    statusColor,
  };
});
