"use client";

import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";
import NewCommentForm from "./forms/NewComment";
import CommentCard from "./CommentCard";
import { Comment } from "@/types/comment";

type CommentsProps = {
  slug: string;
};

export default function Comments({ slug }: CommentsProps) {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);

  const fetchComments = async () => {
    const res = await fetch(`/api/comments?slug=${slug}`);
    const data = await res.json();
    setComments(data.comments);
  };

  useEffect(() => {
    fetchComments();
  }, [slug, fetchComments]);

  const handleDelete = async (id: string) => {
    fetch(`/api/comments/${id}`, { method: "DELETE" });
    const newComments = comments.filter((comment) => comment._id !== id);
    setComments(newComments);
  };

  const handleEdit = async (id: string, newContent: string) => {
    try {
      fetch(`/api/comments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newContent }),
      });

      const updatedComments = comments.map((comment) =>
        comment._id === id ? { ...comment, content: newContent } : comment
      );
      setComments(updatedComments);
    } catch (err) {
      console.error("Erro ao editar comentário:", err);
    }
  };

  return (
    <section className="mt-16 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">comentários</h2>
      {comments.length === 0 ? (
        <p className="text-sm text-gray-500">nenhum comentário ainda.</p>
      ) : (
        <ul className="space-y-6">
          {comments.map((comment) => (
            <CommentCard
              key={comment._id}
              comment={comment}
              user={user}
              handleDelete={handleDelete}
              handleEdit={handleEdit}
            />
          ))}
        </ul>
      )}

      <NewCommentForm postSlug={slug} onCommentAdded={fetchComments} />
    </section>
  );
}
