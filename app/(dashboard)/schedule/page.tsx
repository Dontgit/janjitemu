import Link from "next/link";
import { CalendarDays, Clock3 } from "lucide-react";
import { ScheduleDayCard } from "@/components/schedule/schedule-day-card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageTutorial } from "@/components/ui/page-tutorial";
import { getOwnerBusiness, getSchedulePageData } from "@/lib/data";

export default async function SchedulePage() {
  const [business, { bookingsByDate, hours, stats }] = await Promise.all([getOwnerBusiness(), getSchedulePageData()]);

  const dates = Object.keys(bookingsByDate).sort();

  return (
    <DashboardShell activePath="/schedule" bookingLink={business.bookingLink}>
      <PageTutorial
        pageKey="schedule"
        pageTitle="Jadwal"
        steps={[
          {
            title: "Mulai dari ringkasan planner",
            description: "Planner overview sekarang lebih ringkas agar owner cepat membaca total booking, tanggal terisi, dan ritme operasional minggu ini.",
            tip: "Kalau hari terjadwal mulai padat, lanjut ke detail tanggal yang paling ramai dulu.",
            targetSelector: '[data-tutorial="schedule-overview"]',
            targetLabel: "Planner overview"
          },
          {
            title: "Cek jam operasional tanpa panel berlebihan",
            description: "Bagian jam operasional dibuat lebih ringan supaya sinkronisasi dengan slot booking tetap mudah dicek di layar kecil.",
            tip: "Kalau ada mismatch, perbaiki dari Pengaturan lalu kembali cek di sini."
,            targetSelector: '[data-tutorial="schedule-hours"]',
            targetLabel: "Jam operasional"
          },
          {
            title: "Lihat detail tanggal sebagai area kerja utama",
            description: "Daftar tanggal tetap jadi fokus utama supaya spotting konflik dan hari padat lebih cepat dilakukan.",
            tip: "Kalau perlu aksi, lanjut ke Bookings untuk update detail booking terkait.",
            targetSelector: '[data-tutorial="schedule-days"]',
            targetLabel: "Detail per tanggal"
          }
        ]}
      />

      <div className="space-y-5 xl:space-y-6">
        <Card data-tutorial="schedule-overview" className="premium-panel p-5 sm:p-6 xl:p-8">
          <div className="space-y-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <span className="section-label">
                  <CalendarDays className="h-4 w-4" />
                  Weekly planner
                </span>
                <PageHeader
                  className="mt-4"
                  eyebrow="Schedule"
                  title="Kalender operasional mingguan"
                  description="Lihat ringkasan booking per tanggal dan jam operasional tanpa layout yang terlalu berat di mobile maupun desktop."
                  actions={
                    <>
                      <Link href="/bookings" className={buttonVariants("secondary")}>
                        Kelola bookings
                      </Link>
                      <Link href="/reminders" className={buttonVariants("secondary")}>
                        Reminder center
                      </Link>
                    </>
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:min-w-[360px] xl:max-w-[460px] xl:flex-1">
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Tanggal terisi</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{stats.totalDates}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Total booking</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{stats.totalBookings}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4 sm:col-span-1 col-span-2">
                  <p className="text-sm text-[var(--muted)]">Layanan aktif</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{stats.activeServices}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <Card data-tutorial="schedule-hours" className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="icon-chip">
                <Clock3 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-semibold">Jam operasional</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Ringkasan hari aktif dan jam buka untuk memastikan slot publik dan jadwal internal tetap sinkron.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {hours.map((hour) => (
                <div key={hour.day} className="surface-card rounded-[22px] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{hour.day}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{hour.active ? `${hour.open} - ${hour.close}` : "Tutup"}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${hour.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {hour.active ? "Aktif" : "Libur"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div data-tutorial="schedule-days" className="space-y-4">
            {dates.length === 0 ? (
              <EmptyState
                title="Belum ada booking"
                description="Tambahkan booking dari dashboard atau gunakan link booking publik untuk mulai mengisi kalender."
              />
            ) : null}
            {dates.map((date) => (
              <ScheduleDayCard key={date} date={date} bookings={bookingsByDate[date]} />
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
