"use client";

import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

type Props = {
  initialCount: number;
  initiallyLiked?: boolean;
};

export default function HeartButton({
  initialCount,
  initiallyLiked = false,
}: Props) {
  const [liked, setLiked] = useState(initiallyLiked);
  const [likes, setLikes] = useState(initialCount);
  const [animate, setAnimate] = useState(false);

  const handleClick = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikes((prev) => prev + (newLiked ? 1 : -1));

    if (newLiked) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 300);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 transition ${
        animate ? "animate-beat" : ""
      }`}
      aria-label="Curtir"
    >
      {liked ? (
        <FaHeart className="w-5 h-5 text-[var(--color-accent)]" />
      ) : (
        <FaRegHeart className="w-5 h-5 text-gray-500" />
      )}
      <span className={`text-sm ${liked ? "text-red-500" : "text-gray-500"}`}>
        {likes}
      </span>
    </button>
  );
}
