import Link from "next/link";
import { Clock3, Layers3, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatLongDate } from "@/lib/utils";

type ScheduleBooking = {
  id: string;
  customerName: string;
  status: Parameters<typeof StatusBadge>[0]["status"];
  time: string;
  serviceName: string;
  assignedStaffName?: string | null;
  phone: string;
};

export function ScheduleDayCard({
  date,
  bookings
}: {
  date: string;
  bookings: ScheduleBooking[];
}) {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="section-label">
            <Sparkles className="h-4 w-4" />
            {formatLongDate(date)}
          </span>
          <p className="mt-3 text-sm text-[var(--muted)]">{date}</p>
        </div>
        <div className="soft-stat rounded-[22px] px-4 py-3 text-sm">
          <p className="text-[var(--muted)]">Booking hari ini</p>
          <p className="mt-1 text-lg font-semibold">{bookings.length}</p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {bookings.map((booking) => (
          <div key={booking.id} className="surface-card rounded-[22px] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{booking.customerName}</p>
                  <StatusBadge status={booking.status} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-4 w-4 text-[var(--primary)]" />
                    {booking.time}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Layers3 className="h-4 w-4 text-[var(--primary)]" />
                    {booking.serviceName}
                  </span>
                  {booking.assignedStaffName ? (
                    <>
                      <span>•</span>
                      <span>{booking.assignedStaffName}</span>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="text-sm sm:text-right">
                <p className="text-[var(--muted)]">{booking.phone}</p>
                <Link href={`/bookings/${booking.id}`} className="mt-2 inline-flex font-semibold text-[var(--primary)]">
                  Detail booking
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
