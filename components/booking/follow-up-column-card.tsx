import Link from "next/link";
import { FollowUpForm } from "@/components/booking/follow-up-form";
import { FollowUpBadge, StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDateTimeLabel } from "@/lib/utils";

type FollowUpBooking = Parameters<typeof FollowUpForm>[0]["booking"];

type FollowUpColumn = {
  id: string;
  label: string;
  description: string;
  items: FollowUpBooking[];
};

export function FollowUpColumnCard({
  column,
  redirectTo
}: {
  column: FollowUpColumn;
  redirectTo: string;
}) {
  return (
    <Card className="flex flex-col p-4">
      <div className="rounded-[22px] bg-white/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold">{column.label}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{column.description}</p>
          </div>
          <span className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--muted)]">
            {column.items.length}
          </span>
        </div>
      </div>
      <div className="mt-4 space-y-4">
        {column.items.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-[var(--border)] bg-white/50 p-4 text-sm text-[var(--muted)]">
            Belum ada card di tahap ini.
          </div>
        ) : (
          column.items.map((booking) => (
            <div key={booking.id} className="surface-card rounded-[24px] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{booking.customerName}</p>
                <StatusBadge status={booking.status} />
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">{booking.serviceName}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <FollowUpBadge status={booking.followUpStatus ?? "none"} />
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-slate-600">
                  {booking.date} • {booking.time}
                </span>
              </div>
              <div className="mt-4 rounded-[20px] border border-dashed border-[var(--border)] bg-white/70 p-3 text-sm text-[var(--muted)]">
                <p>Next action: {formatDateTimeLabel(booking.followUpNextActionAt)}</p>
                <p className="mt-1">{booking.followUpNote || "Belum ada catatan follow up."}</p>
              </div>
              <div className="mt-4">
                <FollowUpForm booking={booking} redirectTo={redirectTo} compact submitLabel="Update card" />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                <span className="text-[var(--muted)]">{booking.phone}</span>
                <Link href={`/bookings/${booking.id}`} className="font-semibold text-[var(--primary)]">
                  Detail booking
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
