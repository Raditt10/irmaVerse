import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="text-center py-20">
      <Sparkles className="h-10 w-10 text-teal-400 animate-spin mx-auto mb-4" />
      <p className="text-slate-500 font-bold">Memuat...</p>
    </div>
  );
}
