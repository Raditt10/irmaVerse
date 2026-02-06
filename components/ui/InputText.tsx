import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 lg:h-11 w-full rounded-3xl border-2 lg:border-[3px] border-slate-300 bg-gradient-to-br from-slate-50 to-white px-4 py-3 lg:px-6 lg:py-3.5 text-sm lg:text-base font-medium text-slate-700 placeholder:text-slate-400 shadow-[0_4px_0_0_#cbd5e1] lg:shadow-[0_6px_0_0_#cbd5e1] transition-all outline-none hover:border-slate-400 hover:shadow-[0_6px_0_0_#cbd5e1] lg:hover:shadow-[0_8px_0_0_#cbd5e1] focus-visible:border-teal-400 focus-visible:from-white focus-visible:to-cyan-50 focus-visible:shadow-[0_6px_0_0_#34d399] lg:focus-visible:shadow-[0_8px_0_0_#34d399] active:shadow-[0_2px_0_0_#cbd5e1] lg:active:shadow-[0_2px_0_0_#cbd5e1] disabled:cursor-not-allowed disabled:opacity-50 file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Input }
