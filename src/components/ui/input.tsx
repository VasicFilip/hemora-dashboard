import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  variant?: 'default' | 'glass'
}

function Input({ className, type, variant = 'default', ...props }: InputProps) {
  const glassClasses = 'bg-white/35 dark:bg-white/5 backdrop-blur-[12px] border border-black/15 dark:border-white/20 placeholder:text-muted-foreground/60'
  const defaultClasses = 'dark:bg-input/30 border-input'
  
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground selection:bg-primary selection:text-primary-foreground h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        variant === 'glass' ? glassClasses : defaultClasses,
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
