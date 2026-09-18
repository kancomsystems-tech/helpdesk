import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
const output = join(
  tmpdir(),
  `kancom-product-administration-${process.pid}.cjs`
);

await build({
  entryPoints: ["src/kancom/product/productAdministration.ts"],
  bundle: true,
  format: "cjs",
  platform: "node",
  outfile: output,
});

try {
  const { getKancomSetupTabs } = require(output);
  assert.deepEqual(getKancomSetupTabs("agent", true, false), [
    "Profile",
    "Saved Replies",
  ]);
  assert.deepEqual(getKancomSetupTabs("team_leader", true, false), [
    "Profile",
    "Setup Summary",
    "Team Members",
    "Saved Replies",
  ]);
  assert.deepEqual(getKancomSetupTabs("operations_head", false, false), [
    "Profile",
    "Setup Summary",
    "Team Members",
    "Saved Replies",
  ]);
  assert.deepEqual(getKancomSetupTabs("operations_head", true, false), [
    "Profile",
    "Setup Summary",
    "Team Members",
    "Saved Replies",
    "Agents",
    "Teams",
  ]);
  const administrator = getKancomSetupTabs("administrator", true, true);
  for (const label of [
    "Invite Agents",
    "SLA Policies",
    "Business Holidays",
    "Assignment Rules",
    "Email Accounts",
    "Email Notifications",
    "General",
    "Field Dependencies",
    "Telephony",
  ]) {
    assert.ok(administrator.includes(label), label);
  }
  assert.deepEqual(getKancomSetupTabs("agent", true, true), administrator);

  const settings = await readFile(
    "src/components/Settings/settingsModal.ts",
    "utf8"
  );
  assert.match(settings, /authoritative_persona/);
  assert.match(settings, /is_platform_administrator/);
  assert.doesNotMatch(settings, /auth\.isManager/);
  const modal = await readFile(
    "src/components/Settings/SettingsModal.vue",
    "utf8"
  );
  assert.match(modal, /Product Administration/);
  for (const group of [
    "My Settings",
    "People & Teams",
    "Operations Configuration",
    "System",
    "Technical Administration",
  ]) {
    assert.match(settings, new RegExp(group.replace("&", "&")));
  }

  const userMenu = await readFile("src/components/UserMenu.vue", "utf8");
  assert.match(userMenu, /platformLabel/);
  assert.match(userMenu, /v-if="platformLabel"/);
  const desktop = await readFile("src/components/layouts/Sidebar.vue", "utf8");
  const mobile = await readFile(
    "src/components/layouts/MobileSidebar.vue",
    "utf8"
  );
  for (const source of [desktop, mobile]) {
    assert.match(source, /platform-label="travelosPlatformAuthorityLabel"/);
    assert.match(source, /authStore\.isAdmin \? "System Admin" : ""/);
    assert.match(source, /authoritative_persona/);
  }
} finally {
  await rm(output, { force: true });
}

console.log("Kancom Product Administration access tests passed");
