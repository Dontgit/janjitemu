import { BookingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusMap: Record<BookingStatus, string> = {
  pending: "bg-amber-100/90 text-amber-700 border-amber-200/80",
  confirmed: "bg-emerald-100/90 text-emerald-700 border-emerald-200/80",
  rescheduled: "bg-sky-100/90 text-sky-700 border-sky-200/80",
  completed: "bg-teal-100/90 text-teal-700 border-teal-200/80",
  cancelled: "bg-rose-100/90 text-rose-700 border-rose-200/80",
  "no-show": "bg-slate-200/90 text-slate-700 border-slate-300/70"
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold capitalize tracking-[0.08em]",
        statusMap[status]
      )}
    >
      {status}
    </span>
  );
}
