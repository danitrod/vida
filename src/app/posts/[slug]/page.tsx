import fs from "fs";
import path from "path";
import { Metadata } from "next";
import { formatDate } from "@/lib/date";
import Comments from "@/components/Comments";
import HeartButton from "@/components/HeartButton";
import { UserProvider } from "@/context/UserContext";
import mongo from "@/lib/mongodb";
import { validateAuth, validateAnonToken } from "@/lib/auth";

const postsDir = path.join(process.cwd(), "src/content/posts");

export async function generateStaticParams() {
  const files = fs.readdirSync(postsDir);
  return files.map((filename) => ({
    slug: filename.replace(/\.mdx$/, ""),
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { metadata } = await import(`@/content/posts/${params.slug}.mdx`);
  return {
    title: "vida | " + metadata.title,
    description: metadata.excerpt,
  };
}

export default async function PostPage(props: {
  params: Promise<{ slug: string; date: string }>;
}) {
  const params = await props.params;
  const { default: Post, metadata } = await import(
    `@/content/posts/${params.slug}.mdx`
  );

  await mongo.connect();
  const db = mongo.db();

  const user = await validateAuth();
  let anonToken: string | null;
  if (!user) {
    anonToken = await validateAnonToken();
  }

  const reactions = await db
    .collection("reactions")
    .find({ post: params.slug, type: "love" })
    .toArray();

  const lovedByUser = reactions.some(
    (r) =>
      (r.user && r.user === user?.username) ||
      (r.anonToken && r.anonToken === anonToken)
  );

  const heartCount = reactions.length;

  return (
    <main className="min-h-screen px-4 py-8 sm:px-8 md:px-16 lg:px-32 bg-[var(--background)] text-[var(--foreground)]">
      <article className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-carrot)] mb-2">
          {metadata.title}
        </h1>
        <p className="text-sm text-[var(--color-sand)]">
          {formatDate(metadata.date)}
        </p>
        {metadata.notesDate && (
          <p className="text-xs text-[var(--color-sand)] opacity-70 italic">
            Com notas de {formatDate(metadata.notesDate)}
          </p>
        )}
        <div
          className="prose prose-lg dark:prose-invert prose-neutral mt-8"
          style={
            {
              "--tw-prose-body": "var(--foreground)",
              "--tw-prose-headings": "var(--color-carrot)",
              "--tw-prose-links": "var(--color-orange)",
              "--tw-prose-bold": "var(--color-orange)",
              "--tw-prose-quotes": "var(--color-sand)",
              "--tw-prose-quote-borders": "var(--color-sand)",
            } as React.CSSProperties
          }
        >
          <Post />
        </div>
        <div className="mt-4 flex justify-center">
          <UserProvider>
            <HeartButton
              initialCount={heartCount}
              initiallyLoved={lovedByUser}
              postSlug={params.slug}
            />
          </UserProvider>
        </div>

        <UserProvider>
          <Comments slug={params.slug} />
        </UserProvider>
      </article>
    </main>
  );
}
