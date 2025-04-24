import Link from "next/link";
import { Metadata } from "next";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "vida — por danitrod",
  description:
    "Reflexões pessoais, experimentos de estilo de vida e pensamentos de baixa tecnologia.",
};

const samplePosts = [
  {
    title: "Café da manhã sem pressa",
    slug: "cafe-da-manha-sem-pressa",
    excerpt: "Como desacelerar sua manhã pode transformar o resto do seu dia.",
  },
  {
    title: "Desplugando no fim de semana",
    slug: "desplugando-no-fim-de-semana",
    excerpt:
      "Experimentos com finais de semana sem tela e como isso mudou minha relação com o tempo.",
  },
  {
    title: "O poder de uma caminhada solitária",
    slug: "caminhada-solitaria",
    excerpt: "Reflexões sobre silêncio, observação e presença.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-16 sm:px-8 md:px-16 lg:px-32">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[var(--color-carrot)]">
            vida
          </h1>
          <ThemeToggle />
        </div>

        <p className="text-lg sm:text-xl mb-8">
          Um blog pessoal sobre estilo de vida, simplicidade e as pequenas
          alegrias do cotidiano. Curado por{" "}
          <span className="font-semibold text-[var(--color-orange)]">
            danitrod
          </span>
          .
        </p>

        <Link
          href="/posts"
          className="inline-block bg-[var(--color-orange)] text-white px-6 py-3 rounded-full shadow hover:bg-[var(--color-carrot)] transition mb-12"
        >
          Ler posts
        </Link>

        <section>
          <h2 className="text-2xl font-bold text-[var(--color-carrot)] mb-6">
            Últimos posts
          </h2>
          <ul className="space-y-6">
            {samplePosts.map((post) => (
              <li
                key={post.slug}
                className="border-l-4 border-[var(--color-orange)] pl-4"
              >
                <Link
                  href={`/posts/${post.slug}`}
                  className="text-xl font-semibold hover:text-[var(--color-carrot)]"
                >
                  {post.title}
                </Link>
                <p className="text-[var(--color-sand)] text-sm mt-1">
                  {post.excerpt}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-16 border-t pt-8 text-sm text-[var(--color-sand)]">
          <p>
            Hospedado em{" "}
            <a
              href="https://vida.danitrod.dev"
              className="underline hover:text-[var(--color-orange)]"
            >
              Vercel
            </a>
          </p>
          <p>
            Feito com <span className="text-red-400">♥</span> e Next.js.
          </p>
        </div>
      </div>
    </main>
  );
}
