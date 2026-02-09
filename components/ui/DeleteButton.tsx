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
  iconClassName?: string; // Tambahan properti baru
}

export default function DeleteButton({
  label = "Hapus",
  onClick,
  icon, // icon bisa null, nanti default dipakai di bawah
  className = "",
  variant = "with-label",
  showConfirm = true,
  confirmTitle = "Hapus Data?",
  confirmMessage = "Apakah Anda yakin ingin menghapus data ini?",
  iconClassName = "h-5 w-5", // Default size
}: DeleteButtonProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Gunakan icon default jika prop icon tidak diberikan
  const finalIcon = icon || <Trash2 className={iconClassName} />;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showConfirm) {
      setShowConfirmDialog(true);
    } else {
      handleConfirm();
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

  const baseClasses = `
    font-black text-white 
    bg-red-500 hover:bg-red-600 
    border-2 border-red-600 border-b-4 
    active:border-b-2 active:translate-y-[2px] 
    transition-all shadow-sm hover:shadow-red-200
    disabled:opacity-70 disabled:cursor-not-allowed
  `;

  return (
    <>
      {variant === "icon-only" ? (
        <button
          onClick={handleClick}
          className={`
            ${baseClasses} 
            flex items-center justify-center 
            rounded-2xl
            ${className} 
            /* Default padding jika tidak ada override class p- */
            ${!className.includes('p-') && !className.includes('w-') ? 'p-3.5' : ''}
          `}
          title={label}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            finalIcon
          )}
        </button>
      ) : (
        <button
          onClick={handleClick}
          disabled={isLoading}
          className={`
            ${baseClasses} 
            px-6 py-3.5 rounded-2xl  /* Update default padding jadi lebih besar */
            flex items-center gap-2 whitespace-nowrap 
            ${className}
          `}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            finalIcon
          )}
          <span>{isLoading ? "Menghapus..." : label}</span>
        </button>
      )}

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