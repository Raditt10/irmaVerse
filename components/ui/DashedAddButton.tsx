"use client";
import { Plus } from "lucide-react";
import { ReactNode } from "react";

interface DashedAddButtonProps {
  label: string;
  onClick: () => void;
  count?: number;
  icon?: ReactNode;
  className?: string;
  emptyLabel?: string;
}

export default function DashedAddButton({
  label,
  onClick,
  count = 0,
  icon = <Plus className="h-5 w-5" />,
  className = "",
  emptyLabel,
}: DashedAddButtonProps) {
  const displayLabel =
    count === 0 && emptyLabel ? emptyLabel : count > 0 ? `${label} (Saat ini: ${count})` : label;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full py-3 rounded-2xl bg-emerald-100 text-emerald-700 font-bold border-2 border-dashed border-emerald-300 hover:bg-emerald-200 hover:border-emerald-400 transition-all flex items-center justify-center gap-2 text-sm lg:text-base ${className}`}
    >
      {icon}
      {displayLabel}
    </button>
  );
}
