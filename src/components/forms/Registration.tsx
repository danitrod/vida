import { useState } from "react";
import { FormProps } from "./props";
import { validateRegistration } from "@/lib/validation";
import { useUser } from "@/context/UserContext";
import Spinner from "@/components/Spinner";

export const RegistrationForm = ({ onSwitch, onClose }: FormProps) => {
  const { refreshUser } = useUser();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [subscribeToPosts, setSubscribeToPosts] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const err = validateRegistration({
      username,
      email,
      password,
      confirmPassword,
    });
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, subscribeToPosts }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao registrar.");
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
      <h2 className="text-xl font-bold mb-4">crie sua conta</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label htmlFor="username" className="text-sm">
          como gostaria de ser chamado/a?
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nome de usuário"
          className="w-full border border-gray-300 px-3 py-2 rounded text-sm"
        />
        <label htmlFor="email" className="text-sm">
          seu e-mail
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border border-gray-300 px-3 py-2 rounded text-sm"
        />
        <label htmlFor="password" className="text-sm">
          sua senha
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          className="w-full border border-gray-300 px-3 py-2 rounded text-sm"
        />
        <label htmlFor="confirmPassword" className="text-sm">
          confirme sua senha
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirme sua senha..."
          className="w-full border border-gray-300 px-3 py-2 rounded text-sm"
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={subscribeToPosts}
            onChange={(e) => setSubscribeToPosts(e.target.checked)}
            className="w-4 h-4"
          />
          me avise por email quando houver novos posts
        </label>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {loading ? (
          <Spinner className="mt-2" />
        ) : (
          <button type="submit" className="btn w-full mt-4">
            registrar
          </button>
        )}
      </form>

      <p className="mt-8 text-sm text-center">
        <button
          onClick={onSwitch}
          className="underline text-[var(--color-foreground)"
        >
          já tem conta?
        </button>
      </p>
    </>
  );
};
