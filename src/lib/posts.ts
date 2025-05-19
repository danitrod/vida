import fs from "fs";
import path from "path";

const postsDirectory = path.join(process.cwd(), "src/content/posts");

export type PostMeta = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  notesDate?: string;
};

export async function getAllPosts(): Promise<PostMeta[]> {
  const filenames = fs.readdirSync(postsDirectory);

  const posts = await Promise.all(
    filenames.map(async (filename) => {
      const { metadata } = await import(`@/content/posts/${filename}`);

      return {
        slug: filename.replace(/\.mdx$/, ""),
        title: metadata.title,
        excerpt: metadata.excerpt,
        date: metadata.date,
        notesDate: metadata.notesDate,
      };
    })
  );

  // Sort by date descending
  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}
