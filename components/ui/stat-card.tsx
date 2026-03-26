import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  detail
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="premium-panel rounded-[26px] p-5 lg:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
        <span className="icon-chip h-10 w-10 rounded-[14px]">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl xl:text-[2rem]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--primary)]">{detail}</p>
    </Card>
  );
}
