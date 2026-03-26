import Link from "next/link";
import { BellRing, CalendarCheck, ClockArrowUp, Users } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { buttonVariants } from "@/components/ui/button";
import { getDashboardPageData } from "@/lib/data";

const quickPanels = [
  {
    icon: CalendarCheck,
    title: "Booking confirmed",
    detail: "Pantau slot yang sudah aman untuk hari ini dan follow up yang sudah selesai."
  },
  {
    icon: BellRing,
    title: "Perlu follow up",
    detail: "Booking pending dan reminder internal untuk dikonfirmasi lebih cepat."
  },
  {
    icon: ClockArrowUp,
    title: "Jadwal padat",
    detail: "Lihat tanggal yang sudah penuh agar buffer dan reschedule lebih rapi."
  },
  {
    icon: Users,
    title: "Customer aktif",
    detail: "Temukan repeat customer yang layak ditawari slot berikutnya."
  }
];

export default async function DashboardPage() {
  const { business, stats, timeline, bookings, highlights, bookingSummary } = await getDashboardPageData();

  return (
    <DashboardShell activePath="/dashboard" bookingLink={business.bookingLink}>
      <div className="space-y-6">
        <Card className="overflow-hidden p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div>
              <PageHeader
                eyebrow="Overview"
                title={`Ringkasan operasional ${business.name}`}
                description="Fokus pada apa yang perlu ditindak sekarang: booking hari ini, status yang masih pending, serta metrik ringan yang bantu owner mengambil keputusan cepat."
                actions={
                  <>
                    <Link href="/bookings" className={buttonVariants("primary")}>
                      Kelola booking
                    </Link>
                    <Link href={`/book/${business.slug ?? "temujanji-studio"}`} className={buttonVariants("secondary")}>
                      Lihat booking page
                    </Link>
                  </>
                }
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <StatCard key={stat.label} {...stat} />
                ))}
              </div>
            </div>

            <div className="rounded-[30px] bg-[#14312c] p-6 text-white">
              <p className="text-sm uppercase tracking-[0.18em] text-white/60">Agenda hari ini</p>
              <div className="mt-6 space-y-4">
                {timeline.map((item) => (
                  <div key={`${item.time}-${item.title}`} className="rounded-[24px] bg-white/10 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="mt-1 text-sm text-white/70">{item.meta}</p>
                      </div>
                      <div className="rounded-full bg-white/10 px-3 py-1 text-sm">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-[20px] bg-white/10 p-4">
                  <p className="text-white/60">Total booking</p>
                  <p className="mt-2 text-2xl font-semibold">{bookingSummary.total}</p>
                </div>
                <div className="rounded-[20px] bg-white/10 p-4">
                  <p className="text-white/60">Upcoming</p>
                  <p className="mt-2 text-2xl font-semibold">{bookingSummary.upcoming}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="p-6">
            <p className="text-lg font-semibold">Quick actions & business health</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {quickPanels.map(({ icon: Icon, title, detail }) => (
                <div key={title} className="rounded-[24px] border border-[var(--border)] bg-white p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-[var(--primary)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 font-semibold">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {highlights.map((item) => (
                <div key={item.label} className="rounded-[24px] bg-teal-50/70 p-4">
                  <p className="text-sm text-[var(--muted)]">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                  <p className="mt-2 text-sm text-[var(--primary)]">{item.detail}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">Booking terbaru</p>
              <p className="text-sm text-[var(--muted)]">{bookings.length} booking</p>
            </div>
            {bookings.length === 0 ? (
              <EmptyState
                className="mt-5"
                title="Belum ada booking masuk"
                description="Coba tambahkan booking manual atau bagikan booking link publik ke customer pertama Anda."
                action={<Link href="/bookings" className={buttonVariants("primary")}>Tambah booking</Link>}
              />
            ) : (
              <div className="mt-5 space-y-4">
                {bookings.slice(0, 6).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col gap-4 rounded-[24px] border border-[var(--border)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{booking.customerName}</p>
                        <StatusBadge status={booking.status} />
                      </div>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        {booking.serviceName} • {booking.date} • {booking.time}
                      </p>
                      {booking.notes ? (
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{booking.notes}</p>
                      ) : null}
                    </div>
                    <p className="text-sm text-[var(--muted)]">{booking.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
