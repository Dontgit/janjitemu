import { BookingStatus, FollowUpStatus } from "@/lib/types";
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

const followUpMap: Record<FollowUpStatus, string> = {
  none: "bg-slate-100/90 text-slate-600 border-slate-200/80",
  "needs-follow-up": "bg-amber-100/90 text-amber-700 border-amber-200/80",
  contacted: "bg-sky-100/90 text-sky-700 border-sky-200/80",
  "offer-sent": "bg-violet-100/90 text-violet-700 border-violet-200/80",
  won: "bg-emerald-100/90 text-emerald-700 border-emerald-200/80",
  lost: "bg-rose-100/90 text-rose-700 border-rose-200/80"
};

const followUpLabels: Record<FollowUpStatus, string> = {
  none: "Belum perlu",
  "needs-follow-up": "Perlu follow up",
  contacted: "Sudah dihubungi",
  "offer-sent": "Penawaran dikirim",
  won: "Deal",
  lost: "Belum berhasil"
};

export function getFollowUpStatusLabel(status: FollowUpStatus) {
  return followUpLabels[status];
}

export function FollowUpBadge({ status }: { status: FollowUpStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.08em]",
        followUpMap[status]
      )}
    >
      {followUpLabels[status]}
    </span>
  );
}
