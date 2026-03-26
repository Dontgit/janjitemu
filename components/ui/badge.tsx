import { BookingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusMap: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  rescheduled: "bg-sky-100 text-sky-700",
  completed: "bg-teal-100 text-teal-700",
  cancelled: "bg-rose-100 text-rose-700",
  "no-show": "bg-slate-200 text-slate-700"
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize",
        statusMap[status]
      )}
    >
      {status}
    </span>
  );
}
