import { ReactNode } from "react";
import { CalendarX, SearchX } from "lucide-react";

interface EmptyStateProps {
  icon?: "calendar" | "search";
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  customIcon?: ReactNode;
}

export default function EmptyState({
  icon = "search",
  title,
  description,
  actionLabel,
  onAction,
  customIcon,
}: EmptyStateProps) {
  const icons = {
    calendar: <CalendarX className="h-12 w-12 text-slate-400" />,
    search: <SearchX className="h-12 w-12 text-slate-400" />,
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-4 border-dashed border-slate-300 mb-6">
        {customIcon || icons[icon]}
      </div>
      <h3 className="text-2xl font-black text-slate-700 mb-2">
        {title}
      </h3>
      <p className="text-slate-500 font-medium max-w-md mb-8">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl shadow-[0_4px_0_0_#e2e8f0] hover:border-teal-400 hover:text-teal-600 hover:shadow-[0_4px_0_0_#34d399] active:translate-y-[2px] active:shadow-none transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
