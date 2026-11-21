import { Metadata } from "next";
import { formatDate } from "@/lib/date";
import Comments from "@/components/Comments";
import Disclaimer from "@/components/Disclaimer";
import HeartButton from "@/components/HeartButton";
import { UserProvider } from "@/context/UserContext";
import mongo from "@/lib/mongodb";
import { validateAuth, validateAnonToken } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getAllPosts, loadPost } from "@/lib/posts";

// Only slugs from generateStaticParams are served; any other slug 404s.
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const post = await loadPost(params.slug);
  if (!post) notFound();
  const { metadata } = post;
  return {
    title: "vida | " + metadata.title,
    description: metadata.excerpt,
  };
}

export default async function PostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const post = await loadPost(params.slug);
  if (!post) notFound();
  const { default: Post, metadata } = post;

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
        {metadata.disclaimer && <Disclaimer text={metadata.disclaimer} />}
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
