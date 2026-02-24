import { Sparkles } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function Loading({ 
  size = "lg", 
  text = "Memuat...", 
  fullScreen = false,
  className = "" 
}: LoadingProps) {
  
  const sizeMap = {
    sm: { icon: 20, fontSize: "text-xs" },
    md: { icon: 28, fontSize: "text-sm" },
    lg: { icon: 40, fontSize: "text-base" },
  };

  const sizes = sizeMap[size];

  const content = (
    <div className={`flex flex-col items-center justify-center py-8 px-4 ${className}`}>
      {/* Spinning Sparkles */}
      <div className="mb-4 animate-spin" style={{ animationDuration: "3s" }}>
        <Sparkles 
          className="text-emerald-400" 
          strokeWidth={2}
          size={sizes.icon}
        />
      </div>

      {/* Loading Text */}
      <p className={`text-center text-slate-500 font-bold animate-pulse ${sizes.fontSize}`}>
        {text}
      </p>
    </div>
  );

  // Jika mode fullScreen diaktifkan, buat overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FDFBF7]/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}