import { Check, AlertCircle, X } from "lucide-react";
import React from "react";

export interface ToastProps {
  show: boolean;
  message: string;
  type: "success" | "error";
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({ show, message, type, onClose }) => {
  if (!show) return null;
  return (
    <div
      className="fixed left-1/2 top-6 z-50 -translate-x-1/2 animate-slideDown bg-linear-to-r from-emerald-500 to-cyan-500 shadow-lg rounded-xl px-5 py-3 flex items-center gap-3 min-w-[260px] max-w-[90vw] text-white"
      style={{ animation: "slideDown 0.3s ease" }}
    >
      <div className="shrink-0 bg-white/20 rounded-full p-1.5 flex items-center justify-center">
        {type === "success" ? (
          <Check className="h-4 w-4 text-white stroke-3" />
        ) : (
          <AlertCircle className="h-4 w-4 text-white stroke-3" />
        )}
      </div>
      <p className="text-sm font-bold leading-snug wrap-break-word">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 ml-1 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="h-4 w-4 text-white stroke-3" />
        </button>
      )}
      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
};

export default Toast;
