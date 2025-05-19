import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { FormProps } from "./props";
import Spinner from "@/components/Spinner";

export function LoginForm({ onSwitch, onClose }: FormProps) {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { refreshUser } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!usernameOrEmail || !password) {
      setError("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: usernameOrEmail, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao fazer login.");
      }

      refreshUser();
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro desconhecido.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4">bem-vind@ de volta</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label htmlFor="usernameOrEmail" className="sr-only">
          usuário ou e-mail
        </label>
        <input
          id="usernameOrEmail"
          type="text"
          placeholder="Usuário ou e-mail"
          className="w-full border border-gray-300 px-3 py-2 rounded text-sm"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
        />
        <label htmlFor="password" className="sr-only">
          senha
        </label>
        <input
          id="password"
          type="password"
          placeholder="Senha"
          className="w-full border border-gray-300 px-3 py-2 rounded text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {loading ? (
          <Spinner className="mt-2" />
        ) : (
          <button type="submit" className="btn w-full">
            entrar
          </button>
        )}
      </form>
      <p className="mt-8 text-sm text-center">
        <button
          onClick={onSwitch}
          className="underline text-[var(--color-foreground)]"
        >
          crie sua conta
        </button>
      </p>
    </>
  );
}
