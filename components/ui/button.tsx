import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function buttonVariants(
  variant: ButtonProps["variant"] = "primary",
  className?: string
) {
  return cn(
    "focus-ring inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-60 hover:-translate-y-0.5 focus-visible:outline-none",
    variant === "primary" &&
      "bg-[var(--primary)] text-white shadow-[0_14px_32px_rgba(15,118,110,0.22)] hover:bg-[var(--primary-strong)]",
    variant === "secondary" &&
      "border border-[var(--border)] bg-white/95 text-[var(--foreground)] shadow-[0_8px_20px_rgba(20,49,44,0.06)] hover:bg-teal-50/80 hover:border-teal-200",
    variant === "ghost" && "text-[var(--primary)] hover:bg-teal-50/70",
    className
  );
}

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonVariants(variant, className)}
      {...props}
    />
  );
}
