import Link from "next/link";
import { ArrowRight, BellRing, CalendarCheck, ClockArrowUp, Sparkles, Users } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageTutorial } from "@/components/ui/page-tutorial";
import { StatCard } from "@/components/ui/stat-card";
import { getDashboardPageData } from "@/lib/data";

const quickPanels = [
  {
    icon: CalendarCheck,
    title: "Booking confirmed",
    detail: "Slot yang sudah aman dan siap dijalankan tanpa follow up tambahan."
  },
  {
    icon: BellRing,
    title: "Perlu follow up",
    detail: "Pending booking dan reminder internal yang sebaiknya diproses lebih dulu."
  },
  {
    icon: ClockArrowUp,
    title: "Jadwal padat",
    detail: "Hari dengan ritme booking tinggi supaya buffer dan reschedule lebih terkontrol."
  },
  {
    icon: Users,
    title: "Customer aktif",
    detail: "Repeat customer dan lead hangat yang layak diberi slot berikutnya."
  }
];

export default async function DashboardPage() {
  const { business, stats, timeline, bookings, highlights, bookingSummary } = await getDashboardPageData();
  const recentBookings = bookings.slice(0, 5);

  return (
    <DashboardShell activePath="/dashboard" bookingLink={business.bookingLink}>
      <PageTutorial
        pageKey="dashboard"
        pageTitle="Dashboard"
        steps={[
          {
            title: "Mulai dari ringkasan inti",
            description: "Area paling atas sekarang lebih ringkas: cukup baca metrik penting dan shortcut ke pekerjaan utama tanpa hero yang terlalu berat.",
            tip: "Kalau baru login, cek kartu stat lalu lompat ke Kelola booking atau Follow-up board.",
            targetSelector: '[data-tutorial="dashboard-overview"]',
            targetLabel: "Overview ringkas"
          },
          {
            title: "Gunakan panel fokus harian",
            description: "Agenda hari ini dan business health dipakai untuk memutuskan prioritas tercepat tanpa pindah banyak halaman.",
            tip: "Lihat mana yang urgent hari ini, lalu lanjut ke daftar booking terbaru di bawah.",
            targetSelector: '[data-tutorial="dashboard-health"]',
            targetLabel: "Fokus harian"
          },
          {
            title: "Eksekusi dari daftar booking terbaru",
            description: "Bagian bawah dashboard sekarang lebih ringkas supaya daftar booking terbaru lebih cepat dibaca di desktop maupun mobile.",
            tip: "Gunakan tombol Detail untuk pindah cepat ke booking yang perlu diproses sekarang.",
            targetSelector: '[data-tutorial="dashboard-recent-bookings"]',
            targetLabel: "Booking terbaru"
          }
        ]}
      />

      <div className="space-y-5 xl:space-y-6">
        <Card data-tutorial="dashboard-overview" className="premium-panel p-5 sm:p-6 xl:p-8">
          <div className="space-y-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)] shadow-[0_8px_20px_rgba(20,49,44,0.05)]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Overview
                </div>
                <PageHeader
                  className="mt-4"
                  eyebrow="Dashboard"
                  title={`Ringkasan ${business.name}`}
                  description="Lihat kondisi booking hari ini, status penting, dan shortcut ke area kerja utama tanpa layout yang terlalu padat."
                  actions={
                    <>
                      <Link href="/bookings" className={buttonVariants("primary")}>
                        Kelola booking
                      </Link>
                      <Link href="/follow-ups" className={buttonVariants("secondary")}>
                        Follow-up board
                      </Link>
                    </>
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:min-w-[360px] xl:max-w-[460px] xl:flex-1">
                <div className="surface-card rounded-[22px] p-4 text-sm">
                  <p className="text-[var(--muted)]">Total booking</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{bookingSummary.total}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4 text-sm">
                  <p className="text-[var(--muted)]">Upcoming</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{bookingSummary.upcoming}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4 text-sm">
                  <p className="text-[var(--muted)]">Hari ini</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{bookingSummary.today}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4 text-sm">
                  <p className="text-[var(--muted)]">Pending</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{bookingSummary.pending}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
              {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>
          </div>
        </Card>

        <div data-tutorial="dashboard-health" className="grid gap-5 xl:grid-cols-[0.96fr_1.04fr]">
          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">Fokus hari ini</p>
                <p className="mt-1 text-sm text-[var(--muted)]">Agenda yang paling dekat dengan tindakan owner hari ini.</p>
              </div>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">
                Today
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {timeline.length === 0 ? (
                <EmptyState
                  className="px-5 py-8"
                  title="Belum ada agenda hari ini"
                  description="Saat booking aktif muncul untuk hari ini, daftar prioritas akan tampil di sini."
                />
              ) : (
                timeline.map((item) => (
                  <div key={`${item.time}-${item.title}`} className="surface-card rounded-[22px] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold">{item.title}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">{item.meta}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                        {item.time}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">Business health</p>
                <p className="mt-1 text-sm text-[var(--muted)]">Sinyal cepat supaya owner tahu apa yang perlu dijaga hari ini.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                Quick scan
              </span>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {quickPanels.map(({ icon: Icon, title, detail }) => (
                <div key={title} className="surface-card rounded-[22px] p-4">
                  <div className="flex items-start gap-3">
                    <span className="icon-chip h-10 w-10 rounded-[14px]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-semibold">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {highlights.map((item) => (
                <div key={item.label} className="rounded-[22px] border border-teal-100/80 bg-teal-50/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                  <p className="text-sm text-[var(--muted)]">{item.label}</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--primary)]">{item.detail}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card data-tutorial="dashboard-recent-bookings" className="p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-lg font-semibold">Booking terbaru</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Daftar singkat booking yang paling dekat untuk diproses sekarang.</p>
            </div>
            <Link href="/bookings" className={buttonVariants("ghost")}>
              Lihat semua booking
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <EmptyState
              className="mt-5"
              title="Belum ada booking masuk"
              description="Coba tambahkan booking manual atau bagikan booking link publik ke customer pertama Anda."
              action={<Link href="/bookings" className={buttonVariants("primary")}>Tambah booking</Link>}
            />
          ) : (
            <div className="mt-5 grid gap-3">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="surface-card rounded-[22px] p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{booking.customerName}</p>
                        <StatusBadge status={booking.status} />
                      </div>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        {booking.serviceName} • {booking.date} • {booking.time}
                        {booking.assignedStaffName ? ` • ${booking.assignedStaffName}` : ""}
                      </p>
                      {booking.notes ? <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{booking.notes}</p> : null}
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                      <p className="text-sm text-[var(--muted)]">{booking.phone}</p>
                      <Link href={`/bookings/${booking.id}`} className="mt-0 inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] sm:mt-3">
                        Detail
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
