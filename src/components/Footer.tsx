import { FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="mt-8 text-center">
      <hr className="my-4 border-gray-200" />
      <a
        href="https://www.instagram.com/danitrod"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 hover:underline"
      >
        <FaInstagram className="w-5 h-5" />
      </a>
    </footer>
  );
}
