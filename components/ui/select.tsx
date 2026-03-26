import { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-2xl border border-[var(--border)] bg-white/95 px-4 py-3 text-sm text-[var(--foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_6px_18px_rgba(20,49,44,0.04)] outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100",
        className
      )}
      {...props}
    />
  );
}
