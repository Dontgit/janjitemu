import Link from "next/link";
import { CalendarClock, Workflow } from "lucide-react";
import { FollowUpColumnCard } from "@/components/booking/follow-up-column-card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterShell } from "@/components/ui/filter-shell";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { getFollowUpBoardData, getOwnerBusiness } from "@/lib/data";
import { getSingleSearchParam } from "@/lib/search-params";

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

        <FilterShell
          title="Cari card yang relevan"
          description="Saring berdasarkan customer, WhatsApp, atau layanan untuk review follow up yang lebih fokus."
        >
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
        </FilterShell>

        {totalItems === 0 ? (
          <EmptyState
            title="Belum ada follow up aktif"
            description="Saat booking mulai diberi status follow up, card-nya akan muncul di board ini."
            action={<Link href="/bookings" className={buttonVariants("primary")}>Kelola bookings</Link>}
          />
        ) : (
          <div className="grid gap-4 2xl:grid-cols-5">
            {columns.map((column) => (
              <FollowUpColumnCard
                key={column.id}
                column={column}
                redirectTo={`/follow-ups${q || focus ? `?${new URLSearchParams({ ...(q ? { q } : {}), ...(focus ? { focus } : {}) }).toString()}` : ""}`}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
