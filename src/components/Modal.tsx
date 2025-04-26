"use client";

import { ReactNode } from "react";

type ModalProps = {
  isOpen: boolean;
  onCloseAction: () => void;
  className?: string;
  children: ReactNode;
};

export default function Modal({
  isOpen,
  onCloseAction,
  className,
  children,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center transition-opacity duration-150"
      onClick={onCloseAction}
    >
      <div
        className={`p-6 rounded shadow max-w-sm w-full transform transition-all duration-150 scale-95 opacity-0 animate-fadeIn ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button
          onClick={onCloseAction}
          className="mt-4 text-sm text-gray-500 hover:underline"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
