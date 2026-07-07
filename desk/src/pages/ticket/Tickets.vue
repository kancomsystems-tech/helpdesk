<template>
  <div class="kancom-travel-requests-workbench">
    <LayoutHeader>
      <WorkbenchHeader
        :create-route="{ name: isCustomerPortal ? 'TicketNew' : 'TicketAgentNew' }"
        :chips="workbenchChips"
        :active-chip="activeWorkbenchChip"
        :metrics="workbenchVisibilityMetrics"
        :view-options="dropdownOptions"
        :view-actions="viewActions"
        :current-view="currentView"
        @chip-click="handleWorkbenchChip"
      />
    </LayoutHeader>
    <ListViewBuilder
      ref="listViewRef"
      :options="options"
      @empty-state-action="
        () =>
          $router.push({
            name: isCustomerPortal ? 'TicketNew' : 'TicketAgentNew',
          })
      "
      @row-click="
        (row) =>
          $router.push({
            name: isCustomerPortal ? 'TicketCustomer' : 'TicketAgent',
            params: { ticketId: row },
          })
      "
    />
    <ExportModal
      v-model="showExportModal"
      :rowCount="$refs.listViewRef?.list?.data?.total_count ?? 0"
      @update="
        ({ export_type, export_all }) => exportRows(export_type, export_all)
      "
    />
    <BulkAssignDialog
      v-model="showBulkAssignDialog"
      :selected-tickets="selectedTickets"
      @assigned="reset(true)"
    />
    <ViewModal
      v-if="viewDialog.show"
      v-model="viewDialog"
      @update="(view, action) => handleView(view, action)"
    />
  </div>
</template>

