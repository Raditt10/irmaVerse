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

  if (isJoined) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 text-emerald-500 font-bold text-xs bg-emerald-50 py-2 px-3 rounded-lg text-center">
          <span className="w-full text-center">
            Kamu sudah mengikuti kajian ini, pada tanggal{" "}
            {attendedAt
              ? new Date(attendedAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : materialDate}
            .
          </span>
        </div>
        <MaterialRecapButton materialId={materialId} />
      </div>
    );
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
