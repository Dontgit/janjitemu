import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="max-w-4xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--primary)] sm:text-sm">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl xl:text-[2.75rem] xl:leading-[1.08]">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-[15px] lg:text-base lg:leading-8">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3 lg:justify-end">{actions}</div> : null}
    </div>
  );
}
