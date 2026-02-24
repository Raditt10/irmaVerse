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
  const displayLabel = count === 0 && emptyLabel ? emptyLabel : label;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full py-4 rounded-2xl bg-slate-50 text-slate-500 font-bold border-2 border-dashed border-slate-200 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-300 transition-all flex items-center justify-center gap-2 text-sm lg:text-base group ${className}`}
    >
      <div className="p-1 rounded-lg bg-white border border-slate-200 group-hover:border-teal-200 group-hover:bg-white transition-all">
        {icon}
      </div>
      {displayLabel}
    </button>
  );
}
