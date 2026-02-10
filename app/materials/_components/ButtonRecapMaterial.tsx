"use client";
import { useRouter } from "next/navigation";

interface MaterialRecapButtonProps {
  materialId: string;
}

export default function MaterialRecapButton({ materialId }: MaterialRecapButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/materials/${materialId}/recap`)}
      className="w-full py-3 rounded-xl bg-cyan-400 text-white font-black border-2 border-cyan-600 border-b-4 hover:bg-cyan-500 active:border-b-2 active:translate-y-0.5 transition-all"
    >
      Lihat Rekapan
    </button>
  );
}
