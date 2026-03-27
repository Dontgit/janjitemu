import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StatusBadge, getFollowUpStatusLabel } from "@/components/ui/badge";
import { formatCurrency, formatDateTimeLabel, formatLongDate } from "@/lib/utils";

type AnalyticsActionCardProps = {
  booking: {
    id: string;
    customerName: string;
    status: Parameters<typeof StatusBadge>[0]["status"];
    serviceName: string;
    date: string;
    time: string;
    totalPrice?: number | null;
    followUpStatus?: Parameters<typeof getFollowUpStatusLabel>[0] | null;
    followUpNextActionAt?: string | null;
    followUpNote?: string | null;
  };
  hrefLabel: string;
  variant: "upcoming" | "followup";
};

export function AnalyticsActionCard({ booking, hrefLabel, variant }: AnalyticsActionCardProps) {
  return (
    <div className="surface-card rounded-[24px] p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{booking.customerName}</p>
            <StatusBadge status={booking.status} />
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {booking.serviceName}
            {variant === "upcoming" ? ` • ${formatLongDate(booking.date)} • ${booking.time}` : ""}
          </p>
          {variant === "upcoming" ? (
            <p className="mt-2 text-sm text-[var(--primary)]">{formatCurrency(booking.totalPrice ?? 0)}</p>
          ) : (
            <>
              <p className="mt-2 text-sm text-[var(--foreground)]">{getFollowUpStatusLabel(booking.followUpStatus ?? "none")}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Next action: {formatDateTimeLabel(booking.followUpNextActionAt)}</p>
              {booking.followUpNote ? <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{booking.followUpNote}</p> : null}
            </>
          )}
        </div>
        <Link href={`/bookings/${booking.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)]">
          {hrefLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
