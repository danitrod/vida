"use client";

import { useState } from "react";
import Modal from "./Modal";
import Link from "next/link";
import ThemeToggle, { Theme } from "./ThemeToggle";

type HeaderProps = {
  initialTheme?: Theme;
};

export default function Header({ initialTheme }: HeaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const closeModal = () => {
    setShowModal(false);
    setIsRegistering(false);
  };

  return (
    <header className="sticky top-0 z-40 flex bg-background justify-between mb-8 px-4 py-4 border-b border-[var(--color-soft)]">
      <Link href="/" className="font-bold">
        vida
      </Link>

      <div className="flex items-center gap-4">
        <ThemeToggle initialTheme={initialTheme} />
        <button
          onClick={() => setShowModal(true)}
          className="text-sm hover:underline"
        >
          login
        </button>
      </div>

      <Modal isOpen={showModal} onCloseAction={closeModal}>
        {isRegistering ? (
          <>
            <h2 className="text-xl font-bold mb-4">Criar conta</h2>
            <form className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full border border-gray-300 px-3 py-2 rounded text-sm"
              />
              <input
                type="password"
                placeholder="Senha"
                className="w-full border border-gray-300 px-3 py-2 rounded text-sm"
              />
              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded text-sm"
              >
                Registrar
              </button>
            </form>
            <p className="mt-8 text-sm text-center">
              <button
                onClick={() => setIsRegistering(false)}
                className="underline text-gray-700"
              >
                entrar
              </button>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">Entrar</h2>
            <form className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full border border-gray-300 px-3 py-2 rounded text-sm"
              />
              <input
                type="password"
                placeholder="Senha"
                className="w-full border border-gray-300 px-3 py-2 rounded text-sm"
              />
              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded text-sm"
              >
                entrar
              </button>
            </form>
            <p className="mt-8 text-sm text-center">
              <button
                onClick={() => setIsRegistering(true)}
                className="underline text-gray-700"
              >
                criar conta
              </button>
            </p>
          </>
        )}
      </Modal>
    </header>
  );
}
