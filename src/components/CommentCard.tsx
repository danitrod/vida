import { formatDate } from "@/lib/date";
import { Comment } from "@/types/comment";
import { User } from "@/types/user";
import { useEffect, useState } from "react";
import { FiTrash2, FiEdit } from "react-icons/fi";
import Cookies from "js-cookie";
import { anonCookie } from "@/lib/cookies";

type Props = {
  comment: Comment;
  user: User | null;
  handleDelete: (id: string) => void;
  handleEdit: (id: string, newContent: string) => void;
};

export default function CommentCard({
  comment,
  user,
  handleDelete,
  handleEdit,
}: Props) {
  const [anonToken, setAnonToken] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  useEffect(() => {
    const token = Cookies.get(anonCookie);
    if (!token) return;

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      if (decoded?.uid) setAnonToken(decoded.uid);
    } catch (err) {
      console.error("Invalid anon token", err);
    }
  }, []);

  const isOwner =
    user?.username === comment.author || comment.anonToken === anonToken;

  return (
    <li
      key={comment._id}
      className="border border-gray-200 p-4 rounded bg-white dark:bg-zinc-900"
    >
      {editing ? (
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-700 dark:bg-zinc-800 dark:text-white px-3 py-2 rounded text-sm"
        />
      ) : (
        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
          {comment.content}
        </p>
      )}

      <div className="text-xs text-gray-500 mt-2 flex justify-between">
        <span>{comment.author || "anônimo"}</span>
        <span>{formatDate(comment.createdAt)}</span>
      </div>

      {isOwner && (
        <div className="mt-2 flex gap-2 text-xs justify-end">
          {editing ? (
            <>
              <button
                onClick={() => {
                  handleEdit(comment._id, editContent);
                  setEditing(false);
                }}
                className="text-green-600 hover:underline"
              >
                salvar
              </button>
              <button
                onClick={() => {
                  setEditContent(comment.content);
                  setEditing(false);
                }}
                className="text-gray-500 hover:underline"
              >
                cancelar
              </button>
            </>
          ) : confirmingDelete ? (
            <>
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
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="text-gray-500 hover:underline"
              >
                <FiEdit />
              </button>
              <button
                onClick={() => setConfirmingDelete(true)}
                className="text-red-400 hover:underline dark:text-red-900"
              >
                <FiTrash2 />
              </button>
            </>
          )}
        </div>
      )}
    </li>
  );
}
