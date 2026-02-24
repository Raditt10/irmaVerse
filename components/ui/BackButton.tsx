"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  label?: string;
  onClick?: () => void;
  className?: string;
}

export default function BackButton({
  label = "Kembali",
  onClick,
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border-2 border-slate-300 text-slate-600 font-bold hover:border-teal-400 hover:text-teal-600 hover:shadow-[0_4px_0_0_#14b8a6] active:translate-y-[2px] active:shadow-none transition-all text-sm shadow-[0_4px_0_0_#cbd5e1] whitespace-nowrap ${className}`}
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={3} />
      {label}
    </button>
  );
}

