import { BriefcaseBusiness, Gem, Search, Sparkles, TimerReset } from "lucide-react";
import { createService, deleteService, updateService } from "@/lib/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card } from "@/components/ui/card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getOwnerBusiness, getPaginatedServices } from "@/lib/data";
import { getFeedbackFromSearchParams } from "@/lib/feedback";
import { buildSearchPath, getSingleSearchParam, parsePaginationParams, replaceSearchParams } from "@/lib/search-params";
import { formatCurrency } from "@/lib/utils";

export default async function ServicesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [business, resolvedSearchParams] = await Promise.all([getOwnerBusiness(), searchParams]);
  const feedback = getFeedbackFromSearchParams(resolvedSearchParams);
  const query = getSingleSearchParam(resolvedSearchParams.q).trim();
  const status = getSingleSearchParam(resolvedSearchParams.status);
  const { page, perPage } = parsePaginationParams(resolvedSearchParams);
  const services = await getPaginatedServices({ q: query, status, page, perPage });
  const currentPath = buildSearchPath(
    "/services",
    Object.fromEntries(
      Object.entries(resolvedSearchParams).map(([key, value]) => [
        key,
        key === "page" ? String(services.page) : key === "perPage" ? String(services.perPage) : value
      ])
    )
  );

  const activeCount = services.items.filter((service) => service.active ?? true).length;
  const popularCount = services.items.filter((service) => service.popular).length;

  return (
    <DashboardShell activePath="/services" bookingLink={business.bookingLink}>
      <div className="space-y-6 xl:space-y-7">
        <FeedbackBanner feedback={feedback} />

        <Card className="premium-panel overflow-hidden p-6 sm:p-8 xl:p-10">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
            <div>
              <span className="section-label">
                <Sparkles className="h-4 w-4" />
                Service catalog
              </span>
              <PageHeader
                className="mt-4"
                eyebrow="Services"
                title="Daftar layanan yang siap dijual"
                description="Setiap layanan punya durasi, harga, status aktif, dan label populer. Semua terasa seperti satu sistem premium yang sama dengan dashboard overview dan halaman booking publik."
              />
            </div>
            <div className="surface-card rounded-[28px] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">Catalog snapshot</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                {[
                  ["Total layanan", String(services.total)],
                  ["Sedang aktif", String(activeCount)],
                  ["Label populer", String(popularCount)]
                ].map(([label, value]) => (
                  <div key={label} className="soft-stat rounded-[22px] p-4">
                    <p className="text-sm text-[var(--muted)]">{label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <span className="icon-chip">
                <Search className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-semibold">Cari & filter layanan</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Temukan layanan berdasarkan nama, deskripsi, atau status aktif supaya cepat tahu mana yang siap dipromosikan.</p>
              </div>
            </div>
            <form className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]" method="get">
              <input type="hidden" name="page" value="1" />
              <input type="hidden" name="perPage" value={services.perPage} />
              <Input name="q" placeholder="Cari nama / deskripsi layanan" defaultValue={query} />
              <Select name="status" defaultValue={status}>
                <option value="">Semua status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </Select>
              <SubmitButton variant="secondary" className="sm:w-fit">
                Terapkan
              </SubmitButton>
            </form>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="soft-stat rounded-[22px] p-4">
                <p className="text-sm text-[var(--muted)]">Data tampil</p>
                <p className="mt-2 text-xl font-semibold">{services.items.length}</p>
              </div>
              <div className="soft-stat rounded-[22px] p-4">
                <p className="text-sm text-[var(--muted)]">Filter aktif</p>
                <p className="mt-2 text-xl font-semibold">{query || status ? "Ya" : "Belum ada"}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <span className="icon-chip">
                <BriefcaseBusiness className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-semibold">Tambah layanan baru</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Masukkan paket baru dengan harga, durasi, dan deskripsi yang siap tampil konsisten di dashboard maupun halaman booking publik.</p>
              </div>
            </div>
            <form action={createService} className="mt-5 grid gap-4 md:grid-cols-2">
              <input type="hidden" name="redirectTo" value={currentPath} />
              <Input name="name" placeholder="Nama layanan" required />
              <Input name="duration" type="number" min="15" step="15" placeholder="Durasi (menit)" required />
              <Input name="price" type="number" min="0" step="1000" placeholder="Harga" required />
              <label className="field-card flex items-center gap-3 rounded-2xl px-4 py-3 text-sm">
                <input type="checkbox" name="popular" />
                Tandai sebagai populer
              </label>
              <label className="field-card flex items-center gap-3 rounded-2xl px-4 py-3 text-sm">
                <input type="checkbox" name="isAddon" />
                Ini add-on / layanan tambahan
              </label>
              <div className="md:col-span-2">
                <Textarea name="description" placeholder="Deskripsi singkat layanan" rows={4} required />
              </div>
              <SubmitButton className="md:w-fit">Tambah layanan</SubmitButton>
            </form>
          </Card>
        </div>

        {services.total > 0 ? (
          <PaginationControls
            className="surface-card border-none bg-white/85"
            page={services.page}
            perPage={services.perPage}
            total={services.total}
            totalPages={services.totalPages}
            createPageHref={(nextPage) =>
              replaceSearchParams("/services", resolvedSearchParams, { page: nextPage, perPage: services.perPage })
            }
            createPerPageHref={(nextPerPage) =>
              replaceSearchParams("/services", resolvedSearchParams, { page: 1, perPage: nextPerPage })
            }
          />
        ) : null}

        {services.items.length === 0 ? (
          <EmptyState
            title="Belum ada layanan"
            description="Tambahkan layanan pertama agar halaman booking publik punya sesuatu untuk dijual."
          />
        ) : (
          <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
            {services.items.map((service) => (
              <Card key={service.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold tracking-tight">{service.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{formatCurrency(service.price)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {service.isAddon ? (
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
                        add-on
                      </span>
                    ) : null}
                    {service.popular ? (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                        populer
                      </span>
                    ) : null}
                  </div>
                </div>

                <form action={updateService} className="mt-5 space-y-4">
                  <input type="hidden" name="redirectTo" value={currentPath} />
                  <input type="hidden" name="serviceId" value={service.id} />
                  <div className="space-y-3">
                    <Input name="name" defaultValue={service.name} required />
                    <Textarea name="description" rows={4} defaultValue={service.description} required />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="soft-stat rounded-[22px] p-4 text-sm">
                      <div className="mb-2 flex items-center gap-2 text-[var(--muted)]">
                        <TimerReset className="h-4 w-4 text-[var(--primary)]" />
                        Durasi
                      </div>
                      <Input name="duration" type="number" min="15" step="15" defaultValue={service.duration} />
                    </div>
                    <div className="soft-stat rounded-[22px] p-4 text-sm">
                      <div className="mb-2 flex items-center gap-2 text-[var(--muted)]">
                        <Gem className="h-4 w-4 text-[var(--primary)]" />
                        Harga
                      </div>
                      <Input name="price" type="number" min="0" step="1000" defaultValue={service.price} />
                      <p className="mt-2 text-xs text-[var(--muted)]">{formatCurrency(service.price)}</p>
                    </div>
                  </div>

                  <div className="field-card rounded-[24px] p-4">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" name="active" defaultChecked={service.active ?? true} />
                        Aktif di booking publik
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" name="popular" defaultChecked={service.popular} />
                        Populer
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" name="isAddon" defaultChecked={service.isAddon} />
                        Add-on
                      </label>
                    </div>
                  </div>

                  <SubmitButton variant="secondary" className="w-full">
                    Simpan perubahan
                  </SubmitButton>
                </form>
                <form action={deleteService} className="mt-3">
                  <input type="hidden" name="redirectTo" value={currentPath} />
                  <input type="hidden" name="serviceId" value={service.id} />
                  <SubmitButton variant="ghost" className="w-full">
                    Hapus / nonaktifkan
                  </SubmitButton>
                </form>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
