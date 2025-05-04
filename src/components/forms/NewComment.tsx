"use client";

import { useState } from "react";
import { useUser } from "@/context/UserContext";

type Props = {
  postSlug: string;
  onCommentAdded?: () => void;
};

export default function NewCommentForm({ postSlug, onCommentAdded }: Props) {
  const { user } = useUser();
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  console.log("us", user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    setError("");

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: postSlug,
        content: text,
        authorName: user?.username || name,
      }),
    });

    setSubmitting(false);

    if (res.ok) {
      setText("");
      setName("");
      onCommentAdded?.();
    } else {
      const { message } = await res.json();
      setError(message || "Erro ao enviar comentário.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      {!user && (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome (opcional)"
          className="w-full border border-gray-300 px-3 py-2 rounded text-sm"
        />
      )}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escreva um comentário..."
        rows={4}
        className="w-full border border-gray-300 px-3 py-2 rounded text-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="btn disabled:opacity-50"
      >
        {submitting ? "Enviando..." : "Enviar comentário"}
      </button>
    </form>
  );
}
