"use client";

import { useState } from "react";
import Modal from "./Modal";
import Link from "next/link";
import ThemeToggle, { Theme } from "./ThemeToggle";
import { RegistrationForm } from "./forms/Registration";
import { LoginForm } from "./forms/Login";
import { useUser } from "@/context/UserContext";
import Spinner from "./Spinner";
import { Settings } from "./forms/Settings";

type HeaderProps = {
  initialTheme?: Theme;
};

export default function Header({ initialTheme }: HeaderProps) {
  const { user, isLoading } = useUser();
  const [modalContent, setModalContent] = useState<string | null>(null);

  const closeModal = () => {
    setModalContent(null);
  };

  let modal;
  switch (modalContent) {
    case "login":
      modal = (
        <Modal onCloseAction={closeModal} className="bg-background">
          <LoginForm
            onSwitch={() => setModalContent("register")}
            onClose={closeModal}
          />
        </Modal>
      );
      break;
    case "register":
      modal = (
        <Modal onCloseAction={closeModal} className="bg-background">
          <RegistrationForm
            onSwitch={() => setModalContent("login")}
            onClose={closeModal}
          />
        </Modal>
      );
      break;
    case "settings":
      modal = (
        <Modal onCloseAction={closeModal} className="bg-background">
          <Settings onClose={closeModal} />
        </Modal>
      );
      break;
    default:
      modal = null;
  }

  return (
    <header className="sticky top-0 z-40 flex bg-background justify-between mb-8 px-4 py-4 border-b border-[var(--color-light)]">
      <Link href="/" className="font-bold">
        vida
      </Link>

      <div className="flex items-center gap-4">
        <ThemeToggle initialTheme={initialTheme} />
        {isLoading ? (
          <Spinner />
        ) : user ? (
          <button
            className="text-sm"
            onClick={() => setModalContent("settings")}
          >
            {user.username}
          </button>
        ) : (
          <button
            onClick={() => setModalContent("register")}
            className="text-sm hover:underline"
          >
            login
          </button>
        )}
      </div>
      {modal}
    </header>
  );
}
