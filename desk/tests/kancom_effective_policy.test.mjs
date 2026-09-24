import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

const store = read("src/kancom/product/store.ts");
const routes = read("src/kancom/registerExtension.ts");
const router = read("src/router/index.ts");
const navigation = read("src/kancom/shell/navigation.ts");
const desktop = read("src/components/layouts/Sidebar.vue");
const mobile = read("src/components/layouts/MobileSidebar.vue");
const tickets = read("src/pages/ticket/Tickets.vue");
const operations = read("src/kancom/operations/data/dashboardLayout.ts");

assert.match(store, /effective_persona/);
assert.match(store, /effective_permissions/);
assert.match(store, /function hasEffectivePermission/);
assert.match(routes, /effectivePermission: "view_analytics"/);
assert.match(routes, /effectivePermission: "view_reports"/);
assert.match(routes, /effectivePermission: "view_workforce"/);
assert.match(routes, /effectivePermission: "view_quality"/);
assert.match(router, /to\.meta\.effectivePermission/);
assert.match(router, /hasEffectivePermission\(to\.meta\.effectivePermission\)/);
assert.match(navigation, /hasEffectivePermission\(item\.effectivePermission\)/);
assert.match(desktop, /productContextStore\.hasEffectivePermission/);
assert.match(mobile, /productContextStore\.hasEffectivePermission/);
assert.match(tickets, /hasEffectivePermission\("bulk_assign"\)/);
assert.match(tickets, /hasEffectivePermission\("view_control"\)/);
assert.match(
  tickets,
  /hasEffectivePermission\([\s\S]*"manage_public_views"[\s\S]*\)/
);
assert.match(
  operations,
  /id: "unassigned",[\s\S]*allowedPersonas: managementPersonas/
);

console.log("Kancom effective operating policy frontend tests passed");
