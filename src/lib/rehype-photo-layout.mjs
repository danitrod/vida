// Rehype plugin (registered in next.config.ts) for post photo layout.
//
// A `#direita` / `#esquerda` fragment floats a photo beside the text of its
// paragraph (see components/photos/Photo.tsx). When the paragraph holds only
// images, there is no text to wrap, so the fragment is removed and the photo
// is laid out like any other (centered). This runs at compile time because
// CSS can't tell whether a paragraph has text.
//
// Plain JavaScript with no dependencies: Turbopack loads MDX plugins by path.

const SIDE_FRAGMENT = /#(direita|esquerda)$/;

export default function rehypePhotoLayout() {
  return (tree) => visit(tree);
}

function visit(node) {
  if (node.type === "element" && node.tagName === "p" && onlyImages(node)) {
    for (const child of node.children) {
      if (child.type === "element" && typeof child.properties?.src === "string") {
        child.properties.src = child.properties.src.replace(SIDE_FRAGMENT, "");
      }
    }
  }
  for (const child of node.children ?? []) visit(child);
}

function onlyImages(paragraph) {
  return paragraph.children.every(
    (child) =>
      (child.type === "element" && child.tagName === "img") ||
      (child.type === "text" && !child.value.trim())
  );
}
