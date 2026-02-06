"use client";
import { Trash2 } from "lucide-react";
import { ReactNode, useState } from "react";
import CartoonConfirmDialog from "./ConfirmDialog";

interface DeleteButtonProps {
  label?: string;
  onClick: () => void | Promise<void>;
  icon?: ReactNode;
  className?: string;
  variant?: "icon-only" | "with-label";
  showConfirm?: boolean;
  confirmTitle?: string;
  confirmMessage?: string;
}

export default function DeleteButton({
  label = "Hapus",
  onClick,
  icon = <Trash2 className="h-5 w-5" />,
  className = "",
  variant = "with-label",
  showConfirm = true,
  confirmTitle = "Hapus Data?",
  confirmMessage = "Apakah Anda yakin ingin menghapus data ini?",
}: DeleteButtonProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    if (showConfirm) {
      setShowConfirmDialog(true);
    } else {
      onClick();
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
  };

  const baseClasses = "bg-red-400 text-white border-2 border-red-600 border-b-4 hover:bg-red-500 active:border-b-2 active:translate-y-[2px] active:shadow-none transition-all";

  if (showConfirmDialog) {
    return (
      <CartoonConfirmDialog
        type="warning"
        title={confirmTitle}
        message={confirmMessage}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        isOpen={true}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirmDialog(false)}
        onClose={() => setShowConfirmDialog(false)}
      />
    );
  }

  if (variant === "icon-only") {
    if (showConfirmDialog) {
      return (
        <CartoonConfirmDialog
          type="warning"
          title={confirmTitle}
          message={confirmMessage}
          confirmText="Ya, Hapus"
          cancelText="Batal"
          isOpen={true}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirmDialog(false)}
          onClose={() => setShowConfirmDialog(false)}
        />
      );
    }

    return (
      <button
        onClick={handleClick}
        className={`p-3 rounded-xl ${baseClasses} flex items-center justify-center ${className}`}
        title={label}
        disabled={isLoading}
      >
        {icon}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`px-6 py-3 rounded-2xl font-black flex items-center gap-2 whitespace-nowrap h-fit ${baseClasses} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {icon}
        {isLoading ? "Menghapus..." : label}
      </button>
      {showConfirmDialog && (
        <CartoonConfirmDialog
          type="warning"
          title={confirmTitle}
          message={confirmMessage}
          confirmText="Ya, Hapus"
          cancelText="Batal"
          isOpen={showConfirmDialog}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirmDialog(false)}
          onClose={() => setShowConfirmDialog(false)}
        />
      )}
    </>
  );
}
