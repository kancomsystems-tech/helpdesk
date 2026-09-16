import type { RouteRecordRaw } from "vue-router";

export interface HelpdeskModuleNavigationItem {
  label: string;
  icon: unknown;
  to: Record<string, unknown>;
  activeRoutes: readonly string[];
  capability?: string;
}

export interface HelpdeskFrontendExtension {
  id: string;
  productContextUrl?: string;
  routes?: RouteRecordRaw[];
  moduleNavigation?: HelpdeskModuleNavigationItem[];
}

const extensions = new Map<string, HelpdeskFrontendExtension>();

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
