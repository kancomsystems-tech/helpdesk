import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const navigation = await readFile("src/kancom/shell/navigation.ts", "utf8");
const labels = await readFile("src/kancom/shell/labels.ts", "utf8");
const desktop = await readFile("src/components/layouts/Sidebar.vue", "utf8");
const mobile = await readFile(
  "src/components/layouts/MobileSidebar.vue",
  "utf8"
);
const commandBar = await readFile(
  "src/kancom/operations/components/OperationsCommandBar.vue",
  "utf8"
);

for (const source of [navigation, desktop, mobile, commandBar]) {
  assert.doesNotMatch(source, /Help \/ Docs/);
  assert.doesNotMatch(source, /kancomSecondaryNavigation\.docs/);
  assert.doesNotMatch(source, /https:\/\/docs\.frappe\.io\/helpdesk/);
}

assert.doesNotMatch(
  desktop,
  /travelos-sidebar-footer[\s\S]*?:label="__\('Help'\)"/
);
assert.doesNotMatch(mobile, /:label="'Help'"/);

assert.match(labels, /Playbook \/ Knowledge Base/);
assert.match(labels, /Travellers \/ Contacts/);
assert.match(navigation, /knowledgeBase: kancomShellLabels\.knowledgeBase/);
assert.match(navigation, /contacts: kancomShellLabels\.contacts/);
assert.match(navigation, /label: "Log out"/);
assert.match(desktop, /kancomAdminSetupNavigation\.group/);
assert.match(mobile, /kancomAdminSetupNavigation\.group/);
assert.match(commandBar, /label: "Profile"/);
assert.match(commandBar, /kancomSecondaryNavigation\.logout/);
assert.match(desktop, /isExpanded \? __\('Collapse'\) : __\('Expand'\)/);

for (const source of [desktop, mobile]) {
  assert.match(source, /kancomSecondaryNavigation\.knowledgeBase/);
  assert.match(source, /kancomSecondaryNavigation\.contacts/);
  assert.match(source, /kancomSecondaryNavigation\.logout/);
  assert.match(source, /visibleSetupTabs\.value\.length/);
}

console.log("Kancom documentation navigation removal tests passed");
