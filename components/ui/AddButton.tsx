import { Plus } from "lucide-react";
import { ReactNode } from "react";

interface AddButtonProps {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  color?: "teal" | "emerald";
  className?: string;
  hideIcon?: boolean;
}

export default function AddButton({
  label,
  onClick,
  icon = <Plus className="h-5 w-5" />,
  color = "teal",
  hideIcon = false,
  className = "",
}: AddButtonProps) {
  const colorClasses = {
    teal: "bg-teal-400 text-white border-2 border-teal-600 border-b-4 hover:bg-teal-500 shadow-lg hover:shadow-teal-200",
    emerald: "bg-emerald-400 text-white border-2 border-emerald-600 border-b-4 shadow-[0_4px_0_0_#059669] hover:bg-emerald-500",
  };

  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-2xl font-black active:border-b-2 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 whitespace-nowrap h-fit md:justify-start ${colorClasses[color]} ${className}`}
    >
      {!hideIcon && icon}
      {label}
    </button>
  );
}
