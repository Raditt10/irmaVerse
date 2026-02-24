"use client";
import { Sparkles } from "lucide-react";

interface SuccessDataFoundProps {
  message?: string;
  icon?: "sparkles";
}

export default function SuccessDataFound({ 
  message = "Data berhasil ditemukan",
  icon = "sparkles"
}: SuccessDataFoundProps) {
  return (
    <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-full bg-emerald-50 border-2 border-emerald-200">
      <Sparkles className="h-5 w-5 text-emerald-500 shrink-0" strokeWidth={2} />
      <p className="text-sm font-black text-emerald-700">
        {message}
      </p>
    </div>
  );
}
