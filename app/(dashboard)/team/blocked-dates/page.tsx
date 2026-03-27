import Link from "next/link";
import { CalendarClock, CalendarRange, Clock3, ShieldBan, Sparkles, Users } from "lucide-react";
import { createTeamMemberBlockedDate, deleteTeamMemberBlockedDate } from "@/lib/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { PageTutorial } from "@/components/ui/page-tutorial";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getFeedbackFromSearchParams } from "@/lib/feedback";
import { getBlockedEntryWindowLabel, getOwnerBusiness, getTeamBlockedDatesPageData } from "@/lib/data";
import { formatLongDate } from "@/lib/utils";

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export default async function TeamBlockedDatesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [business, pageData, resolvedSearchParams] = await Promise.all([getOwnerBusiness(), getTeamBlockedDatesPageData(), searchParams]);
  const feedback = getFeedbackFromSearchParams(resolvedSearchParams);
  const activeMembers = pageData.teamMembers.filter((member) => member.active ?? true);
  const membersWithUpcomingBlocks = pageData.memberSummaries.filter((member) => member.upcomingCount > 0);

  return (
    <DashboardShell activePath="/team/blocked-dates" bookingLink={business.bookingLink}>
      <PageTutorial
        pageKey="team-blocked-dates"
        pageTitle="Staff Blocked Dates"
        steps={[
          {
            title: "Mulai dari overview blocked dates",
            description: "Halaman blocked dates sekarang dibuat lebih ringkas agar owner cepat membaca jumlah upcoming entries, staff terdampak, dan full-day block."
,
            tip: "Gunakan blocked date untuk override satu kali di luar weekly availability.",
            targetSelector: '[data-tutorial="team-blocked-overview"]',
            targetLabel: "Overview blocked dates"
          },
          {
            title: "Tambah block tanpa alur ribet",
            description: "Form create dibuat lebih fokus untuk kebutuhan operasional harian: pilih staff, tanggal, full-day atau timed block, lalu isi catatan jika perlu."
,
            tip: "Pakai full-day untuk off total, dan rentang jam untuk training, meeting, atau agenda pribadi.",
            targetSelector: '[data-tutorial="team-blocked-form"]',
            targetLabel: "Form blocked date"
          },
          {
            title: "Review upcoming block sebelum assign booking",
            description: "Daftar upcoming entry tetap jadi area kerja utama supaya owner cepat mengecek konflik sebelum assign staff."
,
            tip: "Hapus entry yang sudah tidak relevan agar ranking staff kembali normal.",
            targetSelector: '[data-tutorial="team-blocked-list"]',
            targetLabel: "Upcoming blocked dates"
          }
        ]}
      />

      <div className="space-y-5 xl:space-y-6">
        <FeedbackBanner feedback={feedback} />

        <Card data-tutorial="team-blocked-overview" className="premium-panel p-5 sm:p-6 xl:p-8">
          <div className="space-y-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <span className="section-label">
                  <ShieldBan className="h-4 w-4" />
                  Staff blocked dates
                </span>
                <PageHeader
                  className="mt-4"
                  eyebrow="Team blocked dates"
                  title="Blok tanggal atau jam tertentu saat weekly schedule belum cukup"
                  description="Simpan pengecualian satu kali per staff supaya assignment booking lebih realistis ketika ada cuti singkat, training, meeting, atau jam yang harus dikosongkan."
                  actions={
                    <>
                      <Link href="/team" className={buttonVariants("secondary")}>Buka roster team</Link>
                      <Link href="/team/schedule" className={buttonVariants("secondary")}>Kelola weekly schedule</Link>
                    </>
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[420px] xl:max-w-[560px] xl:flex-1">
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Upcoming entries</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{pageData.summary.totalUpcomingEntries}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Staff terdampak</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{pageData.summary.affectedMembers}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Full-day block</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{pageData.summary.allDayEntries}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Entry hari ini</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{pageData.summary.entriesToday}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="surface-card rounded-[22px] p-4">
                <p className="text-sm text-[var(--muted)]">Staff aktif</p>
                <p className="mt-2 font-semibold">{activeMembers.length}</p>
              </div>
              <div className="surface-card rounded-[22px] p-4">
                <p className="text-sm text-[var(--muted)]">Timed blocks</p>
                <p className="mt-2 font-semibold">{pageData.summary.timedEntries}</p>
              </div>
              <div className="surface-card rounded-[22px] p-4">
                <p className="text-sm text-[var(--muted)]">Staff punya block</p>
                <p className="mt-2 font-semibold">{membersWithUpcomingBlocks.length}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
          <Card data-tutorial="team-blocked-form" className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="icon-chip">
                <CalendarRange className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-semibold">Tambah blocked date</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Simpan override sekali jalan untuk staff tertentu saat weekly availability tidak cukup mewakili kondisi riil di lapangan.</p>
              </div>
            </div>

            <form action={createTeamMemberBlockedDate} className="mt-5 space-y-4">
              <input type="hidden" name="redirectTo" value="/team/blocked-dates" />

              <div className="grid gap-4 md:grid-cols-2">
                <Select name="teamMemberId" defaultValue="" required>
                  <option value="" disabled>Pilih staff</option>
                  {pageData.teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} • {member.roleLabel}{member.active ? "" : " • Nonaktif"}
                    </option>
                  ))}
                </Select>
                <Input name="date" type="date" min={getTodayInputValue()} defaultValue={getTodayInputValue()} required />
              </div>

              <label className="field-card flex items-center gap-3 rounded-[22px] px-4 py-3 text-sm">
                <input type="checkbox" name="isAllDay" value="yes" defaultChecked />
                Blok full day
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <Input name="startTime" type="time" />
                <Input name="endTime" type="time" />
              </div>

              <Textarea name="note" rows={3} placeholder="Alasan opsional: cuti, training, meeting vendor, jadwal pribadi, dll." />

              <div className="rounded-[22px] border border-teal-100/80 bg-teal-50/70 p-4 text-sm text-[var(--primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4" />
                  <p>Kalau full-day aktif, jam mulai dan selesai akan diabaikan. Isi jam hanya saat memang ingin memblok rentang tertentu saja.</p>
                </div>
              </div>

              <SubmitButton className="md:w-fit">Simpan blocked date</SubmitButton>
            </form>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="icon-chip">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-semibold">Siapa yang paling banyak punya block</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Ringkasan singkat ini membantu owner membaca siapa yang coverage-nya paling sering di-override.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {pageData.memberSummaries.slice(0, 6).map((member) => (
                <div key={member.memberId} className="surface-card rounded-[22px] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{member.name}</p>
                        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${member.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          {member.active ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--muted)]">{member.roleLabel}</p>
                    </div>
                    <div className="soft-stat rounded-[18px] px-4 py-3 text-sm text-right">
                      <p className="text-[var(--muted)]">Upcoming</p>
                      <p className="mt-1 text-lg font-semibold">{member.upcomingCount}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="soft-stat rounded-[18px] p-3 text-sm">
                      <p className="text-[var(--muted)]">Full-day</p>
                      <p className="mt-1 font-semibold">{member.allDayCount}</p>
                    </div>
                    <div className="soft-stat rounded-[18px] p-3 text-sm">
                      <p className="text-[var(--muted)]">Rentang jam</p>
                      <p className="mt-1 font-semibold">{member.timedCount}</p>
                    </div>
                    <div className="soft-stat rounded-[18px] p-3 text-sm">
                      <p className="text-[var(--muted)]">Blok berikutnya</p>
                      <p className="mt-1 font-semibold">{member.nextBlockedDate ? formatLongDate(member.nextBlockedDate) : "Belum ada"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div data-tutorial="team-blocked-list">
          {pageData.upcomingEntries.length === 0 ? (
            <EmptyState
              title="Belum ada blocked date"
              description="Saat owner menambahkan block pertama, daftar upcoming di bawah akan mulai dipakai sebagai referensi assignment staff."
              action={<Link href="/team/schedule" className={buttonVariants("primary")}>Lihat weekly schedule</Link>}
            />
          ) : (
            <div className="space-y-4">
              {pageData.upcomingEntries.map((entry) => (
                <Card key={entry.id} className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold tracking-tight">{entry.teamMemberName ?? "Staff"}</p>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${entry.isAllDay ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"}`}>
                          {entry.isAllDay ? "Full day" : "Timed block"}
                        </span>
                        {entry.teamMemberActive === false ? (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Nonaktif</span>
                        ) : null}
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <div className="surface-card rounded-[18px] p-3 text-sm">
                          <div className="flex items-center gap-2 text-[var(--muted)]">
                            <CalendarClock className="h-4 w-4 text-[var(--primary)]" />
                            Tanggal
                          </div>
                          <p className="mt-2 font-semibold">{formatLongDate(entry.date)}</p>
                        </div>
                        <div className="surface-card rounded-[18px] p-3 text-sm">
                          <div className="flex items-center gap-2 text-[var(--muted)]">
                            <Clock3 className="h-4 w-4 text-[var(--primary)]" />
                            Window
                          </div>
                          <p className="mt-2 font-semibold">{getBlockedEntryWindowLabel(entry)}</p>
                        </div>
                        <div className="surface-card rounded-[18px] p-3 text-sm">
                          <div className="flex items-center gap-2 text-[var(--muted)]">
                            <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                            Catatan
                          </div>
                          <p className="mt-2 font-semibold">{entry.note?.trim() || "Tidak ada catatan tambahan"}</p>
                        </div>
                      </div>
                    </div>

                    <form action={deleteTeamMemberBlockedDate} className="lg:shrink-0">
                      <input type="hidden" name="redirectTo" value="/team/blocked-dates" />
                      <input type="hidden" name="blockedDateId" value={entry.id} />
                      <SubmitButton variant="ghost">Hapus block</SubmitButton>
                    </form>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