<script setup lang="ts">
import { LayoutHeader, ListViewBuilder } from "@/components";
import {
  EditIcon,
  PinIcon,
  TicketIcon,
  UnpinIcon,
} from "@/components/icons";
import ExportModal from "@/components/ticket/ExportModal.vue";
import WorkbenchHeader from "@/kancom/ticketList/WorkbenchHeader.vue";
import BulkAssignDialog from "@/kancom/ticketList/BulkAssignDialog.vue";
import {
  kancomWorkbenchColumns,
  kancomWorkbenchRows,
} from "@/kancom/ticketList/workbenchColumns";
import {
  getWorkbenchChipFilters,
  workbenchChips,
  type WorkbenchChip,
} from "@/kancom/ticketList/workbenchFilters";
import { getWorkbenchVisibilityMetrics } from "@/kancom/ticketList/visibilityMetrics";
import {
  renderDateTimeCell,
  renderOwnerCell,
  renderRequestCell,
  renderResponseByCell,
  renderResolutionByCell,
  renderSlaCell,
  renderStatusCell,
} from "@/kancom/ticketList/renderers";
import ViewModal from "@/components/ViewModal.vue";
import { currentView, useView } from "@/composables/useView";
import { useAuthStore } from "@/stores/auth";
import { globalStore } from "@/stores/globalStore";
import { useTicketStatusStore } from "@/stores/ticketStatus";
import { useUserStore } from "@/stores/user";
import { __ } from "@/translation";
import { View } from "@/types";
import { getIcon, isCustomerPortal } from "@/utils";
import { FeatherIcon, toast, usePageMeta } from "frappe-ui";
import { computed, h, onMounted, onUnmounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();

const {
  getCurrentUserViews,
  createView,
  publicViews,
  pinnedViews,
  findView,
  updateView,
  deleteView,
} = useView("HD Ticket");

const { $dialog, $socket } = globalStore();
const { isAdmin, isManager, userId } = useAuthStore();

const listViewRef = ref(null);
const showExportModal = ref(false);
const showBulkAssignDialog = ref(false);

const { getStatus } = useTicketStatusStore();
const { getUser } = useUserStore();
const activeWorkbenchChip = ref("control_view");

const loadedWorkbenchRows = computed(
  () => listViewRef.value?.list?.data?.data ?? []
);
const workbenchVisibilityMetrics = computed(() =>
  getWorkbenchVisibilityMetrics(loadedWorkbenchRows.value, getStatus)
);

const listSelections = ref(new Set<string>());
const selectedTickets = computed(() => Array.from(listSelections.value));
const canBulkAssign = computed(
  () => !isCustomerPortal.value && (isManager || isAdmin)
);

const selectBannerActions = [
  {
    label: __("Bulk Assign"),
    icon: "user-check",
    onClick: (selections: Set<string>) => {
      listSelections.value = new Set(selections);
      showBulkAssignDialog.value = true;
    },
    condition: () => canBulkAssign.value,
  },
  {
    label: __("Export"),
    icon: "download",
    onClick: (selections: Set<string>) => {
      listSelections.value = new Set(selections);
      showExportModal.value = true;
    },
  },
];

const options = {
  doctype: "HD Ticket",
  columns: kancomWorkbenchColumns,
  rows: kancomWorkbenchRows,
  order_by: "modified desc",
  ignoreDefaultView: true,
  ignoreSavedColumns: true,
  wrapperClass: "kancom-travel-requests-workbench",
  fieldLabels: {
    name: "Request ID",
    subject: "Search Request",
    customer: "Client",
    modified: "Updated",
  },
  columnConfig: {
    subject: {
      custom: ({ row, item }) => renderRequestCell({ row, item, userId }),
    },
    status: {
      custom: ({ item }) =>
        renderStatusCell({
          item,
          getStatus,
          isCustomerPortal: isCustomerPortal.value,
        }),
    },
    _assign: {
      custom: ({ item }) => renderOwnerCell({ item, getUser }),
    },
    agreement_status: {
      custom: ({ item }) => renderSlaCell({ item }),
    },
    creation: {
      custom: ({ item }) => renderDateTimeCell({ item }),
    },
    modified: {
      custom: ({ item }) => renderDateTimeCell({ item }),
    },
    response_by: {
      custom: ({ row, item }) => renderResponseByCell({ row, item }),
    },
    resolution_by: {
      custom: ({ row, item }) =>
        renderResolutionByCell({ row, item, getStatus }),
    },
  },
  isCustomerPortal: isCustomerPortal.value,
  selectable: true,
  showSelectBanner: true,
  selectBannerActions,
  emptyState: {
    title: __("No Travel Requests Found"),
    actionLabel: __("New Request"),
    icon: h(TicketIcon, {
      class: "h-10 w-10",
    }),
  },
  rowRoute: {
    name: isCustomerPortal.value ? "TicketCustomer" : "TicketAgent",
    prop: "ticketId",
  },
  hideColumnSetting: true,
};

function handleWorkbenchChip(chip: WorkbenchChip) {
  const filters = getWorkbenchChipFilters(chip, userId);
  if (!filters) return;

  activeWorkbenchChip.value = chip.key;
  listViewRef.value?.applyFilters(filters);
}

async function exportRows(
  export_type: "CSV" | "Excel" = "Excel",
  export_all: boolean = false
) {
  const list = listViewRef.value?.list;
  if (!list) return;

  const fields = JSON.stringify(list.data.columns.map((f) => f.key));
  const order_by = list.params.order_by;

  let filters = { ...list.params.filters };
  let pageLength: number;

  if (export_all) {
    filters = JSON.stringify(filters);
    pageLength = list.data.total_count;
  } else {
    pageLength = listSelections.value.size;
    filters["name"] = ["in", Array.from(listSelections.value)];
    filters = JSON.stringify(filters);
  }

  window.location.href = `/api/method/frappe.desk.reportview.export_query?file_format_type=${export_type}&title=HD Ticket&doctype=HD Ticket&fields=${fields}&filters=${filters}&order_by=${order_by}&page_length=${pageLength}&start=0&view=Report&with_comment_count=1`;
  reset();
  showExportModal.value = false;
}

function reset(reload = false) {
  listViewRef.value?.unselectAll();
  listSelections.value?.clear();
  if (reload) listViewRef.value.reload();
}


let viewDialog = reactive({
  show: false,
  view: {
    label: "",
    icon: "",
    name: "",
  },
  mode: "create",
});

const dropdownOptions = computed(() => {
  const items = [
    {
      group: __("Default Views"),
      items: [
        {
          label: __("Control View"),
          icon: "align-justify",
          onClick: () =>
            router.push({
              name: isCustomerPortal.value ? "TicketsCustomer" : "TicketsAgent",
            }),
        },
      ],
    },
  ];

  // Saved Views
  if (getCurrentUserViews.value?.length !== 0) {
    items.push({
      group: __("Saved Views"),
      items: parseViews(getCurrentUserViews.value),
    });
  }
  if (pinnedViews.value?.length !== 0) {
    items.push({
      group: __("Private Views"),
      items: parseViews(pinnedViews.value),
    });
  }
  if (publicViews.value?.length !== 0) {
    items.push({
      group: __("Public Views"),
      items: parseViews(publicViews.value),
    });
  }

  items.push({
    group: __("Create View"),
    hideLabel: true,
    items: [
      {
        label: __("Create View"),
        icon: "plus",
        onClick: () => {
          resetState();
          viewDialog.show = true;
        },
      },
    ],
  });

  return items;
});

let selectedView: View | null = null;

const viewActions = (view) => {
  const _view = findView(view.name).value;

  let actions = [
    {
      group: __("Default Views"),
      hideLabel: true,
      items: [
        {
          label: __("Duplicate"),
          icon: h(FeatherIcon, { name: "copy" }),
          onClick: () => {
            viewDialog.view.label = _view.label + " (New)";
            viewDialog.view.icon = _view.icon;
            viewDialog.view.name = _view.name;
            viewDialog.mode = "duplicate";
            selectedView = _view;
            viewDialog.show = true;
          },
        },
      ],
    },
  ];
  if (!_view.public || isManager) {
    actions[0].items.push({
      label: __("Edit"),
      icon: h(EditIcon, { class: "h-4 w-4" }),
      onClick: () => {
        viewDialog.view.label = _view.label;
        viewDialog.view.icon = _view.icon;
        viewDialog.view.name = _view.name;
        viewDialog.mode = "edit";
        viewDialog.show = true;
      },
    });
    if (!_view.public) {
      actions[0].items.push({
        label: _view?.pinned ? __("Unpin View") : __("Pin View"),
        icon: h(_view?.pinned ? UnpinIcon : PinIcon, { class: "h-4 w-4" }),
        onClick: () => {
          const newView = {
            name: _view.name,
          };
          newView["pinned"] = !_view.pinned;
          updateView(newView);
        },
      });
    }
    if (isManager && !isCustomerPortal.value) {
      actions[0].items.push({
        label: _view?.public ? __("Make Private") : __("Make Public"),
        icon: h(FeatherIcon, {
          name: _view?.public ? "lock" : "unlock",
          class: "h-4 w-4",
        }),
        onClick: () => {
          const newView = {
            name: _view.name,
            public: !_view.public,
          };

          if (_view.public) {
            $dialog({
              title: __("Make {0} private?", [_view.label]),
              message: __(
                "This view is currently public. Changing it to private will hide it for all the users."
              ),
              actions: [
                {
                  label: __("Confirm"),
                  variant: "solid",
                  onClick({ close }) {
                    close();
                    updateView(newView);
                  },
                },
              ],
            });
          } else {
            updateView(newView);
          }
        },
      });
    }
    actions.push({
      group: __("Delete View"),
      hideLabel: true,
      items: [
        {
          label: __("Delete"),
          icon: "trash-2",
          onClick: () => {
            $dialog({
              title: __("Delete {0}?", [_view.label]),
              message:
                __("Are you sure you want to delete this view?") +
                (_view.public
                  ? " " +
                    __(
                      "This view is public, and will be removed for all users."
                    )
                  : ""),
              actions: [
                {
                  label: __("Confirm"),
                  variant: "solid",
                  onClick({ close }) {
                    if (route.query.view === _view.name) {
                      router.push({
                        name: isCustomerPortal.value
                          ? "TicketsCustomer"
                          : "TicketsAgent",
                      });
                    }
                    deleteView(_view.name);
                    handleSuccess(__("deleted"));
                    close();
                  },
                },
              ],
            });
          },
        },
      ],
    });
  }

  return actions;
};

function parseViews(views: View[]) {
  return views?.map((view) => {
    return {
      ...view,
      onClick: () => {
        currentView.value = {
          label: view.label,
          icon: view.icon,
        };
        router.push({
          name: view.route_name,
          query: {
            view: view.name,
          },
        });
      },
    };
  });
}

function handleView(viewInfo, action) {
  let view: View;
  if (action === "update") {
    updateView(viewInfo);
    handleSuccess("updated");
    currentView.value = {
      label: viewInfo.label,
      icon: getIcon(viewInfo.icon),
    };
    return;
  } else if (action === "duplicate") {
    view = {
      ...selectedView,
      filters: JSON.stringify(selectedView.filters),
      columns: JSON.stringify(kancomWorkbenchColumns),
      rows: JSON.stringify(kancomWorkbenchRows),
      label: viewInfo.label,
      icon: viewInfo.icon,
      public: false,
      pinned: false,
    };
  } else {
    view = {
      dt: "HD Ticket",
      type: "list",
      label: viewInfo.label ?? __("Control View"),
      icon: viewInfo.icon ?? "",
      route_name: router.currentRoute.value.name as string,
      order_by: listViewRef.value?.list?.params.order_by,
      filters: JSON.stringify(listViewRef.value?.list?.params.filters),
      columns: JSON.stringify(kancomWorkbenchColumns),
      rows: JSON.stringify(kancomWorkbenchRows),
      is_customer_portal: isCustomerPortal.value,
    };
  }

  // createView
  createView(view, (d) => {
    currentView.value = {
      label: d.label || __("Control View"),
      icon: getIcon(d.icon),
    };
    router.push({
      name: isCustomerPortal.value ? "TicketsCustomer" : "TicketsAgent",
      query: {
        view: d.name,
      },
    });

    handleSuccess();
  });
}

function handleSuccess(msg = __("created")) {
  toast.success(__("View {0}", [msg]));
  resetState();
}
function resetState() {
  viewDialog.show = false;
  viewDialog.view.label = "";
  viewDialog.view.icon = "";
  viewDialog.view.name = "";
  viewDialog.mode = null;
  selectedView = null;
}

onMounted(() => {
  if (!route.query.view) {
    currentView.value = {
      label: __("Control View"),
      icon: LucideAlignJustify,
    };
  }
  if (!isCustomerPortal.value) {
    $socket.on("helpdesk:new-ticket", () => {
      listViewRef.value?.reload();
    });
  }
});

onUnmounted(() => {
  if (!isCustomerPortal.value) {
    $socket.off("helpdesk:new-ticket");
  }
});

usePageMeta(() => {
  return {
    title: __("Travel Requests Workbench"),
  };
});
</script>
