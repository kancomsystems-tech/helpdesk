import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
const output = join(tmpdir(), `communication-channel-registry-${process.pid}.cjs`);

await build({
  entryPoints: ["src/extensions/registry.ts"],
  bundle: true,
  format: "cjs",
  platform: "node",
  outfile: output,
});

try {
  const registry = require(output);

  assert.equal(registry.getHelpdeskCommunicationChannel("Email").id, "email");
  assert.deepEqual(
    registry.getHelpdeskCommunicationReplyActions("Email").map((action) => action.id),
    ["reply", "reply-all", "forward"]
  );

  assert.equal(
    registry.registerHelpdeskCommunicationChannel({
      id: "custom-medium",
      label: "Custom Medium",
      replyActions: [{ id: "custom-reply", label: "Reply" }],
    }),
    true
  );
  assert.equal(
    registry.getHelpdeskCommunicationChannel("custom-medium").label,
    "Custom Medium"
  );
  assert.equal(
    registry.getHelpdeskCommunicationReplyActions("custom-medium")[0].id,
    "custom-reply"
  );
  assert.equal(
    registry.registerHelpdeskCommunicationChannel({
      id: "custom-medium",
      label: "Duplicate",
    }),
    false
  );

  assert.deepEqual(registry.getHelpdeskCommunicationChannel("unregistered"), {
    id: "unknown",
    label: "Unknown",
  });
  assert.deepEqual(registry.getHelpdeskCommunicationChannel(null), {
    id: "unknown",
    label: "Unknown",
  });

  const conversation = await readFile(
    "src/pages/ticket/TicketConversation.vue",
    "utf8"
  );
  const communication = await readFile(
    "src/pages/ticket/TicketCommunication.vue",
    "utf8"
  );
  const composer = await readFile(
    "src/components/CommunicationArea.vue",
    "utf8"
  );
  assert.match(conversation, /:medium="c\.communication_medium"/);
  assert.match(communication, /getHelpdeskCommunicationChannel/);
  assert.match(communication, /channel\.id !== 'email'/);
  assert.match(composer, /ReplyIcon/);
  assert.match(composer, /ReplyAllIcon/);
  assert.match(composer, /LucideForward/);
  assert.match(composer, /toggleEmailBox\(\)/);
} finally {
  await rm(output, { force: true });
}

console.log("Communication channel registry tests passed");