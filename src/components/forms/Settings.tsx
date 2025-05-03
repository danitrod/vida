import { useUser } from "@/context/UserContext";
import { FormProps } from "./props";

export const Settings = ({ onClose }: FormProps) => {
  const { refreshUser } = useUser();
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">Configurações</h2>
      <button
        className="btn bg-red-100 text-red-600 hover:bg-red-200"
        onClick={async () => {
          await fetch("/api/logout", { method: "POST" });
          refreshUser();
          onClose();
        }}
      >
        sair
      </button>
    </div>
  );
};
