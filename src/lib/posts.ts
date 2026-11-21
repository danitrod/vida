import fs from "fs";
import path from "path";
import type { ComponentType } from "react";

// Published posts live in src/content/posts. Drafts live in the git-ignored
// src/content/drafts and are only ever read under `next dev`.
//
// Every reference to the drafts folder sits inside a literal
// `process.env.NODE_ENV === "development"` check. Next inlines NODE_ENV at
// build time, so production builds compile these branches to `if (false)`
// and strip them: no draft code, path or file reaches the production bundle,
// whatever the runtime environment says.

export type PostMeta = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  notesDate?: string;
  disclaimer?: string;
};

type PostModule = {
  default: ComponentType;
  metadata: Omit<PostMeta, "slug">;
};

const listSlugs = (dir: string): string[] =>
  fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((filename) => filename.endsWith(".mdx"))
        .map((filename) => filename.replace(/\.mdx$/, ""))
    : [];

export function getPostSlugs(): string[] {
  const slugs = listSlugs(path.join(process.cwd(), "src/content/posts"));
  if (process.env.NODE_ENV === "development") {
    slugs.push(...listSlugs(path.join(process.cwd(), "src/content/drafts")));
  }
  return [...new Set(slugs)];
}

export async function loadPost(slug: string): Promise<PostModule | null> {
  if (!/^[\w-]+$/.test(slug)) return null;

  const post: PostModule | null = await import(
    `@/content/posts/${slug}.mdx`
  ).catch(() => null);
  if (post) return post;

  if (process.env.NODE_ENV === "development") {
    return await import(`@/content/drafts/${slug}.mdx`).catch(() => null);
  }

  return null;
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const posts = await Promise.all(
    getPostSlugs().map(async (slug): Promise<PostMeta | null> => {
      const post = await loadPost(slug);
      if (!post) return null;
      const { metadata } = post;
      return {
        slug,
        title: metadata.title,
        excerpt: metadata.excerpt,
        date: metadata.date,
        notesDate: metadata.notesDate,
      };
    })
  );

  return posts
    .filter((post): post is PostMeta => post !== null)
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}
