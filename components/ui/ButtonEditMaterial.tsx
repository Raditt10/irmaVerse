"use client";
import { useRouter } from "next/navigation";
import { Edit } from "lucide-react";

interface MaterialEditButtonProps {
  materialId: string;
}

export default function MaterialEditButton({ materialId }: MaterialEditButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/materials/${materialId}/edit`)}
      className="flex-1 py-3 rounded-xl bg-emerald-400 text-white font-black border-2 border-emerald-600 border-b-4 hover:bg-emerald-500 active:border-b-2 active:translate-y-[2px] transition-all flex items-center justify-center gap-2 group/btn"
    >
      <Edit className="w-4 h-4" /> Edit
    </button>
  );
}
