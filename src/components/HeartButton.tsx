"use client";

import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

type Props = {
  initialCount: number;
  initiallyLoved: boolean;
  postSlug: string;
};

export default function HeartButton({
  initialCount,
  initiallyLoved,
  postSlug,
}: Props) {
  const [loved, setLoved] = useState(initiallyLoved);
  const [loves, setLoves] = useState(initialCount);
  const [animate, setAnimate] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleClick = async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    const optimisticLoved = !loved;
    setLoved(optimisticLoved);
    setLoves((prev) => prev + (optimisticLoved ? 1 : -1));
    if (optimisticLoved) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 300);
    }

    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post: postSlug }),
      });

      if (!res.ok) {
        setLoved(!optimisticLoved);
        setLoves((prev) => prev - (optimisticLoved ? 1 : -1));
      }
    } catch (err) {
      console.error("Erro ao amar:", err);
      setLoved(!optimisticLoved);
      setLoves((prev) => prev - (optimisticLoved ? 1 : -1));
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isSyncing}
      className={`flex items-center gap-1 transition ${
        animate ? "animate-beat" : ""
      }`}
      aria-label="Amar"
    >
      {loved ? (
        <FaHeart className="w-5 h-5 text-[var(--color-accent)]" />
      ) : (
        <FaRegHeart className="w-5 h-5 text-gray-500" />
      )}
      <span className={`text-sm ${loved ? "text-red-500" : "text-gray-500"}`}>
        {loves}
      </span>
    </button>
  );
}
