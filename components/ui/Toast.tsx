"use client";
import { Check, AlertCircle, X, AlertTriangle, Info } from "lucide-react";
import React from "react";

export interface ToastProps {
  show: boolean;
  message: string;
  type: "success" | "error" | "warning" | "info";
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({ show, message, type, onClose }) => {
  if (!show) return null;

  const getGradient = () => {
    switch (type) {
      case "success":
        return "from-emerald-500 to-cyan-500";
      case "error":
        return "from-red-500 to-rose-500";
      case "warning":
        return "from-amber-400 to-orange-400";
      case "info":
        return "from-indigo-500 to-blue-500";
      default:
        return "from-slate-700 to-slate-500";
    }
  };

  const Icon = () => {
    switch (type) {
      case "success":
        return <Check className="h-4 w-4 text-white stroke-3" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-white stroke-3" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-white stroke-3" />;
      case "info":
        return <Info className="h-4 w-4 text-white stroke-3" />;
      default:
        return <Info className="h-4 w-4 text-white stroke-3" />;
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 pointer-events-none">
      <div
        className={`pointer-events-auto shadow-lg rounded-xl px-5 py-3 flex items-center gap-3 min-w-[260px] max-w-[90vw] text-white bg-linear-to-r ${getGradient()}`}
        style={{ animation: "slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
      >
        <div className="shrink-0 bg-white/20 rounded-full p-1.5 flex items-center justify-center">
          <Icon />
        </div>
        <p className="text-sm font-bold leading-snug wrap-break-word">{message}</p>

        {onClose && (
          <button
            onClick={onClose}
            className="shrink-0 ml-1 p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-4 w-4 text-white stroke-3" />
          </button>
        )}
      </div>

      <style jsx global>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Toast;