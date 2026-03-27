import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type BookingFlowStepCardProps = {
  id: number;
  title: string;
  detail: string;
  active: boolean;
  passed: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export function BookingFlowStepCard({
  id,
  title,
  detail,
  active,
  passed,
  disabled = false,
  onClick
}: BookingFlowStepCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-current={active ? "step" : undefined}
      className={cn(
        "rounded-[24px] border px-4 py-4 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-60",
        active && "border-teal-500 bg-teal-50 shadow-[0_12px_28px_rgba(15,118,110,0.08)]",
        passed && !active && "border-emerald-200 bg-emerald-50",
        !active && !passed && "border-[var(--border)] bg-white hover:border-teal-300 hover:shadow-[0_10px_24px_rgba(20,49,44,0.05)]"
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold",
            passed && "bg-emerald-600 text-white",
            active && !passed && "bg-teal-600 text-white",
            !active && !passed && "bg-slate-100 text-slate-600"
          )}
        >
          {passed ? <CheckCircle2 className="h-4 w-4" /> : id}
        </span>
        <div>
          <p className="font-semibold">Step {id}</p>
          <p className="text-sm text-[var(--muted)]">{title}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-[var(--muted)]">{detail}</p>
    </button>
  );
}
