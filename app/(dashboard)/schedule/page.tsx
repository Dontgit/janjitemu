import Link from "next/link";
import { CalendarDays, Clock3, Layers3, Sparkles } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageTutorial } from "@/components/ui/page-tutorial";
import { getOwnerBusiness, getSchedulePageData } from "@/lib/data";
import { formatLongDate } from "@/lib/utils";

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
            title: "Baca planner mingguan dari atas ke bawah",
            description: "Panel atas adalah ringkasan minggu berjalan: jumlah hari terisi, total booking, dan snapshot ritme operasional supaya beban kerja cepat terbaca.",
            tip: "Kalau hari terjadwal mulai padat, cek detail tanggal yang perlu buffer.",
            targetSelector: '[data-tutorial="schedule-overview"]',
            targetLabel: "Planner overview"
          },
          {
            title: "Cocokkan jam operasional dengan booking aktif",
            description: "Kolom ini dipakai untuk memastikan jam buka-tutup sudah sinkron dengan slot publik yang seharusnya tersedia.",
            tip: "Kalau ada mismatch, perbaiki dari Pengaturan lalu cek lagi di sini.",
            targetSelector: '[data-tutorial="schedule-hours"]',
            targetLabel: "Jam operasional"
          },
          {
            title: "Lihat detail per tanggal untuk spotting konflik",
            description: "Kartu tanggal menampilkan customer, status, jam, dan layanan. Area ini cocok untuk mencari hari penuh atau booking yang butuh perhatian cepat.",
            tip: "Kalau perlu aksi, lanjut ke halaman Bookings untuk update detailnya.",
            targetSelector: '[data-tutorial="schedule-days"]',
            targetLabel: "Detail per tanggal"
          }
        ]}
      />
      <div className="space-y-6 xl:space-y-7">
        <Card data-tutorial="schedule-overview" className="premium-panel overflow-hidden p-6 sm:p-8 xl:p-10">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
            <div>
              <span className="section-label">
                <CalendarDays className="h-4 w-4" />
                Weekly planner
              </span>
              <PageHeader
                className="mt-4"
                eyebrow="Schedule"
                title="Kalender operasional mingguan"
                description="Ringkasan booking per tanggal dan jam operasional agar owner cepat melihat slot padat, hari kosong, dan kebutuhan reschedule dengan tampilan yang terasa setara premium di seluruh dashboard."
                actions={
                  <>
                    <Link href="/bookings" className={buttonVariants("secondary")}>Kelola bookings</Link>
                    <Link href="/reminders" className={buttonVariants("secondary")}>Reminder center</Link>
                  </>
                }
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="soft-stat rounded-[24px] p-4">
                  <p className="text-sm text-[var(--muted)]">Tanggal terisi</p>
                  <p className="mt-2 text-2xl font-semibold">{stats.totalDates}</p>
                </div>
                <div className="soft-stat rounded-[24px] p-4">
                  <p className="text-sm text-[var(--muted)]">Total booking</p>
                  <p className="mt-2 text-2xl font-semibold">{stats.totalBookings}</p>
                </div>
                <div className="soft-stat rounded-[24px] p-4">
                  <p className="text-sm text-[var(--muted)]">Layanan aktif</p>
                  <p className="mt-2 text-2xl font-semibold">{stats.activeServices}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] bg-[#14312c] p-6 text-white shadow-[0_24px_55px_rgba(20,49,44,0.22)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-white/60">Jadwal minggu ini</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">{dates.length} hari terjadwal</p>
                </div>
                <span className="rounded-2xl bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
                  Planner
                </span>
              </div>
              <div className="mt-6 grid gap-3">
                {hours.slice(0, 4).map((hour) => (
                  <div key={hour.day} className="rounded-[22px] border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{hour.day}</p>
                      <p className="text-sm text-white/72">{hour.active ? `${hour.open} - ${hour.close}` : "Tutup"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 2xl:grid-cols-[340px_minmax(0,1fr)]">
          <Card data-tutorial="schedule-hours" className="p-6">
            <div className="flex items-start gap-4">
              <span className="icon-chip">
                <Clock3 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-semibold">Jam operasional</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Ringkasan hari aktif dan jam buka untuk memastikan booking publik dan jadwal internal tetap sinkron.</p>
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
              <Card key={date} className="p-6">
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
                    <p className="mt-1 text-lg font-semibold">{bookingsByDate[date].length}</p>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {bookingsByDate[date].map((booking) => (
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
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
