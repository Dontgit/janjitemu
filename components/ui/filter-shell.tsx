import { ReactNode } from "react";
import { Filter } from "lucide-react";
import { Card } from "@/components/ui/card";

type FilterShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function FilterShell({ title, description, children, footer }: FilterShellProps) {
  return (
    <Card className="p-6 xl:p-7">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,280px)_minmax(0,1fr)] xl:items-end xl:gap-5">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </div>
          <p className="mt-3 text-lg font-semibold">{title}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
        </div>
        <div className="min-w-0 w-full">{children}</div>
      </div>
      {footer ? <div className="mt-4 text-sm text-[var(--muted)]">{footer}</div> : null}
    </Card>
  );
}
