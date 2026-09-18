export const EMAIL_QUOTE_BOUNDARY_CLASS = "email-quote-boundary";

type EditorNode = {
  type?: { name?: string };
  attrs?: { class?: string | null };
};

type EditorLike = {
  state: {
    doc: {
      descendants: (
        callback: (node: EditorNode, position: number) => boolean | void
      ) => void;
    };
    selection?: { from: number; to: number };
  };
  chain: () => {
    focus: () => any;
    insertContent: (content: string) => any;
    insertContentAt: (position: number, content: string) => any;
    run: () => boolean;
  };
};

export function findEmailQuoteBoundary(editor: EditorLike) {
  let boundary: number | null = null;
  editor.state.doc.descendants((node, position) => {
    const classes = (node.attrs?.class || "").split(/\s+/);
    if (
      node.type?.name === "paragraph" &&
      classes.includes(EMAIL_QUOTE_BOUNDARY_CLASS)
    ) {
      boundary = position;
      return false;
    }
    return boundary === null;
  });
  return boundary;
}

export function insertSavedReply(editor: EditorLike, content: string) {
  const boundary = findEmailQuoteBoundary(editor);
  const selection = editor.state.selection;
  const cursorIsInNewResponse =
    selection &&
    (boundary === null ||
      (selection.from < boundary && selection.to <= boundary));
  const chain = editor.chain().focus();

  if (cursorIsInNewResponse) {
    return chain.insertContent(content).run();
  }
  if (boundary !== null) {
    return chain.insertContentAt(boundary, content).run();
  }
  return chain.insertContent(content).run();
}
