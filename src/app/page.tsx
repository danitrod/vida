import Link from "next/link";
import { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "vida — por danitrod",
  description:
    "Reflexões pessoais, experimentos de estilo de vida e pensamentos de baixa tecnologia.",
};

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <main className="px-4 py-8 sm:px-8 md:px-16 lg:px-32 ">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">
          vida <span className="text-2xl font-light">by danitrod</span>
        </h1>
        <p className="text-lg mb-12">
          Pensamentos e histórias tirados de um bloco de notas.
        </p>

        <ul className="space-y-8">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/posts/${post.slug}`}
                className="text-xl font-medium underline underline-offset-4"
              >
                {post.title}
              </Link>
              <p className="text-sm mt-1">{post.excerpt}</p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
