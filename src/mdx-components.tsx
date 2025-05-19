import type { MDXComponents } from "mdx/types";
import { FaExternalLinkAlt } from "react-icons/fa";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ children, ...props }) => (
      <a
        {...props}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--color-orange)] underline hover:opacity-80 whitespace-nowrap"
      >
        {children}
        <FaExternalLinkAlt className="inline-block -mt-1 ml-1" size={8} />
      </a>
    ),
    ...components,
  };
}
