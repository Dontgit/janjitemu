import Link from "next/link";
import { CalendarClock, Search, Sparkles, Workflow } from "lucide-react";
import { FollowUpForm } from "@/components/booking/follow-up-form";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { FollowUpBadge, StatusBadge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { getFollowUpBoardData, getOwnerBusiness } from "@/lib/data";
import { getSingleSearchParam } from "@/lib/search-params";
import { formatDateTimeLabel } from "@/lib/utils";

export default async function FollowUpsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const q = getSingleSearchParam(resolvedSearchParams.q);
  const focus = getSingleSearchParam(resolvedSearchParams.focus) as "active" | "closing" | "";
  const [business, columns] = await Promise.all([
    getOwnerBusiness(),
    getFollowUpBoardData({ q, focus: focus || "active" })
  ]);
  const totalItems = columns.reduce((sum, column) => sum + column.items.length, 0);
  const dueToday = columns.reduce(
    (sum, column) =>
      sum +
      column.items.filter((item) => {
        if (!item.followUpNextActionAt) return false;
        const due = new Date(item.followUpNextActionAt);
        const now = new Date();
        return due.toDateString() === now.toDateString();
      }).length,
    0
  );

  return (
    <DashboardShell activePath="/follow-ups" bookingLink={business.bookingLink}>
      <div className="space-y-6 xl:space-y-7">
        <Card className="premium-panel overflow-hidden p-6 sm:p-8 xl:p-10">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div>
              <span className="section-label">
                <Workflow className="h-4 w-4" />
                Follow-up board
              </span>
              <PageHeader
                className="mt-4"
                eyebrow="Pipeline"
                title="Kelola pipeline follow up booking"
                description="Board ini memakai data follow up yang sama dengan halaman bookings, tetapi dirapikan per tahap supaya owner lebih cepat memindahkan booking dari konfirmasi ke closing."
                actions={
                  <>
                    <Link href="/bookings" className={buttonVariants("secondary")}>Semua bookings</Link>
                    <Link href="/reminders" className={buttonVariants("secondary")}>Reminder center</Link>
                  </>
                }
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="soft-stat rounded-[24px] p-4">
                  <p className="text-sm text-[var(--muted)]">Total card</p>
                  <p className="mt-2 text-2xl font-semibold">{totalItems}</p>
                </div>
                <div className="soft-stat rounded-[24px] p-4">
                  <p className="text-sm text-[var(--muted)]">Perlu aksi hari ini</p>
                  <p className="mt-2 text-2xl font-semibold">{dueToday}</p>
                </div>
                <div className="soft-stat rounded-[24px] p-4">
                  <p className="text-sm text-[var(--muted)]">Mode board</p>
                  <p className="mt-2 text-2xl font-semibold">{focus === "closing" ? "Closing" : "Aktif"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] bg-[#14312c] p-6 text-white shadow-[0_24px_55px_rgba(20,49,44,0.22)]">
              <p className="text-sm uppercase tracking-[0.18em] text-white/60">Cara pakai</p>
              <div className="mt-6 space-y-3 text-sm leading-7 text-white/74">
                <p>Gunakan mode aktif untuk konfirmasi dan nurturing harian.</p>
                <p>Pindah ke mode closing saat ingin fokus pada penawaran yang sudah dekat keputusan.</p>
                <p>Setiap kartu bisa diupdate langsung tanpa kembali ke halaman detail.</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">
                <Search className="h-3.5 w-3.5" />
                Filter board
              </div>
              <p className="mt-3 text-lg font-semibold">Cari card yang relevan</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Saring berdasarkan customer, WhatsApp, atau layanan untuk review follow up yang lebih fokus.</p>
            </div>
            <form className="grid gap-3 lg:min-w-[520px] lg:grid-cols-[minmax(0,1fr)_180px_auto]" method="get">
              <div className="form-field">
                <span className="form-label">Keyword</span>
                <Input name="q" defaultValue={q} placeholder="Cari customer / layanan / WhatsApp" />
              </div>
              <div className="form-field">
                <span className="form-label">Mode</span>
                <Select name="focus" defaultValue={focus || "active"}>
                  <option value="active">Pipeline aktif</option>
                  <option value="closing">Closing view</option>
                </Select>
              </div>
              <button type="submit" className={buttonVariants("secondary", "lg:mb-0.5")}>Terapkan</button>
            </form>
          </div>
        </Card>

        {totalItems === 0 ? (
          <EmptyState
            title="Belum ada follow up aktif"
            description="Saat booking mulai diberi status follow up, card-nya akan muncul di board ini."
            action={<Link href="/bookings" className={buttonVariants("primary")}>Kelola bookings</Link>}
          />
        ) : (
          <div className="grid gap-4 2xl:grid-cols-5">
            {columns.map((column) => (
              <Card key={column.id} className="flex flex-col p-4">
                <div className="rounded-[22px] bg-white/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{column.label}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{column.description}</p>
                    </div>
                    <span className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                      {column.items.length}
                    </span>
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  {column.items.length === 0 ? (
                    <div className="rounded-[22px] border border-dashed border-[var(--border)] bg-white/50 p-4 text-sm text-[var(--muted)]">
                      Belum ada card di tahap ini.
                    </div>
                  ) : (
                    column.items.map((booking) => (
                      <div key={booking.id} className="surface-card rounded-[24px] p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{booking.customerName}</p>
                          <StatusBadge status={booking.status} />
                        </div>
                        <p className="mt-2 text-sm text-[var(--muted)]">{booking.serviceName}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <FollowUpBadge status={booking.followUpStatus ?? "none"} />
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-slate-600">
                            {booking.date} • {booking.time}
                          </span>
                        </div>
                        <div className="mt-4 rounded-[20px] border border-dashed border-[var(--border)] bg-white/70 p-3 text-sm text-[var(--muted)]">
                          <p>Next action: {formatDateTimeLabel(booking.followUpNextActionAt)}</p>
                          <p className="mt-1">{booking.followUpNote || "Belum ada catatan follow up."}</p>
                        </div>
                        <div className="mt-4">
                          <FollowUpForm booking={booking} redirectTo={`/follow-ups${q || focus ? `?${new URLSearchParams({ ...(q ? { q } : {}), ...(focus ? { focus } : {}) }).toString()}` : ""}`} compact submitLabel="Update card" />
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                          <span className="text-[var(--muted)]">{booking.phone}</span>
                          <Link href={`/bookings/${booking.id}`} className="font-semibold text-[var(--primary)]">
                            Detail booking
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
