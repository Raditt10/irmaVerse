"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface MaterialRecapButtonProps {
  materialId: string;
  onNoRekapan?: () => void;
}

export default function MaterialRecapButton({ materialId, onNoRekapan }: MaterialRecapButtonProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  const handleClick = async () => {
    setChecking(true);
    try {
      const res = await fetch(`/api/materials/${materialId}/rekapan`);
      if (res.ok) {
        router.push(`/materials/${materialId}/rekapan`);
      } else {
        onNoRekapan?.();
      }
    } catch {
      onNoRekapan?.();
    } finally {
      setChecking(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={checking}
      className="w-full py-3 rounded-xl bg-emerald-500 text-white font-black border-2 border-emerald-600 border-b-4 hover:bg-emerald-400 active:border-b-2 active:translate-y-0.5 transition-all shadow-lg hover:shadow-emerald-200 disabled:opacity-60"
    >
      {checking ? "Memuat..." : "Lihat Rekapan Materi"}
    </button>
  );
}
