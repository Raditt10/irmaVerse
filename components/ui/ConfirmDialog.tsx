"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

type ConfirmationType = "warning" | "info" | "success";

interface CartoonConfirmDialogProps {
  type: ConfirmationType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const CartoonConfirmDialog = ({
  type,
  title,
  message,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  onConfirm,
  onCancel,
  isOpen: externalIsOpen,
  onClose,
}: CartoonConfirmDialogProps) => {
  const [internalIsOpen, setInternalIsOpen] = useState(externalIsOpen !== false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const typeStyles = {
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-300",
      icon: AlertCircle,
      iconColor: "text-amber-600",
      accentColor: "bg-amber-500",
      buttonColor: "bg-amber-500 hover:bg-amber-600",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-300",
      icon: Info,
      iconColor: "text-blue-600",
      accentColor: "bg-blue-500",
      buttonColor: "bg-blue-500 hover:bg-blue-600",
    },
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-300",
      icon: CheckCircle,
      iconColor: "text-emerald-600",
      accentColor: "bg-emerald-500",
      buttonColor: "bg-emerald-500 hover:bg-emerald-600",
    },
  };

  const style = typeStyles[type];
  const Icon = style.icon;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
    setInternalIsOpen(false);
    onClose?.();
  };

  const handleCancel = () => {
    setInternalIsOpen(false);
    onCancel?.();
    onClose?.();
  };

  if (!isOpen) return null;

  const dialogContent = (
    <>
      {/* Backdrop - Full screen blur */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
      
      {/* Dialog - Centered on screen */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`
            ${style.bg} ${style.border}
            rounded-2xl border-4 p-6 shadow-2xl
            relative overflow-hidden
            animate-in scale-in-95 zoom-in-50
            max-w-sm w-full
          `}
        >
          {/* Top accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-3 ${style.accentColor}`}></div>

          <div className="pt-2">
            {/* Icon */}
            <div className={`${style.iconColor} mb-3`}>
              <Icon size={40} strokeWidth={2.5} />
            </div>

            {/* Title & Message */}
            <h2 className="text-lg font-bold mb-2">{title}</h2>
            <p className="text-sm opacity-90 mb-6">{message}</p>

            {/* Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="
                  px-5 py-2 rounded-lg font-bold text-sm
                  bg-gray-200 hover:bg-gray-300
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                  border-2 border-gray-300
                  shadow-md hover:shadow-lg
                "
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`
                  px-5 py-2 rounded-lg font-bold text-sm text-white
                  ${style.buttonColor}
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                  border-2 border-transparent
                  shadow-md hover:shadow-lg
                `}
              >
                {isLoading ? "Memproses..." : confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (!isMounted) return null;

  return createPortal(dialogContent, document.body);
};

export default CartoonConfirmDialog;