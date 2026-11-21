"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { RegistrationForm } from "./forms/Registration";
import { LoginForm } from "./forms/Login";
import { useUser } from "@/context/UserContext";
import Spinner from "./Spinner";
import { Settings } from "./forms/Settings";

// Scrolled distance (px) in one direction before the header hides or shows,
// so small jitters (trackpads, momentum) don't toggle it.
const SCROLL_THRESHOLD = 8;
// Near the top of the page the header is always shown.
const ALWAYS_SHOWN_ABOVE = 80;

export default function Header() {
  const { user, isLoading } = useUser();
  const [modalContent, setModalContent] = useState<string | null>(null);
  const [scrolledAway, setScrolledAway] = useState(false);

  // Hide when scrolling down, show when scrolling up. Read once per frame.
  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      // Clamp: iOS overscroll at either end reports positions out of range,
      // and the bounce back would count as scrolling up.
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = Math.min(Math.max(window.scrollY, 0), Math.max(max, 0));
      if (y <= ALWAYS_SHOWN_ABOVE) {
        setScrolledAway(false);
        lastY = y;
        return;
      }
      if (Math.abs(y - lastY) < SCROLL_THRESHOLD) return;
      setScrolledAway(y > lastY);
      lastY = y;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Never hidden while a modal (rendered inside the header) is open.
  const hidden = scrolledAway && !modalContent;

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
    // Visible: no translate at all (`translate-none`), because any translate
    // makes the header the containing block of the fixed-position modals
    // inside it. Keyboard focus inside the header brings it back.
    <header
      className={`sticky top-0 z-40 flex bg-background justify-between mb-8 px-4 py-4 border-b border-[var(--color-light)] transition-[translate] duration-300 ease-out motion-reduce:transition-none focus-within:translate-none ${
        hidden ? "-translate-y-full" : "translate-none"
      }`}
    >
      <Link href="/" className="font-bold">
        vida
      </Link>

      <div className="flex items-center gap-4">
        <ThemeToggle />
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
