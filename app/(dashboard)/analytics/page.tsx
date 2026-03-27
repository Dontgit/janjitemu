import Link from "next/link";
import { CalendarClock, ChartColumnIncreasing, CircleAlert, CircleCheckBig, Gem, Zap } from "lucide-react";
import { AnalyticsActionCard } from "@/components/analytics/analytics-action-card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageTutorial } from "@/components/ui/page-tutorial";
import { getAnalyticsPageData, getOwnerBusiness } from "@/lib/data";
import { formatCurrency, formatLongDate } from "@/lib/utils";

const toneStyles = {
  good: "border-emerald-200/80 bg-emerald-50/80 text-emerald-800",
  warning: "border-amber-200/80 bg-amber-50/90 text-amber-900",
  neutral: "border-slate-200/80 bg-slate-50/85 text-slate-800"
} as const;

export default async function AnalyticsPage() {
  const [business, analytics] = await Promise.all([getOwnerBusiness(), getAnalyticsPageData()]);

  return (
    <DashboardShell activePath="/analytics" bookingLink={business.bookingLink}>
      <PageTutorial
        pageKey="analytics"
        pageTitle="Analytics"
        steps={[
          {
            title: "Mulai dari snapshot performa inti",
            description: "Halaman analytics sekarang lebih ringkas supaya owner bisa baca metrik penting dulu tanpa tenggelam di terlalu banyak panel besar.",
            tip: "Cek summary dan 7 hari ke depan dulu, baru lanjut ke layanan atau follow-up terdekat.",
            targetSelector: '[data-tutorial="analytics-overview"]',
            targetLabel: "Snapshot performa"
          },
          {
            title: "Fokus ke layanan, status, dan insight yang benar-benar relevan",
            description: "Section tengah dibuat lebih seimbang agar tetap nyaman dipakai di mobile dan desktop tanpa banyak ruang berlebihan.",
            tip: "Prioritaskan layanan dengan revenue besar dan status booking yang pending terlalu tinggi.",
            targetSelector: '[data-tutorial="analytics-performance"]',
            targetLabel: "Performa inti"
          },
          {
            title: "Tutup dengan action yang dekat",
            description: "Booking mendatang dan follow-up due dipertahankan sebagai shortcut eksekusi setelah membaca angka-angka utama.",
            tip: "Anggap bagian bawah ini sebagai daftar tindakan sesudah review cepat analytics.",
            targetSelector: '[data-tutorial="analytics-actions"]',
            targetLabel: "Action dekat"
          }
        ]}
      />

      <div className="space-y-5 xl:space-y-6">
        <Card data-tutorial="analytics-overview" className="premium-panel p-5 sm:p-6 xl:p-8">
          <div className="space-y-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)] shadow-[0_8px_20px_rgba(20,49,44,0.05)]">
                  <ChartColumnIncreasing className="h-3.5 w-3.5" />
                  Analytics
                </div>
                <PageHeader
                  className="mt-4"
                  eyebrow="Performance"
                  title={`Baca performa ${business.name} lebih cepat`}
                  description="Fokus ke angka yang langsung berguna untuk owner: revenue, booking, status penting, layanan terkuat, dan action yang paling dekat."
                  actions={
                    <>
                      <Link href="/bookings" className={buttonVariants("primary")}>
                        Kelola booking
                      </Link>
                      <Link href="/services" className={buttonVariants("secondary")}>
                        Kelola layanan
                      </Link>
                    </>
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:min-w-[380px] xl:max-w-[520px] xl:flex-1">
                {analytics.summary.map((item) => (
                  <div key={item.label} className="surface-card rounded-[22px] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-[var(--muted)]">{item.label}</p>
                      <span className="icon-chip h-9 w-9 rounded-[14px]">
                        <Zap className="h-4 w-4" />
                      </span>
                    </div>
                    <p className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">{item.value}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--primary)]">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.04fr_0.96fr]">
              <div className="surface-card rounded-[24px] p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">7 hari ke depan</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">{analytics.nextSevenDays.totalBookings} booking terjadwal</p>
                    <p className="mt-2 text-sm text-[var(--muted)]">Forecast singkat untuk ritme booking dan follow-up dalam waktu dekat.</p>
                  </div>
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
                    Near-term
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-[20px] bg-white px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                    <p className="text-[var(--muted)]">Revenue forecast</p>
                    <p className="mt-2 text-xl font-semibold">{formatCurrency(analytics.nextSevenDays.totalRevenue)}</p>
                  </div>
                  <div className="rounded-[20px] bg-white px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                    <p className="text-[var(--muted)]">Follow-up due</p>
                    <p className="mt-2 text-xl font-semibold">{analytics.dueFollowUps.length}</p>
                  </div>
                </div>
              </div>

              <div className="surface-card rounded-[24px] p-4 sm:p-5">
                <p className="text-sm font-semibold">Hari paling padat</p>
                <p className="mt-1 text-sm text-[var(--muted)]">Hari dengan booking tertinggi supaya owner lebih cepat lihat pressure operasional.</p>
                <div className="mt-4 space-y-3">
                  {analytics.nextSevenDays.busyDays.length === 0 ? (
                    <EmptyState
                      className="px-4 py-6"
                      title="Belum ada hari padat"
                      description="Saat booking upcoming bertambah, daftar hari paling sibuk akan muncul di sini."
                    />
                  ) : (
                    analytics.nextSevenDays.busyDays.map((item) => (
                      <div key={item.date} className="rounded-[20px] border border-[var(--border)] bg-white px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold">{formatLongDate(item.date)}</p>
                            <p className="mt-1 text-sm text-[var(--muted)]">{item.count} booking terjadwal</p>
                          </div>
                          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">#{item.count}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div data-tutorial="analytics-performance" className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <div className="space-y-5">
            <Card className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">Status booking</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">Distribusi status untuk membaca kesehatan funnel operasional.</p>
                </div>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">
                  Funnel
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                {analytics.statusBreakdown.map((item) => (
                  <div key={item.status} className="surface-card rounded-[22px] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-[var(--muted)]">{item.label}</p>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="mt-3 text-2xl font-semibold tracking-tight">{item.count}</p>
                    <p className="mt-2 text-sm text-[var(--primary)]">{item.share}% dari total booking</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">Performa layanan</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">Urut berdasarkan revenue agar layanan utama cepat terlihat.</p>
                </div>
                <Link href="/services" className="text-sm font-semibold text-[var(--primary)]">
                  Kelola layanan
                </Link>
              </div>
              {analytics.servicePerformance.length === 0 ? (
                <EmptyState
                  className="mt-5"
                  title="Belum ada data layanan"
                  description="Saat layanan mulai dibooking, performanya akan muncul di sini."
                  action={<Link href="/services" className={buttonVariants("primary")}>Buka layanan</Link>}
                />
              ) : (
                <div className="mt-4 space-y-3">
                  {analytics.servicePerformance.map((service, index) => (
                    <div key={service.id} className="surface-card rounded-[22px] p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-teal-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--primary)]">
                              #{index + 1}
                            </span>
                            <p className="font-semibold">{service.name}</p>
                          </div>
                          <div className="mt-3 grid gap-3 sm:grid-cols-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Revenue</p>
                              <p className="mt-1 text-lg font-semibold">{formatCurrency(service.revenue)}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Booking</p>
                              <p className="mt-1 text-lg font-semibold">{service.bookings}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Completed</p>
                              <p className="mt-1 text-lg font-semibold">{service.completed}</p>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 lg:min-w-[220px]">
                          <div className="rounded-[18px] border border-teal-100/80 bg-teal-50/70 p-3">
                            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Completion</p>
                            <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">{service.completionRate}%</p>
                          </div>
                          <div className="rounded-[18px] border border-violet-100/80 bg-violet-50/80 p-3">
                            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Attach add-on</p>
                            <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">{service.addonAttachRate}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">Peluang upsell add-on</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">Add-on yang benar-benar dipakai customer.</p>
                </div>
                <Gem className="h-5 w-5 text-[var(--primary)]" />
              </div>
              {analytics.addonPerformance.length === 0 ? (
                <EmptyState
                  className="mt-5"
                  title="Belum ada add-on yang terpasang"
                  description="Begitu add-on dipilih customer, attach count dan revenue-nya akan tampil di sini."
                  action={<Link href="/services" className={buttonVariants("secondary")}>Atur add-on</Link>}
                />
              ) : (
                <div className="mt-4 space-y-3">
                  {analytics.addonPerformance.map((addon) => (
                    <div key={addon.id} className="surface-card rounded-[22px] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold">{addon.name}</p>
                          <p className="mt-2 text-sm text-[var(--muted)]">Dipasang {addon.attachCount} kali • tambahan durasi {addon.totalDuration} menit</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Revenue</p>
                          <p className="mt-2 text-lg font-semibold">{formatCurrency(addon.revenue)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">Insight operasional</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">Sinyal ringan yang bisa langsung dipakai untuk keputusan cepat.</p>
                </div>
                <CircleAlert className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div className="mt-4 space-y-3">
                {analytics.operationalInsights.map((item) => (
                  <div key={item.title} className={`rounded-[22px] border p-4 ${toneStyles[item.tone]}`}>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 rounded-full bg-white/70 p-2">
                        {item.tone === "warning" ? <CircleAlert className="h-4 w-4" /> : <CircleCheckBig className="h-4 w-4" />}
                      </span>
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="mt-2 text-sm leading-6 opacity-90">{item.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div data-tutorial="analytics-actions" className="grid gap-5 xl:grid-cols-2">
          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">Booking mendatang</p>
                <p className="mt-1 text-sm text-[var(--muted)]">Shortcut ke slot terdekat yang akan segera dikerjakan.</p>
              </div>
              <CalendarClock className="h-5 w-5 text-[var(--primary)]" />
            </div>
            {analytics.upcomingBookings.length === 0 ? (
              <EmptyState
                className="mt-5"
                title="Belum ada booking upcoming"
                description="Booking yang akan datang akan muncul di sini untuk dipantau lebih cepat."
                action={<Link href="/bookings" className={buttonVariants("primary")}>Buka bookings</Link>}
              />
            ) : (
              <div className="mt-4 space-y-3">
                {analytics.upcomingBookings.map((booking) => (
                  <AnalyticsActionCard key={booking.id} booking={booking} hrefLabel="Detail" variant="upcoming" />
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">Follow-up due soon</p>
                <p className="mt-1 text-sm text-[var(--muted)]">Biar owner bisa pindah dari insight ke eksekusi tanpa konteks hilang.</p>
              </div>
              <Link href="/follow-ups" className="text-sm font-semibold text-[var(--primary)]">
                Buka board
              </Link>
            </div>
            {analytics.dueFollowUps.length === 0 ? (
              <EmptyState
                className="mt-5"
                title="Belum ada follow-up mendekat"
                description="Item follow-up dengan next action terdekat akan muncul otomatis di sini."
                action={<Link href="/follow-ups" className={buttonVariants("secondary")}>Kelola follow-up</Link>}
              />
            ) : (
              <div className="mt-4 space-y-3">
                {analytics.dueFollowUps.map((booking) => (
                  <AnalyticsActionCard key={booking.id} booking={booking} hrefLabel="Tindak lanjuti" variant="followup" />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
