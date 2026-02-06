"use client";
import { Loader2 } from "lucide-react";

interface SigninSubmitButtonProps {
  isLoading: boolean;
}

export default function SigninSubmitButton({ isLoading }: SigninSubmitButtonProps) {
  return (
    <button type="submit" className="w-full rounded-xl py-3 text-sm font-black bg-emerald-500 hover:bg-emerald-600 text-white transition-all border-2 border-emerald-600 mt-4 flex items-center justify-center" disabled={isLoading}>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Masuk Sekarang"}
    </button>
  );
}
