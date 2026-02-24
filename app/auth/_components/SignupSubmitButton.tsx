"use client";
import { Loader2 } from "lucide-react";

interface SignupSubmitButtonProps {
  isLoading: boolean;
}

export default function SignupSubmitButton({ isLoading }: SignupSubmitButtonProps) {
  return (
    <button type="submit" className="w-full rounded-xl py-3 text-sm font-black bg-teal-500 hover:bg-teal-600 text-white transition-all border-2 border-teal-600 mt-4 flex items-center justify-center" disabled={isLoading}>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Daftar Akun"}
    </button>
  );
}
