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
            title: "Mulai dari snapshot performa",
            description: "Empat metrik teratas membantu membaca volume booking, revenue, attach rate add-on, dan repeat customer tanpa buka halaman lain.",
            tip: "Ini cocok dipakai untuk review mingguan singkat atau saat ingin cek kesehatan funnel dengan cepat.",
            targetSelector: '[data-tutorial="analytics-overview"]',
            targetLabel: "Snapshot performa"
          },
          {
            title: "Baca status, layanan, dan add-on yang paling kuat",
            description: "Panel tengah merapikan distribusi status booking dan performa layanan supaya owner tahu area yang sehat, yang macet, dan peluang upsell yang nyata.",
            tip: "Prioritaskan status pending tinggi dan lihat layanan dengan attach rate add-on terbaik.",
            targetSelector: '[data-tutorial="analytics-performance"]',
            targetLabel: "Performa operasional"
          },
          {
            title: "Tutup dengan action near-term",
            description: "Panel kanan bawah berisi booking mendatang dan follow-up terdekat agar analytics tidak berhenti di insight, tapi langsung nyambung ke pekerjaan berikutnya.",
            tip: "Gunakan ini sebagai daftar eksekusi cepat setelah selesai membaca dashboard.",
            targetSelector: '[data-tutorial="analytics-actions"]',
            targetLabel: "Action dekat"
          }
        ]}
      />

      <div className="space-y-6 xl:space-y-7">
        <Card data-tutorial="analytics-overview" className="premium-panel overflow-hidden p-6 sm:p-8 xl:p-10">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)] shadow-[0_8px_20px_rgba(20,49,44,0.05)]">
                <ChartColumnIncreasing className="h-3.5 w-3.5" />
                Owner analytics
              </div>
              <PageHeader
                eyebrow="Analytics"
                title={`Baca performa ${business.name} tanpa ribet`}
                description="Dashboard v1 ini fokus ke metrik yang benar-benar berguna untuk owner: summary revenue dan booking, distribusi status, performa layanan/add-on, plus insight operasional yang dekat dengan aksi harian."
                actions={
                  <>
                    <Link href="/bookings" className={buttonVariants("primary")}>
                      Kelola booking
                    </Link>
                    <Link href="/follow-ups" className={buttonVariants("secondary")}>
                      Follow-up board
                    </Link>
                    <Link href="/services" className={buttonVariants("secondary")}>
                      Atur layanan
                    </Link>
                  </>
                }
              />

              <div className="mt-8 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                {analytics.summary.map((item) => (
                  <Card key={item.label} className="premium-panel rounded-[26px] p-5 lg:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-[var(--muted)]">{item.label}</p>
                      <span className="icon-chip h-10 w-10 rounded-[14px]">
                        <Zap className="h-4 w-4" />
                      </span>
                    </div>
                    <p className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl xl:text-[2rem]">{item.value}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--primary)]">{item.detail}</p>
                  </Card>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] bg-[#14312c] p-6 text-white shadow-[0_24px_55px_rgba(20,49,44,0.22)] xl:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-white/60">7 hari ke depan</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">{analytics.nextSevenDays.totalBookings} booking terjadwal</p>
                </div>
                <span className="rounded-2xl bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
                  Near-term
                </span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-[20px] border border-white/8 bg-white/10 p-4">
                  <p className="text-white/60">Revenue forecast</p>
                  <p className="mt-2 text-2xl font-semibold">{formatCurrency(analytics.nextSevenDays.totalRevenue)}</p>
                </div>
                <div className="rounded-[20px] border border-white/8 bg-white/10 p-4">
                  <p className="text-white/60">Follow-up due</p>
                  <p className="mt-2 text-2xl font-semibold">{analytics.dueFollowUps.length}</p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <p className="text-sm font-semibold text-white/80">Hari paling padat</p>
                {analytics.nextSevenDays.busyDays.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-white/15 bg-white/5 p-5 text-sm text-white/70">
                    Belum ada booking upcoming dalam 7 hari ke depan.
                  </div>
                ) : (
                  analytics.nextSevenDays.busyDays.map((item) => (
                    <div key={item.date} className="rounded-[22px] border border-white/8 bg-white/10 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold">{formatLongDate(item.date)}</p>
                          <p className="mt-1 text-sm text-white/65">{item.count} booking terjadwal</p>
                        </div>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">#{item.count}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>

        <div data-tutorial="analytics-performance" className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">Status booking</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">Lihat distribusi status untuk membaca kesehatan funnel operasional.</p>
                </div>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">
                  Funnel
                </span>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {analytics.statusBreakdown.map((item) => (
                  <div key={item.status} className="surface-card rounded-[24px] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-[var(--muted)]">{item.label}</p>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="mt-4 text-3xl font-semibold tracking-tight">{item.count}</p>
                    <p className="mt-2 text-sm text-[var(--primary)]">{item.share}% dari seluruh booking</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">Performa layanan</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">Urut berdasarkan revenue agar owner cepat melihat layanan anchor bisnis.</p>
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
                <div className="mt-5 space-y-4">
                  {analytics.servicePerformance.map((service, index) => (
                    <div key={service.id} className="surface-card rounded-[24px] p-4">
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
                        <div className="grid min-w-[220px] grid-cols-2 gap-3">
                          <div className="rounded-[20px] border border-teal-100/80 bg-teal-50/70 p-3">
                            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Completion</p>
                            <p className="mt-2 text-xl font-semibold text-[var(--foreground)]">{service.completionRate}%</p>
                          </div>
                          <div className="rounded-[20px] border border-violet-100/80 bg-violet-50/80 p-3">
                            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Attach add-on</p>
                            <p className="mt-2 text-xl font-semibold text-[var(--foreground)]">{service.addonAttachRate}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">Peluang upsell add-on</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">Add-on yang benar-benar laku, bukan sekadar tersedia di katalog.</p>
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
                <div className="mt-5 space-y-4">
                  {analytics.addonPerformance.map((addon) => (
                    <div key={addon.id} className="surface-card rounded-[24px] p-4">
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

            <Card className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">Insight operasional</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">Sinyal ringan yang bisa langsung dipakai untuk pengambilan keputusan.</p>
                </div>
                <CircleAlert className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div className="mt-5 space-y-4">
                {analytics.operationalInsights.map((item) => (
                  <div key={item.title} className={`rounded-[24px] border p-4 ${toneStyles[item.tone]}`}>
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

        <div data-tutorial="analytics-actions" className="grid gap-6 xl:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center justify-between gap-4">
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
              <div className="mt-5 space-y-4">
                {analytics.upcomingBookings.map((booking) => (
                  <AnalyticsActionCard key={booking.id} booking={booking} hrefLabel="Detail" variant="upcoming" />
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between gap-4">
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
              <div className="mt-5 space-y-4">
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
