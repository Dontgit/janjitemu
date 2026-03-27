import Link from "next/link";
import { BriefcaseBusiness, CalendarClock, Gauge, Layers3, Users } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageTutorial } from "@/components/ui/page-tutorial";
import { getOwnerBusiness, getTeamCapacityPageData } from "@/lib/data";
import { formatDurationLabel, formatLongDate } from "@/lib/utils";

const capacityToneClasses: Record<string, string> = {
  available: "bg-sky-100 text-sky-700",
  light: "bg-emerald-100 text-emerald-700",
  balanced: "bg-amber-100 text-amber-700",
  busy: "bg-rose-100 text-rose-700",
  inactive: "bg-slate-100 text-slate-600"
};

const bookingStatusLabel: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  rescheduled: "Rescheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  "no-show": "No-show"
};

export default async function TeamCapacityPage() {
  const [business, pageData] = await Promise.all([getOwnerBusiness(), getTeamCapacityPageData()]);
  const { members, summary, focusDate } = pageData;

  return (
    <DashboardShell activePath="/team/capacity" bookingLink={business.bookingLink}>
      <PageTutorial
        pageKey="team-capacity"
        pageTitle="Staff Capacity"
        steps={[
          {
            title: "Baca sinyal kapasitas dulu",
            description: "Halaman kapasitas sekarang dibuat lebih ringkas supaya owner cepat membaca staff aktif, beban booking hari ini, dan kapasitas mingguan tanpa layout yang terlalu berat.",
            tip: "Kalau staff sibuk mulai menumpuk, lanjut ke kartu detail untuk cek siapa yang masih longgar."
,            targetSelector: '[data-tutorial="team-capacity-overview"]',
            targetLabel: "Overview kapasitas"
          },
          {
            title: "Fokus ke load per staff",
            description: "Kartu staff tetap jadi area kerja utama, tapi layout-nya dibuat lebih seimbang di mobile maupun desktop.",
            tip: "Cari status available atau light dulu sebelum assign booking baru.",
            targetSelector: '[data-tutorial="team-capacity-grid"]',
            targetLabel: "Roster kapasitas"
          }
        ]}
      />

      <div className="space-y-5 xl:space-y-6">
        <Card data-tutorial="team-capacity-overview" className="premium-panel p-5 sm:p-6 xl:p-8">
          <div className="space-y-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <span className="section-label">
                  <Gauge className="h-4 w-4" />
                  Staff capacity
                </span>
                <PageHeader
                  className="mt-4"
                  eyebrow="Team capacity"
                  title="Workload staff dekat-jatuh-tempo, tanpa planner yang ribet"
                  description="Lihat siapa yang aktif, siapa yang padat hari ini, dan siapa yang masih punya ruang untuk assignment berikutnya."
                  actions={
                    <>
                      <Link href="/team" className={buttonVariants("secondary")}>
                        Buka roster team
                      </Link>
                      <Link href="/team/schedule" className={buttonVariants("secondary")}>
                        Kelola weekly availability
                      </Link>
                    </>
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[420px] xl:max-w-[560px] xl:flex-1">
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Staff aktif</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{summary.activeMembers}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Assigned hari ini</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{summary.assignedToday}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Durasi hari ini</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{formatDurationLabel(summary.totalTodayMinutes)}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Kapasitas mingguan</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{summary.weeklyCapacityHours} jam</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="surface-card rounded-[22px] p-4">
                <p className="text-sm text-[var(--muted)]">Fokus tanggal</p>
                <p className="mt-2 font-semibold">{formatLongDate(focusDate)}</p>
              </div>
              <div className="surface-card rounded-[22px] p-4">
                <p className="text-sm text-[var(--muted)]">Masih longgar</p>
                <p className="mt-2 font-semibold">{summary.lightlyLoadedMembers} staff</p>
              </div>
              <div className="surface-card rounded-[22px] p-4">
                <p className="text-sm text-[var(--muted)]">Sudah padat</p>
                <p className="mt-2 font-semibold">{summary.busyMembers} staff</p>
              </div>
            </div>
          </div>
        </Card>

        {members.length === 0 ? (
          <EmptyState
            title="Belum ada staff"
            description="Tambahkan team member dulu supaya dashboard kapasitas ini punya data yang bisa dibaca owner."
            action={<Link href="/team" className={buttonVariants("primary")}>Tambah staff</Link>}
          />
        ) : (
          <div data-tutorial="team-capacity-grid" className="grid gap-4 2xl:grid-cols-2">
            {members.map((member) => (
              <Card key={member.id} className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xl font-semibold tracking-tight">{member.name}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${capacityToneClasses[member.capacityState]}`}>
                        {member.capacityLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--muted)]">{member.roleLabel}</p>
                  </div>
                  <div className="soft-stat rounded-[20px] px-4 py-3 text-sm sm:text-right">
                    <p className="text-[var(--muted)]">Utilisasi hari ini</p>
                    <p className="mt-1 text-lg font-semibold">{member.utilizationPercent !== null ? `${member.utilizationPercent}%` : "-"}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="surface-card rounded-[22px] p-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                      <CalendarClock className="h-4 w-4 text-[var(--primary)]" />
                      Booking hari ini
                    </div>
                    <p className="mt-2 text-2xl font-semibold">{member.bookingsToday}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{formatDurationLabel(member.todayBookings.reduce((sum, item) => sum + item.totalDuration, 0))}</p>
                  </div>
                  <div className="surface-card rounded-[22px] p-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                      <Layers3 className="h-4 w-4 text-[var(--primary)]" />
                      Upcoming 7 hari
                    </div>
                    <p className="mt-2 text-2xl font-semibold">{member.upcomingBookings}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{formatDurationLabel(member.totalAssignedMinutes)}</p>
                  </div>
                  <div className="surface-card rounded-[22px] p-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                      <Users className="h-4 w-4 text-[var(--primary)]" />
                      Availability
                    </div>
                    <p className="mt-2 font-semibold">{member.weeklyAvailabilityLabel}</p>
                  </div>
                  <div className="surface-card rounded-[22px] p-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                      <BriefcaseBusiness className="h-4 w-4 text-[var(--primary)]" />
                      Layanan
                    </div>
                    <p className="mt-2 font-semibold">{member.serviceNames.length}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">service ter-assign</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="field-card rounded-[24px] p-4">
                    <p className="text-sm font-semibold">Coverage & availability</p>
                    <div className="mt-3 space-y-3 text-sm leading-6 text-[var(--muted)]">
                      <p><span className="font-semibold text-[var(--foreground)]">Ringkasan:</span> {member.availabilitySummary || "Belum diisi"}</p>
                      <p><span className="font-semibold text-[var(--foreground)]">Hari kerja:</span> {member.workDaysSummary.length > 0 ? member.workDaysSummary.join(", ") : "Belum diatur"}</p>
                      <p><span className="font-semibold text-[var(--foreground)]">Services:</span> {member.assignedServicesSummary}</p>
                      <p><span className="font-semibold text-[var(--foreground)]">Kapasitas hari ini:</span> {member.todayAvailabilityMinutes > 0 ? formatDurationLabel(member.todayAvailabilityMinutes) : "Tidak ada jam kerja aktif"}</p>
                    </div>

                    <div className="mt-4 space-y-3">
                      <p className="text-sm font-semibold text-[var(--foreground)]">Booking hari ini</p>
                      {member.todayBookings.length === 0 ? (
                        <p className="text-sm leading-6 text-[var(--muted)]">Belum ada assignment untuk hari ini.</p>
                      ) : (
                        member.todayBookings.map((booking) => (
                          <div key={booking.id} className="surface-card rounded-[20px] p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold">{booking.customerName}</p>
                                <p className="mt-1 text-sm text-[var(--muted)]">{booking.serviceName}</p>
                              </div>
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                                {bookingStatusLabel[booking.status]}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-[var(--muted)]">{booking.time}{booking.endTime ? ` - ${booking.endTime}` : ""} • {formatDurationLabel(booking.totalDuration)}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="field-card rounded-[24px] p-4">
                    <p className="text-sm font-semibold">Booking berikutnya</p>
                    <div className="mt-3 space-y-3">
                      {member.nextBookings.length === 0 ? (
                        <p className="text-sm leading-6 text-[var(--muted)]">Belum ada booking assigned dalam 7 hari ke depan.</p>
                      ) : (
                        member.nextBookings.map((booking) => (
                          <div key={booking.id} className="surface-card rounded-[20px] p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold">{booking.customerName}</p>
                                <p className="mt-1 text-sm text-[var(--muted)]">{booking.serviceName}</p>
                              </div>
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                                {bookingStatusLabel[booking.status]}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-[var(--muted)]">{formatLongDate(booking.date)} • {booking.time}{booking.endTime ? ` - ${booking.endTime}` : ""} • {formatDurationLabel(booking.totalDuration)}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href="/team/schedule" className={buttonVariants("secondary")}>Update weekly availability</Link>
                  <Link href="/bookings" className={buttonVariants("ghost")}>Buka semua booking</Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
