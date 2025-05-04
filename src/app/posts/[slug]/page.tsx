import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Metadata } from "next";
import { formatDate } from "@/lib/date";
import ReactMarkdown from "react-markdown";
import { FaExternalLinkAlt } from "react-icons/fa";
import Comments from "@/components/Comments";
import HeartButton from "@/components/HeartButton";
import { UserProvider } from "@/context/UserContext";
import mongo from "@/lib/mongodb";
import { validateAuth, validateAnonToken } from "@/lib/auth";

const postsDir = path.join(process.cwd(), "src/content/posts");

export async function generateStaticParams() {
  const files = fs.readdirSync(postsDir);
  return files.map((filename) => ({
    slug: filename.replace(/\.md$/, ""),
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const filePath = path.join(postsDir, `${params.slug}.md`);
  const fileContent = fs.readFileSync(filePath, "utf8");
  const { data } = matter(fileContent);
  return {
    title: "vida | " + data.title,
    description: data.excerpt,
  };
}

export default async function PostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const filePath = path.join(postsDir, `${params.slug}.md`);
  const fileContent = fs.readFileSync(filePath, "utf8");

  const { data, content } = matter(fileContent);

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
          {data.title}
        </h1>
        <p className="text-sm text-[var(--color-sand)] mb-8">
          {formatDate(data.date)}
        </p>
        <div
          className="prose prose-lg dark:prose-invert prose-neutral"
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
          <ReactMarkdown
            components={{
              a: ({ children, ...props }) => (
                <a
                  {...props}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-orange)] underline hover:opacity-80 whitespace-nowrap"
                >
                  {children}
                  <FaExternalLinkAlt
                    className="inline-block -mt-1 ml-1"
                    size={8}
                  />
                </a>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
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
