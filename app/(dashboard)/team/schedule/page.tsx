import Link from "next/link";
import { BriefcaseBusiness, CalendarClock, Clock3, Settings2, Sparkles, Users } from "lucide-react";
import { updateTeamMemberWeeklyAvailability } from "@/lib/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { PageTutorial } from "@/components/ui/page-tutorial";
import { Textarea } from "@/components/ui/textarea";
import { buttonVariants } from "@/components/ui/button";
import { getFeedbackFromSearchParams } from "@/lib/feedback";
import { getOwnerBusiness, getTeamSchedulePageData } from "@/lib/data";

const dayOrder = [1, 2, 3, 4, 5, 6, 0];

export default async function TeamSchedulePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
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
            title: "Baca coverage mingguan dulu",
            description: "Panel atas bantu owner melihat hari mana yang ramai coverage dan hari mana yang masih tipis tanpa masuk ke detail tiap staff lebih dulu.",
            tip: "Kalau coverage drop di hari tertentu, cek kartu staff aktif di bawah lalu tambah availability yang relevan.",
            targetSelector: '[data-tutorial="team-schedule-overview"]',
            targetLabel: "Coverage mingguan"
          },
          {
            title: "Review kapasitas tiap staff dari satu kartu",
            description: "Setiap kartu menggabungkan status aktif, layanan yang dipegang, hari kerja, dan catatan availability supaya owner cepat tahu siapa yang benar-benar siap dijadwalkan.",
            tip: "Staff nonaktif tetap terlihat agar histori assignment tidak hilang, tapi tandanya dibuat jelas.",
            targetSelector: '[data-tutorial="team-schedule-grid"]',
            targetLabel: "Roster schedule"
          },
          {
            title: "Update weekly availability tanpa overbuild kalender",
            description: "V1 ini sengaja fokus ke pola minggu berulang: pilih hari aktif, atur jam mulai-selesai, lalu simpan catatan singkat kalau ada konteks operasional.",
            tip: "Gunakan catatan untuk hal seperti lunch break, on-call, atau coverage terbatas di hari tertentu.",
            targetSelector: '[data-tutorial="team-schedule-form"]',
            targetLabel: "Form availability"
          }
        ]}
      />

      <div className="space-y-6 xl:space-y-7">
        <FeedbackBanner feedback={feedback} />

        <Card data-tutorial="team-schedule-overview" className="premium-panel overflow-hidden p-6 sm:p-8 xl:p-10">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
            <div>
              <span className="section-label">
                <CalendarClock className="h-4 w-4" />
                Staff schedule
              </span>
              <PageHeader
                className="mt-4"
                eyebrow="Team schedule"
                title="Kelola weekly availability tim tanpa ribet"
                description="Halaman ini dibuat untuk owner yang butuh view kapasitas staff yang rapi: status aktif, layanan yang di-handle, summary hari kerja, dan editor weekly availability yang cukup detail untuk operasional harian."
                actions={
                  <>
                    <Link href="/team" className={buttonVariants("secondary")}>
                      Buka roster team
                    </Link>
                    <Link href="/team/capacity" className={buttonVariants("secondary")}>
                      Lihat kapasitas staff
                    </Link>
                    <Link href="/team/blocked-dates" className={buttonVariants("secondary")}>
                      Kelola blocked dates
                    </Link>
                    <Link href="/schedule" className={buttonVariants("secondary")}>
                      Lihat jadwal booking
                    </Link>
                  </>
                }
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="soft-stat rounded-[24px] p-4">
                  <p className="text-sm text-[var(--muted)]">Total staff</p>
                  <p className="mt-2 text-2xl font-semibold">{stats.totalMembers}</p>
                </div>
                <div className="soft-stat rounded-[24px] p-4">
                  <p className="text-sm text-[var(--muted)]">Staff aktif</p>
                  <p className="mt-2 text-2xl font-semibold">{stats.activeMembers}</p>
                </div>
                <div className="soft-stat rounded-[24px] p-4">
                  <p className="text-sm text-[var(--muted)]">Sudah ada weekly availability</p>
                  <p className="mt-2 text-2xl font-semibold">{stats.membersWithWeeklyAvailability}</p>
                </div>
                <div className="soft-stat rounded-[24px] p-4">
                  <p className="text-sm text-[var(--muted)]">Service coverage</p>
                  <p className="mt-2 text-2xl font-semibold">{stats.totalAssignedServices}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] bg-[#14312c] p-6 text-white shadow-[0_24px_55px_rgba(20,49,44,0.22)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-white/60">Coverage minggu ini</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">{activeMembers.length} staff aktif siap diatur</p>
                </div>
                <span className="rounded-2xl bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
                  Weekly view
                </span>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {dayOrder.map((dayOfWeek) => {
                  const day = weeklyCoverage.find((item) => item.dayOfWeek === dayOfWeek)!;
                  return (
                    <div key={day.dayOfWeek} className="rounded-[22px] border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{day.label}</p>
                        <p className="text-sm text-white/72">{day.scheduledCount} staff</p>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-white/68">
                        {day.scheduledNames.length > 0 ? day.scheduledNames.join(", ") : "Belum ada coverage aktif"}
                      </p>
                    </div>
                  );
                })}
              </div>
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
          <div data-tutorial="team-schedule-grid" className="grid gap-5 2xl:grid-cols-2">
            {teamMembers.map((member) => {
              const weeklyAvailability = [...(member.weeklyAvailability ?? [])].sort((a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek));
              const activeDays = weeklyAvailability.filter((item) => item.isAvailable);
              const inactiveDays = weeklyAvailability.length - activeDays.length;

              return (
                <Card key={member.id} data-tutorial="team-schedule-form" className="p-6 sm:p-7">
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

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="surface-card rounded-[22px] p-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                        <BriefcaseBusiness className="h-4 w-4 text-[var(--primary)]" />
                        Services
                      </div>
                      <p className="mt-2 font-semibold">{(member.serviceNames ?? []).length > 0 ? member.serviceNames?.join(", ") : "Belum ada assignment"}</p>
                    </div>
                    <div className="surface-card rounded-[22px] p-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                        <Users className="h-4 w-4 text-[var(--primary)]" />
                        Working days
                      </div>
                      <p className="mt-2 font-semibold">{(member.workDaysSummary ?? []).length > 0 ? member.workDaysSummary?.join(", ") : "Belum diatur"}</p>
                    </div>
                    <div className="surface-card rounded-[22px] p-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                        <Clock3 className="h-4 w-4 text-[var(--primary)]" />
                        Summary
                      </div>
                      <p className="mt-2 font-semibold">{member.availabilitySummary || "Belum diisi"}</p>
                    </div>
                  </div>

                  <form action={updateTeamMemberWeeklyAvailability} className="mt-6 space-y-5">
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

                    <div className="rounded-[22px] border border-teal-100/80 bg-teal-50/70 p-4 text-sm text-[var(--primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                      <div className="flex items-start gap-3">
                        <Sparkles className="mt-0.5 h-4 w-4" />
                        <p>{member.bio?.trim() || "Belum ada catatan spesialisasi. Gunakan halaman Team bila ingin melengkapi profil staff dan assignment layanan lebih detail."}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <SubmitButton variant="secondary">Simpan weekly availability</SubmitButton>
                      <Link href="/team" className={buttonVariants("ghost")}>
                        Edit profil staff
                      </Link>
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
