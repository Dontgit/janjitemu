import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FormSectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function FormSection({
  eyebrow,
  title,
  description,
  children,
  className
}: FormSectionProps) {
  return (
    <section className={cn("space-y-4 rounded-[28px] border border-[var(--border)] bg-white/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:p-6", className)}>
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
            {eyebrow}
          </p>
        ) : null}
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}
