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
//
// Layout (see "Post photos" in globals.css): a lone photo is capped in height
// and centered, so vertical photos don't fill more than the screen. Photos
// on the same Markdown line form a row on wider screens, each growing in
// proportion to its aspect ratio so all end up the same height, uncropped.
// The ratio is read from the image once loaded; until then it's 1.
//
// A `#direita` / `#esquerda` fragment on the URL floats the photo to that
// side of the paragraph it starts, with the text wrapping around it (wider
// screens only). The fragment is stripped from the URL.
export default function Photo({ src, alt, title }: ComponentProps<"img">) {
  const { shown, activated } = usePhotos();
  const [aspect, setAspect] = useState<number | null>(null);

  const [url, fragment] = typeof src === "string" ? src.split("#", 2) : [];
  const side =
    fragment === "direita" ? "right" : fragment === "esquerda" ? "left" : undefined;

  return (
    <span
      data-photo
      data-side={side}
      aria-hidden={!shown}
      inert={!shown}
      style={{ "--photo-aspect": aspect ?? 1 } as React.CSSProperties}
      className={`grid scroll-mt-24 transition-[grid-template-rows,opacity] duration-500 ease-out motion-reduce:transition-none ${
        shown ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <span className="min-h-0 overflow-hidden">
        {activated && url && (
          <span className={`block py-6 ${side ? "sm:pt-1.5 sm:pb-4" : ""}`}>
            {/* Plain <img>: post photos have no known dimensions, which
                next/image requires; loading is gated by the toggle instead. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={alt ?? ""}
              loading="lazy"
              decoding="async"
              onLoad={(e) => {
                const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
                setAspect(w && h ? w / h : 1);
              }}
              className={`mx-auto my-0 block h-auto max-h-[80vh] w-auto max-w-full rounded transition-opacity duration-500 motion-reduce:transition-none ${
                aspect ? "opacity-100" : "opacity-0"
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
