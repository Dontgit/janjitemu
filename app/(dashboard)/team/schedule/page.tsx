import Link from "next/link";
import { CalendarClock, Clock3, Settings2 } from "lucide-react";
import { updateTeamMemberWeeklyAvailability } from "@/lib/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { PageTutorial } from "@/components/ui/page-tutorial";
import { Textarea } from "@/components/ui/textarea";
import { getFeedbackFromSearchParams } from "@/lib/feedback";
import { getOwnerBusiness, getTeamSchedulePageData } from "@/lib/data";

const dayOrder = [1, 2, 3, 4, 5, 6, 0];

export default async function TeamSchedulePage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [business, pageData, resolvedSearchParams] = await Promise.all([getOwnerBusiness(), getTeamSchedulePageData(), searchParams]);
  const feedback = getFeedbackFromSearchParams(resolvedSearchParams);
  const { teamMembers, stats, weeklyCoverage } = pageData;
  const activeMembers = teamMembers.filter((member) => member.active ?? true);

  return (
    <DashboardShell activePath="/team/schedule" bookingLink={business.bookingLink}>
      <PageTutorial
        pageKey="team-schedule"
        pageTitle="Staff Schedule"
        steps={[
          {
            title: "Mulai dari coverage mingguan",
            description: "Halaman schedule dibuat lebih ringkas agar owner cepat lihat coverage per hari tanpa hero yang terlalu berat.",
            tip: "Kalau coverage drop di hari tertentu, cek kartu staff aktif di bawah lalu tambah availability relevan.",
            targetSelector: '[data-tutorial="team-schedule-overview"]',
            targetLabel: "Coverage mingguan"
          },
          {
            title: "Review roster schedule per staff",
            description: "Kartu staff tetap lengkap, tapi layout-nya dibuat lebih seimbang untuk mobile dan desktop."
,
            tip: "Staff nonaktif tetap terlihat agar histori assignment tidak hilang, tapi tandanya tetap jelas.",
            targetSelector: '[data-tutorial="team-schedule-grid"]',
            targetLabel: "Roster schedule"
          },
          {
            title: "Update weekly availability dengan cepat",
            description: "Editor mingguan tetap ada, tapi disusun lebih ringan supaya tidak terasa terlalu padat saat dipakai."
,
            tip: "Gunakan catatan untuk lunch break, on-call, atau coverage terbatas di hari tertentu.",
            targetSelector: '[data-tutorial="team-schedule-form"]',
            targetLabel: "Form availability"
          }
        ]}
      />

      <div className="space-y-5 xl:space-y-6">
        <FeedbackBanner feedback={feedback} />

        <Card data-tutorial="team-schedule-overview" className="premium-panel p-5 sm:p-6 xl:p-8">
          <div className="space-y-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <span className="section-label">
                  <CalendarClock className="h-4 w-4" />
                  Staff schedule
                </span>
                <PageHeader
                  className="mt-4"
                  eyebrow="Team schedule"
                  title="Kelola weekly availability tim tanpa ribet"
                  description="Kelola status aktif, hari kerja, dan weekly availability tim dengan tampilan yang lebih ringan dan lebih nyaman di layar kecil."
                  actions={
                    <>
                      <Link href="/team" className={buttonVariants("secondary")}>Buka roster team</Link>
                      <Link href="/team/capacity" className={buttonVariants("secondary")}>Lihat kapasitas staff</Link>
                    </>
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[420px] xl:max-w-[560px] xl:flex-1">
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Total staff</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{stats.totalMembers}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Staff aktif</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{stats.activeMembers}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Punya availability</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{stats.membersWithWeeklyAvailability}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Service coverage</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{stats.totalAssignedServices}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {dayOrder.map((dayOfWeek) => {
                const day = weeklyCoverage.find((item) => item.dayOfWeek === dayOfWeek)!;
                return (
                  <div key={day.dayOfWeek} className="surface-card rounded-[22px] p-4">
                    <p className="font-semibold">{day.label}</p>
                    <p className="mt-2 text-sm text-[var(--muted)]">{day.scheduledCount} staff</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{day.scheduledNames.length > 0 ? day.scheduledNames.join(", ") : "Belum ada coverage aktif"}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {teamMembers.length === 0 ? (
          <EmptyState
            title="Belum ada staff"
            description="Tambahkan team member dulu dari halaman Team supaya schedule mingguan bisa mulai diatur."
            action={<Link href="/team" className={buttonVariants("primary")}>Tambah staff</Link>}
          />
        ) : (
          <div data-tutorial="team-schedule-grid" className="grid gap-4 2xl:grid-cols-2">
            {teamMembers.map((member) => {
              const weeklyAvailability = [...(member.weeklyAvailability ?? [])].sort((a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek));
              const activeDays = weeklyAvailability.filter((item) => item.isAvailable);
              const inactiveDays = weeklyAvailability.length - activeDays.length;

              return (
                <Card key={member.id} data-tutorial="team-schedule-form" className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xl font-semibold tracking-tight">{member.name}</p>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${member.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          {member.active ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--muted)]">{member.roleLabel}</p>
                    </div>
                    <div className="soft-stat rounded-[20px] px-4 py-3 text-sm sm:text-right">
                      <p className="text-[var(--muted)]">Hari aktif</p>
                      <p className="mt-1 text-lg font-semibold">{activeDays.length}/7</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="surface-card rounded-[22px] p-4">
                      <p className="text-sm text-[var(--muted)]">Services</p>
                      <p className="mt-2 font-semibold">{(member.serviceNames ?? []).length > 0 ? member.serviceNames?.join(", ") : "Belum ada assignment"}</p>
                    </div>
                    <div className="surface-card rounded-[22px] p-4">
                      <p className="text-sm text-[var(--muted)]">Working days</p>
                      <p className="mt-2 font-semibold">{(member.workDaysSummary ?? []).length > 0 ? member.workDaysSummary?.join(", ") : "Belum diatur"}</p>
                    </div>
                    <div className="surface-card rounded-[22px] p-4">
                      <p className="text-sm text-[var(--muted)]">Summary</p>
                      <p className="mt-2 font-semibold">{member.availabilitySummary || "Belum diisi"}</p>
                    </div>
                  </div>

                  <form action={updateTeamMemberWeeklyAvailability} className="mt-5 space-y-5">
                    <input type="hidden" name="redirectTo" value="/team/schedule" />
                    <input type="hidden" name="teamMemberId" value={member.id} />

                    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                      <Input
                        name="availabilitySummary"
                        defaultValue={member.availabilitySummary ?? ""}
                        placeholder="Contoh: Sen - Jum • 10:00 - 18:00"
                      />
                      <Textarea
                        name="weeklyAvailabilityNote"
                        rows={2}
                        defaultValue={member.weeklyAvailabilityNote ?? ""}
                        placeholder="Catatan availability umum: lunch break, on-call, coverage terbatas, dll."
                      />
                    </div>

                    <div className="field-card rounded-[26px] p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <span className="icon-chip">
                          <Settings2 className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold">Weekly availability</p>
                          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Atur hari aktif per minggu, jam kerja inti, dan catatan pendek per hari jika memang ada kebutuhan spesifik.</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {weeklyAvailability.map((slot) => (
                          <div key={`${member.id}-${slot.dayOfWeek}`} className="surface-card rounded-[22px] p-4">
                            <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)_140px_140px] lg:items-center">
                              <div>
                                <p className="font-semibold">{slot.label}</p>
                                <p className="mt-1 text-sm text-[var(--muted)]">{slot.isAvailable ? "Masuk coverage mingguan" : "Off / tidak tersedia"}</p>
                              </div>

                              <label className="field-card inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm">
                                <input type="checkbox" name={`availability-${slot.dayOfWeek}-enabled`} value="yes" defaultChecked={slot.isAvailable} />
                                Aktifkan hari ini
                              </label>

                              <Input name={`availability-${slot.dayOfWeek}-start`} type="time" defaultValue={slot.startTime} />
                              <Input name={`availability-${slot.dayOfWeek}-end`} type="time" defaultValue={slot.endTime} />
                            </div>
                            <div className="mt-3">
                              <Input name={`availability-${slot.dayOfWeek}-note`} defaultValue={slot.note ?? ""} placeholder="Catatan opsional untuk hari ini" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="soft-stat rounded-[22px] p-4 text-sm">
                        <p className="text-[var(--muted)]">Hari nonaktif</p>
                        <p className="mt-2 text-lg font-semibold">{inactiveDays}</p>
                      </div>
                      <div className="soft-stat rounded-[22px] p-4 text-sm">
                        <p className="text-[var(--muted)]">Kontak</p>
                        <p className="mt-2 font-semibold">{member.phone || member.email || "Belum ada"}</p>
                      </div>
                      <div className="soft-stat rounded-[22px] p-4 text-sm">
                        <p className="text-[var(--muted)]">Status layanan</p>
                        <p className="mt-2 font-semibold">{(member.serviceIds ?? []).length} layanan</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <SubmitButton variant="secondary">Simpan weekly availability</SubmitButton>
                      <Link href="/team" className={buttonVariants("ghost")}>Edit profil staff</Link>
                    </div>
                  </form>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
