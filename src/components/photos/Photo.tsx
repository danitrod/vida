"use client";

import { useState, type ComponentProps } from "react";
import { usePhotos } from "./PostPhotos";

// Renders a Markdown image (`![alt](src "caption")`) as a toggleable photo.
//
// Only <span>s are used because MDX places images inside <p>, where block
// elements like <figure> would be invalid HTML (and break hydration).
//
// Hidden state collapses to zero height (grid 0fr -> 1fr), so text-only
// reading has no gaps; the same transition smooths showing and hiding.
export default function Photo({ src, alt, title }: ComponentProps<"img">) {
  const { shown, activated } = usePhotos();
  const [loaded, setLoaded] = useState(false);

  return (
    <span
      data-photo
      aria-hidden={!shown}
      inert={!shown}
      className={`grid scroll-mt-24 transition-[grid-template-rows,opacity] duration-500 ease-out motion-reduce:transition-none ${
        shown ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <span className="min-h-0 overflow-hidden">
        {activated && typeof src === "string" && (
          <span className="block py-6">
            {/* Plain <img>: post photos have no known dimensions, which
                next/image requires; loading is gated by the toggle instead. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt ?? ""}
              loading="lazy"
              decoding="async"
              onLoad={() => setLoaded(true)}
              className={`m-0 h-auto w-full rounded transition-opacity duration-500 motion-reduce:transition-none ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
            />
            {title && (
              <span className="mt-2 block text-center text-sm italic opacity-70">
                {title}
              </span>
            )}
          </span>
        )}
      </span>
    </span>
  );
}
