import { Sparkles } from "lucide-react";

export default function Loading({ size = "lg", text = "Memuat..." }) {
  const sizeMap = {
    sm: { icon: 20, },
    md: { icon: 28, },
    lg: { icon: 40, },
  };

  const sizes = sizeMap[size as keyof typeof sizeMap];

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      {/* Spinning Sparkles */}
      <div className="mb-4 animate-spin" style={{ animationDuration: "2s" }}>
        <Sparkles 
          className="text-emerald-400" 
          strokeWidth={2}
          size={sizes.icon}
        />
      </div>

      {/* Loading Text */}
      <p className="text-center text-slate-600 font-semibold" style={{ fontSize: size === "sm" ? "12px" : size === "md" ? "14px" : "16px" }}>
        {text}
      </p>
    </div>
  );
}
