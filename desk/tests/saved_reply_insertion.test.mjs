import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
const output = join(tmpdir(), `saved-reply-insertion-${process.pid}.cjs`);

await build({
  entryPoints: ["src/kancom/email/savedReplyInsertion.ts"],
  bundle: true,
  format: "cjs",
  platform: "node",
  outfile: output,
});

function makeEditor({ boundary = 10, selection = { from: 1, to: 1 } } = {}) {
  const calls = [];
  const chain = {
    focus: () => chain,
    insertContent: (content) => {
      calls.push(["cursor", content]);
      return chain;
    },
    insertContentAt: (position, content) => {
      calls.push(["boundary", position, content]);
      return chain;
    },
    run: () => true,
  };
  return {
    calls,
    state: {
      selection,
      doc: {
        descendants(callback) {
          callback(
            {
              type: { name: "paragraph" },
              attrs: {
                class: boundary === null ? null : "email-quote-boundary",
              },
            },
            boundary ?? 0
          );
        },
      },
    },
    chain: () => chain,
  };
}

try {
  const { findEmailQuoteBoundary, insertSavedReply } = require(output);

  const emptyReply = makeEditor();
  insertSavedReply(emptyReply, "<p>Saved reply</p>");
  assert.deepEqual(emptyReply.calls, [["cursor", "<p>Saved reply</p>"]]);

  const typedReply = makeEditor({ selection: { from: 5, to: 5 } });
  insertSavedReply(typedReply, "<strong>Second response</strong>");
  assert.deepEqual(typedReply.calls, [
    ["cursor", "<strong>Second response</strong>"],
  ]);

  const sequentialReplies = makeEditor({ selection: { from: 5, to: 5 } });
  insertSavedReply(sequentialReplies, "<p>First</p>");
  insertSavedReply(sequentialReplies, "<p>Second</p>");
  assert.deepEqual(sequentialReplies.calls, [
    ["cursor", "<p>First</p>"],
    ["cursor", "<p>Second</p>"],
  ]);

  const unsafeQuoteCursor = makeEditor({ selection: { from: 14, to: 14 } });
  insertSavedReply(unsafeQuoteCursor, "<p>Before quote</p>");
  assert.deepEqual(unsafeQuoteCursor.calls, [
    ["boundary", 10, "<p>Before quote</p>"],
  ]);

  const selectedAcrossQuote = makeEditor({ selection: { from: 5, to: 14 } });
  insertSavedReply(selectedAcrossQuote, "<p>Safe fallback</p>");
  assert.deepEqual(selectedAcrossQuote.calls, [
    ["boundary", 10, "<p>Safe fallback</p>"],
  ]);

  const newTicket = makeEditor({ boundary: null });
  insertSavedReply(newTicket, "<p>No quote</p>");
  assert.deepEqual(newTicket.calls, [["cursor", "<p>No quote</p>"]]);

  assert.equal(findEmailQuoteBoundary(makeEditor()), 10);
  assert.equal(findEmailQuoteBoundary(makeEditor({ boundary: null })), null);

  const editorSource = await readFile("src/components/EmailEditor.vue", "utf8");
  const emailAreaSource = await readFile(
    "src/components/EmailArea.vue",
    "utf8"
  );
  assert.match(editorSource, /EMAIL_QUOTE_BOUNDARY_CLASS/);
  assert.match(editorSource, /insertSavedReply\(editor, template\)/);
  assert.doesNotMatch(editorSource, /newEmail\.value \+ "\n" \+ template/);
  assert.match(emailAreaSource, /const reply = \(\) =>/);
  assert.match(emailAreaSource, /const replyAll = \(\) =>/);
  assert.match(emailAreaSource, /const forward = \(\) =>/);
  assert.match(emailAreaSource, /__FORWARD_EMPTY_TO__/);
} finally {
  await rm(output, { force: true });
}

console.log("Saved Reply insertion tests passed");
