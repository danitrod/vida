import { formatDate } from "@/lib/date";
import { Comment } from "@/types/comment";
import { User } from "@/types/user";
import { useState } from "react";

type Props = {
  comment: Comment;
  user: User | null;
  handleDelete: (id: string) => void;
};

export default function CommentCard({ comment, user, handleDelete }: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  return (
    <li
      key={comment._id}
      className="border border-gray-200 p-4 rounded bg-white dark:bg-zinc-900"
    >
      <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
        {comment.content}
      </p>
      <div className="text-xs text-gray-500 mt-2 flex justify-between">
        <span>{comment.author || "anônimo"}</span>
        <span>{formatDate(comment.createdAt)}</span>
      </div>

      {user?.username === comment.author && (
        <div className="mt-2 flex gap-4 text-xs">
          {confirmingDelete ? (
            <span className="flex gap-2">
              <span className="">tem certeza?</span>
              <button
                onClick={() => handleDelete(comment._id)}
                className="text-red-500 hover:underline"
              >
                deletar
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="text-gray-500 hover:underline"
              >
                cancelar
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="text-red-500 hover:underline"
            >
              deletar
            </button>
          )}
        </div>
      )}
    </li>
  );
}
