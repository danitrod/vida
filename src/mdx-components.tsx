import type { MDXComponents } from "mdx/types";
import { FaExternalLinkAlt } from "react-icons/fa";
import Photo from "@/components/photos/Photo";
import ReaderDevice from "@/components/ReaderDevice";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ children, ...props }) => (
      <a
        {...props}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:opacity-80 whitespace-nowrap"
      >
        {children}
        <FaExternalLinkAlt className="inline-block -mt-1 ml-1" size={8} />
      </a>
    ),
    // Images are hidden until the reader turns on "Mostrar fotos".
    img: (props) => <Photo {...props} />,
    // <ReaderDevice /> in a post: the reader's kind of device.
    ReaderDevice,
    ...components,
  };
}
