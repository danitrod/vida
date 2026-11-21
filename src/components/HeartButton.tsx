"use client";

import { useEffect, useRef, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useUser } from "@/context/UserContext";

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

  // The server-rendered state is for whoever loaded the page. When the user
  // logs in or out without a reload, fetch the state for the new identity.
  const { user, isLoading } = useUser();
  const username = user?.username ?? null;
  // Which identity the shown state belongs to (undefined: not known yet).
  const loadedFor = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (isLoading) return;
    // First resolution of the user matches the server render; skip it.
    if (loadedFor.current === undefined) {
      loadedFor.current = username;
      return;
    }
    if (loadedFor.current === username) return;
    loadedFor.current = username;

    let ignore = false;
    fetch(`/api/reactions?post=${encodeURIComponent(postSlug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((state) => {
        if (ignore) return;
        if (state) {
          setLoved(state.loved);
          setLoves(state.count);
        }
      })
      .catch((err) => console.error("Erro ao buscar reactions:", err));
    return () => {
      ignore = true;
    };
  }, [isLoading, username, postSlug]);

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
      <span className={`text-sm ${loved ? "text-[var(--color-accent)]" : "text-gray-500"}`}>
        {loves}
      </span>
    </button>
  );
}
