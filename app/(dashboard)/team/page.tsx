import Link from "next/link";
import { BriefcaseBusiness, CalendarClock, Search, ShieldCheck, UserPlus, Users } from "lucide-react";
import { createTeamMember, toggleTeamMemberStatus, updateTeamMember } from "@/lib/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { FilterShell } from "@/components/ui/filter-shell";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { PageTutorial } from "@/components/ui/page-tutorial";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getFeedbackFromSearchParams } from "@/lib/feedback";
import { getOwnerBusiness, getPaginatedTeamMembers, getServices } from "@/lib/data";
import { buildSearchPath, getSingleSearchParam, parsePaginationParams, replaceSearchParams } from "@/lib/search-params";
import { formatDateTimeLabel } from "@/lib/utils";

const workDayOptions = [
  ["Sen", "Senin"],
  ["Sel", "Selasa"],
  ["Rab", "Rabu"],
  ["Kam", "Kamis"],
  ["Jum", "Jumat"],
  ["Sab", "Sabtu"],
  ["Min", "Minggu"]
] as const;

export default async function TeamPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [business, resolvedSearchParams, services] = await Promise.all([getOwnerBusiness(), searchParams, getServices()]);
  const feedback = getFeedbackFromSearchParams(resolvedSearchParams);
  const query = getSingleSearchParam(resolvedSearchParams.q).trim();
  const status = getSingleSearchParam(resolvedSearchParams.status);
  const serviceId = getSingleSearchParam(resolvedSearchParams.serviceId);
  const { page, perPage } = parsePaginationParams(resolvedSearchParams);
  const team = await getPaginatedTeamMembers({ q: query, status, serviceId, page, perPage });
  const currentPath = buildSearchPath(
    "/team",
    Object.fromEntries(
      Object.entries(resolvedSearchParams).map(([key, value]) => [
        key,
        key === "page" ? String(team.page) : key === "perPage" ? String(team.perPage) : value
      ])
    )
  );
  const activeCount = team.items.filter((member) => member.active ?? true).length;
  const inactiveCount = team.items.length - activeCount;
  const assignedCount = team.items.filter((member) => (member.serviceIds ?? []).length > 0).length;
  const primaryServices = services.filter((service) => !service.isAddon);

  return (
    <DashboardShell activePath="/team" bookingLink={business.bookingLink}>
      <PageTutorial
        pageKey="team"
        pageTitle="Team"
        steps={[
          {
            title: "Mulai dari snapshot tim",
            description: "Halaman team sekarang dibuat lebih ringkas supaya owner cepat lihat total staff, staff aktif, dan siapa yang sudah punya service coverage.",
            tip: "Kalau service coverage masih bolong, tambah assignment dari kartu staff di bawah.",
            targetSelector: '[data-tutorial="team-overview"]',
            targetLabel: "Snapshot team"
          },
          {
            title: "Filter dan tambah staff tanpa layout berat",
            description: "Filter roster dan form create diseimbangkan supaya tetap nyaman dipakai di mobile maupun desktop.",
            tip: "Availability cukup dalam bentuk summary singkat dulu, belum perlu planner detail penuh.",
            targetSelector: '[data-tutorial="team-create"]',
            targetLabel: "Filter & create"
          },
          {
            title: "Kelola profil staff dari daftar utama",
            description: "Daftar staff tetap jadi area kerja utama supaya edit role, kontak, layanan, dan status aktif bisa dilakukan dari satu halaman."
,
            tip: "Nonaktifkan staff yang sedang off agar roster tetap bersih tanpa kehilangan histori assignment.",
            targetSelector: '[data-tutorial="team-list"]',
            targetLabel: "Daftar staff"
          }
        ]}
      />

      <div className="space-y-5 xl:space-y-6">
        <FeedbackBanner feedback={feedback} />

        <Card data-tutorial="team-overview" className="premium-panel p-5 sm:p-6 xl:p-8">
          <div className="space-y-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <span className="section-label">
                  <Users className="h-4 w-4" />
                  Team roster
                </span>
                <PageHeader
                  className="mt-4"
                  eyebrow="Team"
                  title="Staff, coverage layanan, dan status availability"
                  description="Kelola staff aktif/nonaktif, tentukan layanan yang mereka handle, dan simpan summary availability tanpa tampilan yang terlalu berat."
                  actions={
                    <>
                      <Link href="/team/capacity" className={buttonVariants("secondary")}>Lihat kapasitas staff</Link>
                      <Link href="/team/schedule" className={buttonVariants("secondary")}>Kelola schedule staff</Link>
                    </>
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:min-w-[360px] xl:max-w-[460px] xl:flex-1">
                {[
                  ["Total staff", String(team.total)],
                  ["Sedang aktif", String(activeCount)],
                  ["Punya layanan", String(assignedCount)]
                ].map(([label, value]) => (
                  <div key={label} className="surface-card rounded-[22px] p-4">
                    <p className="text-sm text-[var(--muted)]">{label}</p>
                    <p className="mt-2 text-xl font-semibold tracking-tight">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div data-tutorial="team-create" className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
          <FilterShell
            title="Cari roster"
            description="Filter staff berdasarkan nama, role, status aktif, atau layanan yang mereka pegang."
            footer={
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="soft-stat rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Data tampil</p>
                  <p className="mt-2 text-xl font-semibold">{team.items.length}</p>
                </div>
                <div className="soft-stat rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Aktif</p>
                  <p className="mt-2 text-xl font-semibold">{activeCount}</p>
                </div>
                <div className="soft-stat rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Nonaktif</p>
                  <p className="mt-2 text-xl font-semibold">{inactiveCount}</p>
                </div>
              </div>
            }
          >
            <form className="grid w-full gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_180px_220px_auto]" method="get">
              <input type="hidden" name="page" value="1" />
              <input type="hidden" name="perPage" value={team.perPage} />
              <Input name="q" placeholder="Cari nama / role / layanan" defaultValue={query} />
              <Select name="status" defaultValue={status}>
                <option value="">Semua status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </Select>
              <Select name="serviceId" defaultValue={serviceId}>
                <option value="">Semua layanan</option>
                {primaryServices.map((service) => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </Select>
              <SubmitButton variant="secondary" className="w-full md:col-span-2 xl:w-fit">Terapkan</SubmitButton>
            </form>
          </FilterShell>

          <Card className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="icon-chip">
                <UserPlus className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-semibold">Tambah staff baru</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Masukkan data staff yang benar-benar dibutuhkan untuk operasional harian dan assignment layanan.</p>
              </div>
            </div>
            <form action={createTeamMember} className="mt-5 grid gap-4 md:grid-cols-2">
              <input type="hidden" name="redirectTo" value={currentPath} />
              <Input name="name" placeholder="Nama staff" required />
              <Input name="roleLabel" placeholder="Peran: Senior Stylist, Therapist, dll." required />
              <Input name="phone" placeholder="Nomor WhatsApp (opsional)" />
              <Input name="email" type="email" placeholder="Email (opsional)" />
              <Input name="availabilitySummary" placeholder="Contoh: Senin - Jumat • 10:00 - 18:00" className="md:col-span-2" />
              <div className="field-card rounded-[24px] p-4 md:col-span-2">
                <p className="text-sm font-semibold">Hari kerja singkat</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-4">
                  {workDayOptions.map(([value, label]) => (
                    <label key={value} className="field-card flex items-center gap-3 rounded-2xl px-4 py-3 text-sm">
                      <input type="checkbox" name="workDaysSummary" value={value} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="field-card rounded-[24px] p-4 md:col-span-2">
                <p className="text-sm font-semibold">Layanan yang ditangani</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Pilih layanan utama atau add-on yang benar-benar di-handle oleh staff ini.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {services.map((service) => (
                    <label key={service.id} className="field-card flex items-start gap-3 rounded-2xl px-4 py-3 text-sm">
                      <input type="checkbox" name="serviceIds" value={service.id} />
                      <span>
                        <span className="block font-semibold text-[var(--foreground)]">{service.name}</span>
                        <span className="block text-[var(--muted)]">{service.isAddon ? "Add-on" : "Layanan utama"}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <Textarea name="bio" rows={3} placeholder="Catatan singkat / spesialisasi staff" />
              </div>
              <SubmitButton className="md:w-fit">Tambah staff</SubmitButton>
            </form>
          </Card>
        </div>

        {team.total > 0 ? (
          <PaginationControls
            className="surface-card border-none bg-white/85"
            page={team.page}
            perPage={team.perPage}
            total={team.total}
            totalPages={team.totalPages}
            createPageHref={(nextPage) => replaceSearchParams("/team", resolvedSearchParams, { page: nextPage, perPage: team.perPage })}
            createPerPageHref={(nextPerPage) => replaceSearchParams("/team", resolvedSearchParams, { page: 1, perPage: nextPerPage })}
          />
        ) : null}

        <div data-tutorial="team-list">
          {team.items.length === 0 ? (
            <EmptyState
              title="Belum ada staff"
              description="Tambahkan team member pertama supaya assignment layanan dan kapasitas operasional mulai kelihatan."
            />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
              {team.items.map((member) => (
                <Card key={member.id} className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold tracking-tight">{member.name}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{member.roleLabel}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${member.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {member.active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3">
                    <div className="surface-card rounded-[20px] p-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                        <CalendarClock className="h-4 w-4 text-[var(--primary)]" />
                        Availability
                      </div>
                      <p className="mt-2 font-semibold">{member.availabilitySummary || "Belum diisi"}</p>
                      <p className="mt-2 text-sm text-[var(--muted)]">{(member.workDaysSummary ?? []).length > 0 ? member.workDaysSummary?.join(", ") : "Hari kerja belum ditentukan"}</p>
                    </div>
                    <div className="surface-card rounded-[20px] p-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                        <BriefcaseBusiness className="h-4 w-4 text-[var(--primary)]" />
                        Service coverage
                      </div>
                      <p className="mt-2 font-semibold">{(member.serviceNames ?? []).length > 0 ? member.serviceNames?.join(", ") : "Belum ada layanan yang di-assign"}</p>
                    </div>
                  </div>

                  <form action={updateTeamMember} className="mt-5 space-y-4">
                    <input type="hidden" name="redirectTo" value={currentPath} />
                    <input type="hidden" name="teamMemberId" value={member.id} />
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input name="name" defaultValue={member.name} required />
                      <Input name="roleLabel" defaultValue={member.roleLabel} required />
                      <Input name="phone" defaultValue={member.phone ?? ""} />
                      <Input name="email" type="email" defaultValue={member.email ?? ""} />
                    </div>
                    <Input name="availabilitySummary" defaultValue={member.availabilitySummary ?? ""} placeholder="Ringkasan availability" />
                    <div className="field-card rounded-[24px] p-4">
                      <p className="text-sm font-semibold">Hari kerja</p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-4">
                        {workDayOptions.map(([value, label]) => (
                          <label key={value} className="field-card flex items-center gap-3 rounded-2xl px-4 py-3 text-sm">
                            <input type="checkbox" name="workDaysSummary" value={value} defaultChecked={member.workDaysSummary?.includes(value)} />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="field-card rounded-[24px] p-4">
                      <p className="text-sm font-semibold">Layanan yang ditangani</p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {services.map((service) => (
                          <label key={service.id} className="field-card flex items-start gap-3 rounded-2xl px-4 py-3 text-sm">
                            <input type="checkbox" name="serviceIds" value={service.id} defaultChecked={member.serviceIds?.includes(service.id)} />
                            <span>
                              <span className="block font-semibold text-[var(--foreground)]">{service.name}</span>
                              <span className="block text-[var(--muted)]">{service.isAddon ? "Add-on" : "Layanan utama"}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <Textarea name="bio" rows={3} defaultValue={member.bio ?? ""} placeholder="Bio / spesialisasi staff" />
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="soft-stat rounded-[22px] p-4 text-sm">
                        <p className="text-[var(--muted)]">Total layanan</p>
                        <p className="mt-2 text-lg font-semibold">{member.serviceIds?.length ?? 0}</p>
                      </div>
                      <div className="soft-stat rounded-[22px] p-4 text-sm">
                        <p className="text-[var(--muted)]">Kontak</p>
                        <p className="mt-2 font-semibold">{member.phone || member.email || "Belum ada"}</p>
                      </div>
                      <div className="soft-stat rounded-[22px] p-4 text-sm">
                        <p className="text-[var(--muted)]">Diupdate</p>
                        <p className="mt-2 font-semibold">{formatDateTimeLabel(member.updatedAt)}</p>
                      </div>
                    </div>
                    <div className="field-card rounded-[24px] p-4 text-sm text-[var(--muted)]">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-4 w-4 text-[var(--primary)]" />
                        <p>{member.bio?.trim() ? member.bio : "Belum ada catatan spesialisasi untuk staff ini."}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <SubmitButton variant="secondary">Simpan perubahan</SubmitButton>
                    </div>
                  </form>

                  <form action={toggleTeamMemberStatus} className="mt-3">
                    <input type="hidden" name="redirectTo" value={currentPath} />
                    <input type="hidden" name="teamMemberId" value={member.id} />
                    <input type="hidden" name="nextStatus" value={member.active ? "inactive" : "active"} />
                    <SubmitButton variant="ghost" className="w-full">{member.active ? "Nonaktifkan staff" : "Aktifkan staff"}</SubmitButton>
                  </form>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
