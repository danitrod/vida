"use client";

import { createContext, useContext, useRef, useState } from "react";

// Photos in a post are hidden by default so the text can be read on its own.
// Readers opt in with the "mostrar fotos" switch next to the title
// (<PhotoSwitch />, placed by the page) or the "ver fotos" link at the bottom.
//
// - `shown`: photos currently visible.
// - `activated`: photos were shown at least once. Until then no <img> is
//   rendered, so nothing is downloaded. Afterwards images stay mounted while
//   hidden, so showing them again is instant.
//
// Outside a <PostPhotos> provider photos render normally (default value).

type PhotosState = {
  shown: boolean;
  activated: boolean;
  setVisible: (visible: boolean) => void;
};

const PhotosContext = createContext<PhotosState>({
  shown: true,
  activated: true,
  setVisible: () => {},
});

export const usePhotos = () => useContext(PhotosContext);

export default function PostPhotos({
  children,
}: {
  children: React.ReactNode;
}) {
  const [shown, setShown] = useState(false);
  const [activated, setActivated] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const setVisible = (visible: boolean) => {
    setShown(visible);
    if (visible) setActivated(true);
  };

  const goToPhotos = () => {
    setVisible(true);
    // Wait for the render that expands the photos, then scroll to the first
    // one in the text. Nothing above it changes size, so its position is
    // stable while the others expand.
    requestAnimationFrame(() => {
      const first = rootRef.current?.querySelector("[data-photo]");
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      first?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  };

  return (
    <PhotosContext value={{ shown, activated, setVisible }}>
      {/* .photo-controls only appear when the post contains a photo
          (CSS :has, see globals.css), so posts without photos are unchanged. */}
      <div ref={rootRef} className="post-photos">
        {children}

        <div className="photo-controls mt-8 justify-center">
          <button
            type="button"
            onClick={goToPhotos}
            className="text-sm underline hover:opacity-80"
          >
            ver fotos
          </button>
        </div>
      </div>
    </PhotosContext>
  );
}

// The show/hide switch. Must be inside <PostPhotos>; the page puts it in the
// title row.
export function PhotoSwitch() {
  const { shown, setVisible } = usePhotos();

  return (
    <div className="photo-controls shrink-0">
      <button
        type="button"
        role="switch"
        aria-checked={shown}
        onClick={() => setVisible(!shown)}
        className="inline-flex items-center gap-3 whitespace-nowrap text-sm"
      >
        <span
          aria-hidden="true"
          className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 motion-reduce:transition-none ${
            shown ? "bg-[var(--color-accent)]" : "bg-gray-300 dark:bg-gray-600"
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 motion-reduce:transition-none ${
              shown ? "translate-x-4" : ""
            }`}
          />
        </span>
        mostrar fotos
      </button>
    </div>
  );
}
