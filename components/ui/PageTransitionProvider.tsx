"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "./Loading";

export default function PageTransitionProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Stop loading dengan petite delay untuk memastikan page sudah render
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      setLoadingTimeout(timeout);
    }
  }, [pathname, searchParams]);

  // Intercept link clicks untuk show loading
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (link && link.href && !link.target && !link.hasAttribute("download")) {
        const href = link.getAttribute("href");
        // Cek apakah link adalah internal navigation (bukan external)
        if (href && href.startsWith("/")) {
          setIsLoading(true);
        }
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
      if (loadingTimeout) clearTimeout(loadingTimeout);
    };
  }, [loadingTimeout]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <Loading text="Memuat halaman..." size="lg" />
    </div>
  );
}
