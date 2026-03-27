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

        <FilterShell
          title="Fokuskan inbox operasional"
          description="Saring berdasarkan keyword, prioritas, atau jenis reminder untuk sesi review yang lebih cepat."
        >
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
