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
    "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5",
    variant === "primary" &&
      "bg-[var(--primary)] text-white shadow-[0_12px_30px_rgba(15,118,110,0.25)] hover:bg-[var(--primary-strong)]",
    variant === "secondary" &&
      "border border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-teal-50",
    variant === "ghost" && "text-[var(--primary)] hover:bg-teal-50",
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
