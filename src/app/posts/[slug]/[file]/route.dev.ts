import { readFile } from "fs/promises";
import path from "path";

// DEV ONLY (the .dev.ts extension is only routed under `next dev`, see
// next.config.ts). Serves photos of draft posts from the git-ignored
// src/content/drafts/<slug>/ folder at the same URL they will have once
// published (/posts/<slug>/<file>, from public/posts/<slug>/), so the post's
// Markdown doesn't change when it's published.
//
// Published photos in public/ are served by Next before this route runs.

const draftsDirectory = path.join(process.cwd(), "src/content/drafts");

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

const notFound = () => new Response("Not found", { status: 404 });

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; file: string }> }
) {
  if (process.env.NODE_ENV !== "development") return notFound();

  const { slug, file } = await params;
  // Plain names only: no path separators, no "..", no hidden files.
  if (!/^[\w-]+$/.test(slug) || !/^[\w-][\w.-]*$/.test(file)) {
    return notFound();
  }

  const contentType = CONTENT_TYPES[path.extname(file).toLowerCase()];
  if (!contentType) return notFound();

  try {
    const data = await readFile(path.join(draftsDirectory, slug, file));
    return new Response(data, {
      headers: { "Content-Type": contentType, "Cache-Control": "no-store" },
    });
  } catch {
    return notFound();
  }
}
