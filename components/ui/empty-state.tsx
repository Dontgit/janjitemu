import { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-dashed border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,252,251,0.92))] px-6 py-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]",
        className
      )}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-teal-50 text-[var(--primary)] shadow-[0_10px_24px_rgba(20,49,44,0.06)]">
        <Inbox className="h-6 w-6" />
      </div>
      <p className="mt-5 text-lg font-semibold">{title}</p>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
