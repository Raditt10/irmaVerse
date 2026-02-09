"use client";

import { useRouter } from "next/navigation";
import { Edit } from "lucide-react";

interface ButtonEditProps {
  id: string;
  basePath?: string;
  className?: string;
  label?: string;
}

export default function ButtonEdit({
  id,
  basePath = "/materials",
  className = "",
  label = "Edit",
}: ButtonEditProps) {
  const router = useRouter();

  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Mencegah klik tembus jika tombol ada di dalam card yang bisa diklik
        router.push(`${basePath}/${id}/edit`);
      }}
      className={`
        ${className}
        relative
        flex items-center justify-center gap-2
        px-6 py-2.5               
        min-w-[100px]             
        rounded-2xl
        bg-emerald-400 text-white font-black
        border-2 border-emerald-600 border-b-4
        shadow-md hover:shadow-emerald-200
        hover:bg-emerald-500
        active:border-b-2 active:translate-y-0.5 active:shadow-none
        transition-all duration-200
        group
      `}
    >
      <Edit className="w-4 h-4 stroke-[2.5] group-hover:scale-110 transition-transform" />
      <span>{label}</span>
    </button>
  );
}