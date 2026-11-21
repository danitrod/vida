import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { FormProps } from "./props";
import { validateUsername } from "@/lib/validation";
import Spinner from "../Spinner";
import { FiEdit2 } from "react-icons/fi";

export const Settings = ({ onClose }: FormProps) => {
  const { refreshUser, user } = useUser();
  const [username, setUsername] = useState(user?.username || "");
  const [subscribe, setSubscribe] = useState(false);
  const [loading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  // When the user changes (e.g. after saving or logging out), sync the
  // username and show the spinner while the full profile reloads. Adjusting
  // state during render avoids an extra effect-driven render.
  const [prevUser, setPrevUser] = useState(user);
  if (user !== prevUser) {
    setPrevUser(user);
    if (user?.username) setUsername(user.username);
    setIsLoading(true);
  }

  useEffect(() => {
    let ignore = false;
    fetch("/api/me/full")
      .then(async (res) => {
        const data = await res.json();
        if (!ignore && res.ok && data.user?.subscribeToPosts !== undefined) {
          setSubscribe(data.user.subscribeToPosts);
        }
      })
      .catch((err) => console.error("Erro ao buscar dados completos:", err))
      .finally(() => {
        if (ignore) return;
        setIsLoading(false);
        setIsEditingUsername(false);
      });
    return () => {
      ignore = true;
    };
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateUsername(username);
    if (error) {
      setMessage(error);
      return;
    }

    setMessage("");

    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, subscribeToPosts: subscribe }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Informações atualizadas com sucesso.");
      refreshUser();
    } else {
      setMessage(data.message || "Erro ao atualizar informações.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">configurações</h2>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">nome de usuário</label>
          {isEditingUsername ? (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded text-sm"
            />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm">{username}</span>
              <button
                type="button"
                onClick={() => setIsEditingUsername(true)}
                className="text-gray-500 hover:text-gray-800"
                title="Editar nome de usuário"
              >
                <FiEdit2 size={14} />
              </button>
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm">
          {loading ? (
            <Spinner />
          ) : (
            <input
              type="checkbox"
              checked={subscribe}
              onChange={(e) => setSubscribe(e.target.checked)}
              className="w-4 h-4"
            />
          )}
          receber emails sobre novos posts
        </label>

        {message && <p className="text-sm text-gray-400">{message}</p>}

        <button type="submit" className="btn w-full">
          salvar alterações
        </button>
      </form>

      <button
        className="btn-danger ml-auto px-4 text-xs"
        onClick={async () => {
          await fetch("/api/logout", { method: "POST" });
          refreshUser();
          onClose();
        }}
      >
        logout
      </button>
    </div>
  );
};
