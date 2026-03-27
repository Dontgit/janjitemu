import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "focus-ring w-full rounded-2xl border border-[var(--border)] bg-white/95 px-4 py-3 text-sm text-[var(--foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_6px_18px_rgba(20,49,44,0.04)] outline-none transition placeholder:text-[var(--muted-soft)] focus:border-teal-500 focus:bg-white",
        className
      )}
      {...props}
    />
  );
}
