import Link from "next/link";
import { BellRing, CalendarClock, Filter, ListTodo, Sparkles } from "lucide-react";
import { FollowUpForm } from "@/components/booking/follow-up-form";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { FollowUpBadge, StatusBadge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { getOwnerBusiness, getReminderCenterData } from "@/lib/data";
import { getSingleSearchParam } from "@/lib/search-params";
import { cn, formatDateTimeLabel } from "@/lib/utils";

const priorityStyles = {
  high: "bg-rose-100 text-rose-700 border-rose-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-emerald-100 text-emerald-700 border-emerald-200"
} as const;

const priorityLabels = {
  high: "Prioritas tinggi",
  medium: "Prioritas menengah",
  low: "Prioritas ringan"
} as const;

export default async function ReminderCenterPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const q = getSingleSearchParam(resolvedSearchParams.q);
  const priority = getSingleSearchParam(resolvedSearchParams.priority) as "high" | "medium" | "low" | "";
  const type = getSingleSearchParam(resolvedSearchParams.type) as "follow-up" | "appointment" | "";
  const [business, reminders] = await Promise.all([
    getOwnerBusiness(),
    getReminderCenterData({ q, priority, type })
  ]);
  const highPriority = reminders.filter((item) => item.priority === "high").length;
  const followUpCount = reminders.filter((item) => item.type === "follow-up").length;
  const appointmentCount = reminders.filter((item) => item.type === "appointment").length;

  return (
    <DashboardShell activePath="/reminders" bookingLink={business.bookingLink}>
      <div className="space-y-6 xl:space-y-7">
        <Card className="premium-panel overflow-hidden p-6 sm:p-8 xl:p-10">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div>
              <span className="section-label">
                <BellRing className="h-4 w-4" />
                Reminder center
              </span>
              <PageHeader
                className="mt-4"
                eyebrow="Reminders"
                title="Pantau next action dan booking terdekat"
                description="Reminder center menggabungkan next action follow up dan booking yang sudah dekat waktunya supaya owner punya satu inbox operasional yang lebih mudah diprioritaskan."
                actions={
                  <>
                    <Link href="/follow-ups" className={buttonVariants("secondary")}>Follow-up board</Link>
                    <Link href="/bookings" className={buttonVariants("secondary")}>Semua bookings</Link>
                  </>
                }
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="soft-stat rounded-[24px] p-4">
                  <p className="text-sm text-[var(--muted)]">Total reminder</p>
                  <p className="mt-2 text-2xl font-semibold">{reminders.length}</p>
                </div>
                <div className="soft-stat rounded-[24px] p-4">
                  <p className="text-sm text-[var(--muted)]">Prioritas tinggi</p>
                  <p className="mt-2 text-2xl font-semibold">{highPriority}</p>
                </div>
                <div className="soft-stat rounded-[24px] p-4">
                  <p className="text-sm text-[var(--muted)]">Follow up aktif</p>
                  <p className="mt-2 text-2xl font-semibold">{followUpCount}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] bg-[#14312c] p-6 text-white shadow-[0_24px_55px_rgba(20,49,44,0.22)]">
              <p className="text-sm uppercase tracking-[0.18em] text-white/60">Komposisi reminder</p>
              <div className="mt-6 space-y-3">
                <div className="rounded-[22px] border border-white/10 bg-white/10 p-4">
                  <p className="text-sm text-white/60">Booking terdekat</p>
                  <p className="mt-2 text-2xl font-semibold">{appointmentCount}</p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/10 p-4">
                  <p className="text-sm text-white/60">Next action follow up</p>
                  <p className="mt-2 text-2xl font-semibold">{followUpCount}</p>
                </div>
                <p className="text-sm leading-7 text-white/74">Prioritaskan item merah lebih dulu, lalu booking mendekat yang masih pending.</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">
                <Filter className="h-3.5 w-3.5" />
                Filter reminder
              </div>
              <p className="mt-3 text-lg font-semibold">Fokuskan inbox operasional</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Saring berdasarkan keyword, prioritas, atau jenis reminder untuk sesi review yang lebih cepat.</p>
            </div>
            <form className="grid gap-3 lg:min-w-[740px] lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]" method="get">
              <div className="form-field">
                <span className="form-label">Keyword</span>
                <Input name="q" defaultValue={q} placeholder="Cari customer / layanan / judul reminder" />
              </div>
              <div className="form-field">
                <span className="form-label">Prioritas</span>
                <Select name="priority" defaultValue={priority}>
                  <option value="">Semua prioritas</option>
                  <option value="high">Prioritas tinggi</option>
                  <option value="medium">Prioritas menengah</option>
                  <option value="low">Prioritas ringan</option>
                </Select>
              </div>
              <div className="form-field">
                <span className="form-label">Tipe</span>
                <Select name="type" defaultValue={type}>
                  <option value="">Semua tipe</option>
                  <option value="follow-up">Follow up</option>
                  <option value="appointment">Booking terdekat</option>
                </Select>
              </div>
              <button type="submit" className={buttonVariants("secondary", "lg:mb-0.5")}>Terapkan</button>
            </form>
          </div>
        </Card>

        {reminders.length === 0 ? (
          <EmptyState
            title="Belum ada reminder yang cocok"
            description="Coba ubah filter, atau isi next action follow up pada booking agar reminder muncul di sini."
            action={<Link href="/follow-ups" className={buttonVariants("primary")}>Buka follow-up board</Link>}
          />
        ) : (
          <div className="grid gap-4">
            {reminders.map((item) => (
              <Card key={`${item.type}-${item.booking.id}-${item.dueAt}`} className="p-5">
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.08em]", priorityStyles[item.priority])}>
                        {priorityLabels[item.priority]}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-slate-600">
                        {item.type === "follow-up" ? "Follow up" : "Booking terdekat"}
                      </span>
                      <StatusBadge status={item.booking.status} />
                      <FollowUpBadge status={item.booking.followUpStatus ?? "none"} />
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold">{item.title}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">{item.detail}</p>
                      </div>
                      <div className="rounded-[20px] border border-[var(--border)] bg-white/80 px-4 py-3 text-sm">
                        <p className="text-[var(--muted)]">Jatuh tempo</p>
                        <p className="mt-1 font-semibold">{formatDateTimeLabel(item.dueAt)}</p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <div className="surface-card rounded-[22px] p-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                          <p className="text-sm text-[var(--muted)]">Customer</p>
                        </div>
                        <p className="mt-2 font-semibold">{item.booking.customerName}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">{item.booking.phone}</p>
                      </div>
                      <div className="surface-card rounded-[22px] p-4">
                        <div className="flex items-center gap-2">
                          <ListTodo className="h-4 w-4 text-[var(--primary)]" />
                          <p className="text-sm text-[var(--muted)]">Layanan</p>
                        </div>
                        <p className="mt-2 font-semibold">{item.booking.serviceName}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">Status follow up: {item.booking.followUpStatus ?? "none"}</p>
                      </div>
                      <div className="surface-card rounded-[22px] p-4">
                        <div className="flex items-center gap-2">
                          <CalendarClock className="h-4 w-4 text-[var(--primary)]" />
                          <p className="text-sm text-[var(--muted)]">Jadwal booking</p>
                        </div>
                        <p className="mt-2 font-semibold">{item.booking.date}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">{item.booking.time}{item.booking.endTime ? ` - ${item.booking.endTime}` : ""}</p>
                      </div>
                      <div className="surface-card rounded-[22px] p-4">
                        <div className="flex items-center gap-2">
                          <BellRing className="h-4 w-4 text-[var(--primary)]" />
                          <p className="text-sm text-[var(--muted)]">Catatan aktif</p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{item.booking.followUpNote || item.booking.notes || "Belum ada catatan tambahan."}</p>
                      </div>
                    </div>
                  </div>

                  <div className="surface-card rounded-[24px] p-4">
                    <p className="text-sm font-semibold">Aksi cepat</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">Update follow up langsung dari reminder center atau buka halaman detail untuk konteks penuh.</p>
                    <div className="mt-4">
                      <FollowUpForm
                        booking={item.booking}
                        redirectTo={`/reminders${q || priority || type ? `?${new URLSearchParams({ ...(q ? { q } : {}), ...(priority ? { priority } : {}), ...(type ? { type } : {}) }).toString()}` : ""}`}
                        compact
                        submitLabel="Update reminder"
                      />
                    </div>
                    <Link href={`/bookings/${item.booking.id}`} className={buttonVariants("ghost", "mt-4 w-full justify-center")}>
                      Lihat detail booking
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
