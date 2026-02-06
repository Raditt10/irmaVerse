"use client";
import { useRouter } from "next/navigation";
import { Book } from "lucide-react";
import DeleteButton from "./DeleteButton";
import MaterialEditButton from "./ButtonEditMaterial";

interface MaterialInstructorActionsProps {
  materialId: string;
  onDelete: (materialId: string) => void;
}

export default function MaterialInstructorActions({
  materialId,
  onDelete,
}: MaterialInstructorActionsProps) {
  const router = useRouter();

  return (
    <div className="flex gap-2 flex-wrap">
      <MaterialEditButton materialId={materialId} />
      <button
        onClick={() => router.push(`/materials/${materialId}/attendance`)}
        className="flex-1 py-3 rounded-xl bg-cyan-400 text-white font-black border-2 border-cyan-600 border-b-4 hover:bg-cyan-500 active:border-b-2 active:translate-y-[2px] transition-all flex items-center justify-center gap-2"
      >
        <Book className="w-4 h-4" /> Absensi
      </button>
      <DeleteButton
        onClick={() => onDelete(materialId)}
        variant="icon-only"
        showConfirm={true}
      />
    </div>
  );
}
