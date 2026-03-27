import Link from "next/link";
import { BellRing, CalendarClock, ListTodo, Sparkles } from "lucide-react";
import { FollowUpForm } from "@/components/booking/follow-up-form";
import { FollowUpBadge, StatusBadge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, formatDateTimeLabel } from "@/lib/utils";

const priorityStyles = {
  high: "bg-rose-100 text-rose-700 border-rose-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-emerald-100 text-emerald-700 border-emerald-200"
} as const;

const priorityLabels = {
  high: "Prioritas tinggi",
  medium: "Prioritas menengah",
  low: "Prioritas ringan"
} as const;

type ReminderItem = {
  type: "follow-up" | "appointment";
  priority: keyof typeof priorityStyles;
  title: string;
  detail: string;
  dueAt: string;
  booking: Parameters<typeof FollowUpForm>[0]["booking"];
};

export function ReminderCard({ item, redirectTo }: { item: ReminderItem; redirectTo: string }) {
  return (
    <Card className="p-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.08em]", priorityStyles[item.priority])}>
              {priorityLabels[item.priority]}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-slate-600">
              {item.type === "follow-up" ? "Follow up" : "Booking terdekat"}
            </span>
            <StatusBadge status={item.booking.status} />
            <FollowUpBadge status={item.booking.followUpStatus ?? "none"} />
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-lg font-semibold">{item.title}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{item.detail}</p>
            </div>
            <div className="rounded-[20px] border border-[var(--border)] bg-white/80 px-4 py-3 text-sm">
              <p className="text-[var(--muted)]">Jatuh tempo</p>
              <p className="mt-1 font-semibold">{formatDateTimeLabel(item.dueAt)}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="surface-card rounded-[22px] p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                <p className="text-sm text-[var(--muted)]">Customer</p>
              </div>
              <p className="mt-2 font-semibold">{item.booking.customerName}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{item.booking.phone}</p>
            </div>
            <div className="surface-card rounded-[22px] p-4">
              <div className="flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-[var(--primary)]" />
                <p className="text-sm text-[var(--muted)]">Layanan</p>
              </div>
              <p className="mt-2 font-semibold">{item.booking.serviceName}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Status follow up: {item.booking.followUpStatus ?? "none"}</p>
            </div>
            <div className="surface-card rounded-[22px] p-4">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-[var(--primary)]" />
                <p className="text-sm text-[var(--muted)]">Jadwal booking</p>
              </div>
              <p className="mt-2 font-semibold">{item.booking.date}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{item.booking.time}{item.booking.endTime ? ` - ${item.booking.endTime}` : ""}</p>
            </div>
            <div className="surface-card rounded-[22px] p-4">
              <div className="flex items-center gap-2">
                <BellRing className="h-4 w-4 text-[var(--primary)]" />
                <p className="text-sm text-[var(--muted)]">Catatan aktif</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{item.booking.followUpNote || item.booking.notes || "Belum ada catatan tambahan."}</p>
            </div>
          </div>
        </div>

        <div className="surface-card rounded-[24px] p-4">
          <p className="text-sm font-semibold">Aksi cepat</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Update follow up langsung dari reminder center atau buka halaman detail untuk konteks penuh.</p>
          <div className="mt-4">
            <FollowUpForm booking={item.booking} redirectTo={redirectTo} compact submitLabel="Update reminder" />
          </div>
          <Link href={`/bookings/${item.booking.id}`} className={buttonVariants("ghost", "mt-4 w-full justify-center")}>
            Lihat detail booking
          </Link>
        </div>
      </div>
    </Card>
  );
}
