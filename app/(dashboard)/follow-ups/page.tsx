import Link from "next/link";
import { Workflow } from "lucide-react";
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
      <div className="space-y-5 xl:space-y-6">
        <Card className="premium-panel p-5 sm:p-6 xl:p-8">
          <div className="space-y-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <span className="section-label">
                  <Workflow className="h-4 w-4" />
                  Follow-up board
                </span>
                <PageHeader
                  className="mt-4"
                  eyebrow="Pipeline"
                  title="Kelola pipeline follow up booking"
                  description="Board follow up dibuat lebih ringkas supaya owner lebih cepat membaca prioritas harian dan memindahkan booking dari konfirmasi ke closing."
                  actions={
                    <>
                      <Link href="/bookings" className={buttonVariants("secondary")}>
                        Semua bookings
                      </Link>
                      <Link href="/reminders" className={buttonVariants("secondary")}>
                        Reminder center
                      </Link>
                    </>
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:min-w-[360px] xl:max-w-[460px] xl:flex-1">
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Total card</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{totalItems}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Perlu aksi hari ini</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{dueToday}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4 sm:col-span-1 col-span-2">
                  <p className="text-sm text-[var(--muted)]">Mode board</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{focus === "closing" ? "Closing" : "Aktif"}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <FilterShell
          title="Cari card yang relevan"
          description="Saring berdasarkan customer, WhatsApp, atau layanan untuk review follow up yang lebih fokus."
        >
          <form className="grid w-full gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_180px_auto]" method="get">
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
            <button type="submit" className={buttonVariants("secondary", "w-full md:col-span-2 xl:w-fit")}>Terapkan</button>
          </form>
        </FilterShell>

        {totalItems === 0 ? (
          <EmptyState
            title="Belum ada follow up aktif"
            description="Saat booking mulai diberi status follow up, card-nya akan muncul di board ini."
            action={<Link href="/bookings" className={buttonVariants("primary")}>Kelola bookings</Link>}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
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
