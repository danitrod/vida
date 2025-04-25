import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "vida — por danitrod",
  description:
    "Reflexões pessoais, experimentos de estilo de vida e pensamentos de baixa tecnologia.",
};

const samplePosts = [
  {
    title: "Estamos vivendo uma revolução",
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
    <main className="px-4 py-16 sm:px-8 md:px-16 lg:px-32 ">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">
          vida <span className="text-2xl font-light">by danitrod</span>
        </h1>
        <p className="text-lg mb-12">
          Pensamentos e histórias tirados de um bloco de notas.
        </p>

        <ul className="space-y-8">
          {samplePosts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/posts/${post.slug}`}
                className="text-xl font-medium underline underline-offset-4"
              >
                {post.title}
              </Link>
              <p className="text-sm text-gray-600 mt-1">{post.excerpt}</p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
