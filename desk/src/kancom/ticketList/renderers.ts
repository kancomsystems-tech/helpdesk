import { h } from "vue";
import { Badge, Tooltip } from "frappe-ui";
import { dayjs } from "@/dayjs";
import { IndicatorIcon } from "@/components/icons";

const slaStatusColorMap = {
  Fulfilled: "green",
  Failed: "red",
  "Resolution Due": "orange",
  "First Response Due": "orange",
  Paused: "blue",
};

function parseAssignees(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);

  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return value ? [value] : [];
  }
}

const knownAbbreviations = new Set(["ets", "sla", "vip", "mice"]);

export function isTechnicalUserLabel(value: string) {
  const localName = value.split("@")[0] || value;
  return /[._-]/.test(localName);
}

export function humanizeUserLabel(value: string) {
  const localName = value.split("@")[0] || value;
  const words = localName
    .split(/[._\s-]+/)
    .map((word) => {
      if (!word) return "";
      const normalized = word.toLowerCase();
      if (knownAbbreviations.has(normalized)) return normalized.toUpperCase();
      return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    })
    .filter(Boolean);

  return words.join(" ") || value;
}

function shouldHumanizeUserDisplay(displayName: string, owner: string) {
  const ownerLocalName = owner.split("@")[0];
  return (
    displayName === owner ||
    displayName === ownerLocalName ||
    isTechnicalUserLabel(displayName)
  );
}

export function formatAssignedOwners(
  value: unknown,
  getUser: (name: string) => Record<string, any>
) {
  const owners = parseAssignees(value);
  if (!owners.length) return "Unassigned";

  return owners
    .map((owner) => {
      const user = getUser(owner);
      const displayName = user?.full_name || user?.name || owner;
      return shouldHumanizeUserDisplay(displayName, owner)
        ? humanizeUserLabel(displayName || owner)
        : displayName;
    })
    .filter(Boolean)
    .join(", ");
}

export function renderOwnerCell({ item, getUser }) {
  return h(
    "span",
    { class: "kancom-owner-cell truncate flex-1" },
    formatAssignedOwners(item, getUser)
  );
}

export function renderDateTimeCell({ item }) {
  if (!item) return h("span", { class: "text-ink-gray-4" }, "-");

  const date = dayjs.tz(item);
  return h(
    "span",
    { class: "kancom-datetime-cell truncate flex-1", title: date.long() },
    date.short()
  );
}

function normalizeValue(value: unknown) {
  if (value && typeof value === "object" && "value" in value) {
    return value.value;
  }
  return value;
}

export function renderRequestCell({ row, item, userId }) {
  const seenBy = row._seen ? JSON.parse(row._seen) : [];
  const isSeen = seenBy.includes(normalizeValue(userId) || "");

  return h(
    "span",
    {
      class: ["kancom-request-cell truncate flex-1", !isSeen && "font-semibold"],
    },
    item
  );
}

export function renderStatusCell({ item, getStatus, isCustomerPortal }) {
  const status = getStatus(item);
  const label = isCustomerPortal
    ? status?.["label_customer"]
    : status?.["label_agent"];

  return h(
    "div",
    { class: "flex items-center space-x-2 justify-start w-full" },
    [
      h(IndicatorIcon, { class: status?.["parsed_color"] }),
      h("span", { class: "truncate flex-1" }, label),
    ]
  );
}

export function renderSlaCell({ item }) {
  if (!item) return h("span", { class: "text-ink-gray-4" }, "-");

  return h(Badge, {
    label: item,
    theme: slaStatusColorMap[item],
    variant: "outline",
  });
}

export function renderResponseByCell({ row, item }) {
  if (!row.first_responded_on && dayjs(item).isBefore(new Date())) {
    return h(Badge, { label: "Failed", theme: "red", variant: "outline" });
  }
  if (row.first_responded_on && dayjs(row.first_responded_on).isBefore(item)) {
    return h(Badge, { label: "Fulfilled", theme: "green", variant: "outline" });
  }
  if (dayjs(row.first_responded_on).isAfter(item)) {
    return h(Badge, { label: "Failed", theme: "red", variant: "outline" });
  }
  return h(Tooltip, { text: dayjs(item).long() }, () => dayjs.tz(item).fromNow());
}

export function renderResolutionByCell({ row, item, getStatus }) {
  const status = getStatus(row.status) || {};
  if (status.category === "Paused") {
    return h(Badge, { label: "Paused", theme: "blue", variant: "outline" });
  }
  if (row.resolution_date && dayjs(row.resolution_date).isBefore(item)) {
    return h(Badge, { label: "Fulfilled", theme: "green", variant: "outline" });
  }
  if (dayjs(row.resolution_date).isAfter(item)) {
    return h(Badge, { label: "Failed", theme: "red", variant: "outline" });
  }
  return h(Tooltip, { text: dayjs(item).long() }, () => dayjs.tz(item).fromNow());
}
