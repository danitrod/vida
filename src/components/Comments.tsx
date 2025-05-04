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
  }, [slug]);

  const handleDelete = async (id: string) => {
    fetch(`/api/comments/${id}`, { method: "DELETE" });
    const newComments = comments.filter((comment) => comment._id !== id);
    setComments(newComments);
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
              comment={comment}
              user={user}
              handleDelete={handleDelete}
            />
          ))}
        </ul>
      )}

      <NewCommentForm postSlug={slug} onCommentAdded={fetchComments} />
    </section>
  );
}
