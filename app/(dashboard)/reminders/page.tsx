import Link from "next/link";
import { BellRing } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ReminderCard } from "@/components/reminders/reminder-card";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterShell } from "@/components/ui/filter-shell";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { getOwnerBusiness, getReminderCenterData } from "@/lib/data";
import { getSingleSearchParam } from "@/lib/search-params";

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
      <div className="space-y-5 xl:space-y-6">
        <Card className="premium-panel p-5 sm:p-6 xl:p-8">
          <div className="space-y-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <span className="section-label">
                  <BellRing className="h-4 w-4" />
                  Reminder center
                </span>
                <PageHeader
                  className="mt-4"
                  eyebrow="Reminders"
                  title="Pantau next action dan booking terdekat"
                  description="Reminder center dibuat lebih ringkas agar owner punya satu inbox operasional yang mudah diprioritaskan tanpa panel yang terlalu berat."
                  actions={
                    <>
                      <Link href="/follow-ups" className={buttonVariants("secondary")}>
                        Follow-up board
                      </Link>
                      <Link href="/bookings" className={buttonVariants("secondary")}>
                        Semua bookings
                      </Link>
                    </>
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:min-w-[360px] xl:max-w-[460px] xl:flex-1">
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Total reminder</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{reminders.length}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Prioritas tinggi</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{highPriority}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4 sm:col-span-1 col-span-2">
                  <p className="text-sm text-[var(--muted)]">Booking terdekat</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{appointmentCount}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <FilterShell
          title="Fokuskan inbox operasional"
          description="Saring berdasarkan keyword, prioritas, atau jenis reminder untuk sesi review yang lebih cepat."
        >
          <form className="grid w-full gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_180px_180px_auto]" method="get">
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
            <button type="submit" className={buttonVariants("secondary", "w-full md:col-span-2 xl:w-fit")}>Terapkan</button>
          </form>
        </FilterShell>

        {reminders.length === 0 ? (
          <EmptyState
            title="Belum ada reminder yang cocok"
            description="Coba ubah filter, atau isi next action follow up pada booking agar reminder muncul di sini."
            action={<Link href="/follow-ups" className={buttonVariants("primary")}>Buka follow-up board</Link>}
          />
        ) : (
          <div className="grid gap-4">
            {reminders.map((item) => (
              <ReminderCard
                key={`${item.type}-${item.booking.id}-${item.dueAt}`}
                item={item}
                redirectTo={`/reminders${q || priority || type ? `?${new URLSearchParams({ ...(q ? { q } : {}), ...(priority ? { priority } : {}), ...(type ? { type } : {}) }).toString()}` : ""}`}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
