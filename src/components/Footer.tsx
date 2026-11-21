import Link from "next/link";
import { FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="my-4 lg:my-8 text-center">
      <hr className="my-4 border-[var(--color-light)]" />
      <a
        href="https://www.instagram.com/danitrod"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 hover:underline"
      >
        <FaInstagram className="w-5 h-5 text-foreground" />
      </a>
      <Link
        href="/privacidade"
        className="mt-2 block text-xs opacity-50 hover:opacity-80"
      >
        privacidade
      </Link>
    </footer>
  );
}
