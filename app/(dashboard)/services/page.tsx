import { BriefcaseBusiness, Sparkles } from "lucide-react";
import { createService } from "@/lib/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { DashboardShell } from "@/components/layout/dashboard-shell";
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
import { ServiceCard } from "@/components/services/service-card";
import { getOwnerBusiness, getPaginatedServices, getServices } from "@/lib/data";
import { getFeedbackFromSearchParams } from "@/lib/feedback";
import { buildSearchPath, getSingleSearchParam, parsePaginationParams, replaceSearchParams } from "@/lib/search-params";
import { formatCurrency } from "@/lib/utils";

export default async function ServicesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [business, resolvedSearchParams, allServices] = await Promise.all([getOwnerBusiness(), searchParams, getServices()]);
  const feedback = getFeedbackFromSearchParams(resolvedSearchParams);
  const query = getSingleSearchParam(resolvedSearchParams.q).trim();
  const status = getSingleSearchParam(resolvedSearchParams.status);
  const { page, perPage } = parsePaginationParams(resolvedSearchParams);
  const services = await getPaginatedServices({ q: query, status, page, perPage });
  const primaryServiceOptions = allServices.filter((service) => !service.isAddon);
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
      <PageTutorial
        pageKey="services"
        pageTitle="Layanan"
        steps={[
          {
            title: "Rawat katalog layanan di satu tempat",
            description: "Bagian overview membantu membaca kesehatan katalog: total layanan, yang sedang aktif, dan yang ditandai populer untuk booking publik.",
            tip: "Layanan yang dijual ke publik harus tetap aktif.",
            targetSelector: '[data-tutorial="services-overview"]',
            targetLabel: "Snapshot katalog"
          },
          {
            title: "Tambah layanan baru dengan struktur lengkap",
            description: "Form ini dipakai untuk menyiapkan paket baru sejak awal, termasuk harga, durasi, deskripsi, label populer, dan aturan add-on.",
            tip: "Gunakan label populer untuk layanan unggulan yang ingin didorong.",
            targetSelector: '[data-tutorial="services-create"]',
            targetLabel: "Tambah layanan"
          },
          {
            title: "Edit tiap layanan tanpa pindah halaman",
            description: "Daftar layanan membantu update detail, menonaktifkan layanan, atau mengatur add-on langsung dari kartu yang sudah ada.",
            tip: "Sesudah edit, preview halaman publik untuk cek hasil akhir.",
            targetSelector: '[data-tutorial="services-list"]',
            targetLabel: "Daftar layanan"
          }
        ]}
      />
      <div className="space-y-6 xl:space-y-7">
        <FeedbackBanner feedback={feedback} />

        <Card data-tutorial="services-overview" className="premium-panel overflow-hidden p-6 sm:p-8 xl:p-10">
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
          <FilterShell
            title="Cari & filter layanan"
            description="Temukan layanan berdasarkan nama, deskripsi, atau status aktif supaya cepat tahu mana yang siap dipromosikan."
            footer={
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="soft-stat rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Data tampil</p>
                  <p className="mt-2 text-xl font-semibold">{services.items.length}</p>
                </div>
                <div className="soft-stat rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Filter aktif</p>
                  <p className="mt-2 text-xl font-semibold">{query || status ? "Ya" : "Belum ada"}</p>
                </div>
              </div>
            }
          >
            <form className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]" method="get">
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
          </FilterShell>

          <Card data-tutorial="services-create" className="p-6 sm:p-7">
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
              <div className="field-card rounded-[24px] p-4 md:col-span-2">
                <p className="text-sm font-semibold">Aturan add-on per layanan utama</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  Pilih layanan utama yang boleh memakai add-on ini. Biarkan kosong jika add-on boleh dipakai oleh semua layanan utama.
                </p>
                {primaryServiceOptions.length > 0 ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {primaryServiceOptions.map((option) => (
                      <label key={option.id} className="field-card flex items-start gap-3 rounded-2xl px-4 py-3 text-sm">
                        <input type="checkbox" name="allowedPrimaryServiceIds" value={option.id} />
                        <span>
                          <span className="block font-semibold text-[var(--foreground)]">{option.name}</span>
                          <span className="block text-[var(--muted)]">
                            {formatCurrency(option.price)} • {option.duration} menit
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[var(--muted)]">Belum ada layanan utama. Tambahkan layanan utama dulu jika ingin membatasi add-on secara spesifik.</p>
                )}
              </div>
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

        <div data-tutorial="services-list">
        {services.items.length === 0 ? (
          <EmptyState
            title="Belum ada layanan"
            description="Tambahkan layanan pertama agar halaman booking publik punya sesuatu untuk dijual."
          />
        ) : (
          <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
            {services.items.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                currentPath={currentPath}
                primaryServiceOptions={primaryServiceOptions}
              />
            ))}
          </div>
        )}
        </div>
      </div>
    </DashboardShell>
  );
}
