"use client";
import { useRouter } from "next/navigation";
import MaterialRecapButton from "./ButtonRecapMaterial";

interface MaterialUserActionsProps {
  materialId: string;
  isJoined: boolean;
  attendedAt?: string;
  materialDate: string;
}

export default function MaterialUserActions({
  materialId,
  isJoined,
  attendedAt,
  materialDate,
}: MaterialUserActionsProps) {
  const router = useRouter();

  if (attendedAt) {
    // Sudah absen, tombol utama recap
    return <MaterialRecapButton materialId={materialId} />;
  }

  return (
    <button
      onClick={() => router.push(`/materials/${materialId}/absensi`)}
      className="w-full py-3 rounded-xl bg-teal-400 text-white font-black border-2 border-teal-600 border-b-4 hover:bg-teal-500 active:border-b-2 active:translate-y-0.5 transition-all shadow-lg hover:shadow-teal-200"
    >
      Aku Ikut! ✋
    </button>
  );
}
