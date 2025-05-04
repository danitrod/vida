import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { FormProps } from "./props";
import { validateUsername } from "@/lib/validation";

export const Settings = ({ onClose }: FormProps) => {
  const { refreshUser, user } = useUser();
  const [username, setUsername] = useState(user?.username || "");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateUsername(username);
    if (error) {
      setMessage(error);
      return;
    }

    setMessage("");

    if (username === user?.username) {
      return;
    }

    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Nome de usuário atualizado com sucesso.");
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
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded text-sm"
          />
        </div>

        {message && <p className="text-sm text-gray-600">{message}</p>}

        <button type="submit" className="btn w-full">
          alterar nome de usuário
        </button>
      </form>

      <button
        className="btn bg-red-100 text-red-600 hover:bg-red-200"
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
