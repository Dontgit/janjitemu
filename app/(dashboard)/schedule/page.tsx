import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getOwnerBusiness, getSchedulePageData } from "@/lib/data";
import { formatLongDate } from "@/lib/utils";

export default async function SchedulePage() {
  const [business, { bookingsByDate, hours, stats }] = await Promise.all([
    getOwnerBusiness(),
    getSchedulePageData()
  ]);

  const dates = Object.keys(bookingsByDate).sort();

  return (
    <DashboardShell activePath="/schedule" bookingLink={business.bookingLink}>
      <div className="space-y-6">
        <Card className="p-6 sm:p-8">
          <PageHeader
            eyebrow="Schedule"
            title="Kalender operasional mingguan"
            description="Ringkasan booking per tanggal dan jam operasional agar owner cepat melihat slot padat, hari kosong, dan kebutuhan reschedule."
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] bg-white p-4">
              <p className="text-sm text-[var(--muted)]">Tanggal terisi</p>
              <p className="mt-2 text-2xl font-semibold">{stats.totalDates}</p>
            </div>
            <div className="rounded-[24px] bg-white p-4">
              <p className="text-sm text-[var(--muted)]">Total booking</p>
              <p className="mt-2 text-2xl font-semibold">{stats.totalBookings}</p>
            </div>
            <div className="rounded-[24px] bg-white p-4">
              <p className="text-sm text-[var(--muted)]">Layanan aktif</p>
              <p className="mt-2 text-2xl font-semibold">{stats.activeServices}</p>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <Card className="p-6">
            <p className="text-lg font-semibold">Jam operasional</p>
            <div className="mt-5 space-y-3">
              {hours.map((hour) => (
                <div key={hour.day} className="rounded-[22px] border border-[var(--border)] bg-white px-4 py-3">
                  <p className="font-medium">{hour.day}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {hour.active ? `${hour.open} - ${hour.close}` : "Tutup"}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-4">
            {dates.length === 0 ? (
              <EmptyState
                title="Belum ada booking"
                description="Tambahkan booking dari dashboard atau gunakan link booking publik untuk mulai mengisi kalender."
              />
            ) : null}
            {dates.map((date) => (
              <Card key={date} className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{formatLongDate(date)}</p>
                    <p className="text-sm text-[var(--muted)]">{date}</p>
                  </div>
                  <p className="text-sm text-[var(--muted)]">{bookingsByDate[date].length} booking</p>
                </div>
                <div className="mt-5 space-y-3">
                  {bookingsByDate[date].map((booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-col gap-3 rounded-[22px] border border-[var(--border)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{booking.customerName}</p>
                          <StatusBadge status={booking.status} />
                        </div>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {booking.time} • {booking.serviceName}
                        </p>
                      </div>
                      <p className="text-sm text-[var(--muted)]">{booking.phone}</p>
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
