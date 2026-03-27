import Link from "next/link";
import { BellRing, CalendarCheck, ClockArrowUp, Users, ArrowRight, Sparkles } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageTutorial } from "@/components/ui/page-tutorial";
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
      <PageTutorial
        pageKey="dashboard"
        pageTitle="Dashboard"
        steps={[
          {
            title: "Mulai dari ringkasan utama",
            description: "Panel overview adalah titik start untuk membaca kondisi bisnis: metrik utama di kiri dan agenda hari ini di kanan, jadi owner langsung tahu apa yang perlu diprioritaskan.",
            tip: "Kalau baru login, cek agenda hari ini lalu lanjut ke tombol Kelola booking.",
            targetSelector: '[data-tutorial="dashboard-overview"]',
            targetLabel: "Overview & agenda"
          },
          {
            title: "Gunakan quick actions & health panel",
            description: "Bagian ini dipakai untuk scanning cepat: sinyal booking pending, jadwal padat, customer aktif, dan highlight performa ringan tanpa harus buka halaman detail dulu.",
            tip: "Ideal untuk review pagi atau sebelum follow up sore.",
            targetSelector: '[data-tutorial="dashboard-health"]',
            targetLabel: "Quick actions"
          },
          {
            title: "Lompat ke eksekusi yang relevan",
            description: "Daftar booking terbaru membantu Anda pindah dari mode monitoring ke aksi: buka detail booking, cek customer aktif, atau lanjut ke halaman booking untuk update status.",
            tip: "Gunakan ini sebagai shortcut ke pekerjaan yang paling dekat jadwalnya.",
            targetSelector: '[data-tutorial="dashboard-recent-bookings"]',
            targetLabel: "Booking terbaru"
          }
        ]}
      />
      <div className="space-y-6 xl:space-y-7">
        <Card data-tutorial="dashboard-overview" className="premium-panel overflow-hidden p-6 sm:p-8 xl:p-10">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)] shadow-[0_8px_20px_rgba(20,49,44,0.05)]">
                <Sparkles className="h-3.5 w-3.5" />
                Workspace overview
              </div>
              <PageHeader
                eyebrow="Overview"
                title={`Ringkasan operasional ${business.name}`}
                description="Fokus pada apa yang perlu ditindak sekarang: booking hari ini, status yang masih pending, serta metrik ringan yang bantu owner mengambil keputusan cepat."
                actions={
                  <>
                    <Link href="/bookings" className={buttonVariants("primary")}>
                      Kelola booking
                    </Link>
                    <Link href="/follow-ups" className={buttonVariants("secondary")}>
                      Follow-up board
                    </Link>
                    <Link href={`/book/${business.slug ?? "temujanji-studio"}`} className={buttonVariants("secondary")}>
                      Lihat booking page
                    </Link>
                  </>
                }
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                {stats.map((stat) => (
                  <StatCard key={stat.label} {...stat} />
                ))}
              </div>
            </div>

            <div className="rounded-[30px] bg-[#14312c] p-6 text-white shadow-[0_24px_55px_rgba(20,49,44,0.22)] xl:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-white/60">Agenda hari ini</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">{timeline.length} aktivitas utama</p>
                </div>
                <span className="rounded-2xl bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
                  Live
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {timeline.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-white/15 bg-white/5 p-5 text-sm text-white/70">
                    Belum ada agenda nyata hari ini. Saat booking hari ini masuk, daftar aktivitas akan muncul di sini.
                  </div>
                ) : (
                  timeline.map((item) => (
                    <div key={`${item.time}-${item.title}`} className="rounded-[24px] border border-white/8 bg-white/10 p-4 backdrop-blur-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold">{item.title}</p>
                          <p className="mt-1 text-sm text-white/70">{item.meta}</p>
                        </div>
                        <div className="rounded-full bg-white/10 px-3 py-1 text-sm">{item.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-[20px] border border-white/8 bg-white/10 p-4">
                  <p className="text-white/60">Total booking</p>
                  <p className="mt-2 text-2xl font-semibold">{bookingSummary.total}</p>
                </div>
                <div className="rounded-[20px] border border-white/8 bg-white/10 p-4">
                  <p className="text-white/60">Upcoming</p>
                  <p className="mt-2 text-2xl font-semibold">{bookingSummary.upcoming}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <Card data-tutorial="dashboard-health" className="p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-lg font-semibold">Quick actions & business health</p>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">
                Ready now
              </span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {quickPanels.map(({ icon: Icon, title, detail }) => (
                <div key={title} className="surface-card rounded-[24px] p-4">
                  <div className="icon-chip">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 font-semibold">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {highlights.map((item) => (
                <div key={item.label} className="rounded-[24px] border border-teal-100/80 bg-teal-50/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                  <p className="text-sm text-[var(--muted)]">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">{item.value}</p>
                  <p className="mt-2 text-sm text-[var(--primary)]">{item.detail}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card data-tutorial="dashboard-recent-bookings" className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">Booking terbaru</p>
                <p className="mt-1 text-sm text-[var(--muted)]">Prioritaskan yang masih pending dan paling dekat jadwalnya.</p>
              </div>
              <p className="text-sm font-medium text-[var(--muted)]">{bookings.length} booking</p>
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
                    className="surface-card rounded-[24px] p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{booking.customerName}</p>
                          <StatusBadge status={booking.status} />
                        </div>
                        <p className="mt-2 text-sm text-[var(--muted)]">
                          {booking.serviceName} • {booking.date} • {booking.time}{booking.assignedStaffName ? ` • ${booking.assignedStaffName}` : ""}
                        </p>
                        {booking.notes ? (
                          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{booking.notes}</p>
                        ) : null}
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
      </div>
    </DashboardShell>
  );
}
