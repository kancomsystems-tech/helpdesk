import type { RouteRecordRaw } from "vue-router";

export interface HelpdeskModuleNavigationItem {
  label: string;
  icon: unknown;
  to: Record<string, unknown>;
  activeRoutes: readonly string[];
  capability?: string;
  manager?: boolean;
  admin?: boolean;
}

export interface HelpdeskCommunicationReplyAction {
  id: string;
  label: string;
}

export interface HelpdeskCommunicationChannel {
  id: string;
  label: string;
  replyActions?: readonly HelpdeskCommunicationReplyAction[];
}

export interface HelpdeskFrontendExtension {
  id: string;
  productContextUrl?: string;
  routes?: RouteRecordRaw[];
  moduleNavigation?: HelpdeskModuleNavigationItem[];
}

const extensions = new Map<string, HelpdeskFrontendExtension>();
const communicationChannels = new Map<string, HelpdeskCommunicationChannel>();

const unknownCommunicationChannel: HelpdeskCommunicationChannel = {
  id: "unknown",
  label: "Unknown",
};

export const emailCommunicationChannel: HelpdeskCommunicationChannel = {
  id: "email",
  label: "Email",
  replyActions: [
    { id: "reply", label: "Reply" },
    { id: "reply-all", label: "Reply All" },
    { id: "forward", label: "Forward" },
  ],
};

communicationChannels.set(emailCommunicationChannel.id, emailCommunicationChannel);

export function registerHelpdeskCommunicationChannel(
  channel: HelpdeskCommunicationChannel
) {
  const id = channel.id.toLowerCase();
  if (!id || communicationChannels.has(id)) return false;
  communicationChannels.set(id, channel);
  return true;
}

export function getHelpdeskCommunicationChannel(
  medium?: string | null
): HelpdeskCommunicationChannel {
  if (!medium) return unknownCommunicationChannel;
  return communicationChannels.get(medium.toLowerCase()) || unknownCommunicationChannel;
}

export function getHelpdeskCommunicationReplyActions(
  medium?: string | null
): readonly HelpdeskCommunicationReplyAction[] {
  return getHelpdeskCommunicationChannel(medium).replyActions || [];
}

export function registerHelpdeskExtension(
  extension: HelpdeskFrontendExtension
) {
  if (!extension.id || extensions.has(extension.id)) return false;
  extensions.set(extension.id, extension);
  return true;
}

export function getHelpdeskExtensionRoutes(): RouteRecordRaw[] {
  return Array.from(extensions.values()).flatMap((item) => item.routes || []);
}

export function getHelpdeskModuleNavigation(): HelpdeskModuleNavigationItem[] {
  return Array.from(extensions.values()).flatMap(
    (item) => item.moduleNavigation || []
  );
}

export function getProductContextUrl(): string | null {
  return (
    Array.from(extensions.values()).find((item) => item.productContextUrl)
      ?.productContextUrl || null
  );
}

export function clearHelpdeskExtensionsForTest() {
  extensions.clear();
}
