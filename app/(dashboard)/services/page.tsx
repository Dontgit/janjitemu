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
  const [business, resolvedSearchParams] = await Promise.all([
    getOwnerBusiness(),
    searchParams
  ]);
  const feedback = getFeedbackFromSearchParams(resolvedSearchParams);
  const query = getSingleSearchParam(resolvedSearchParams.q).trim();
  const status = getSingleSearchParam(resolvedSearchParams.status);
  const { page, perPage } = parsePaginationParams(resolvedSearchParams);
  const services = await getPaginatedServices({
    q: query,
    status,
    page,
    perPage
  });
  const currentPath = buildSearchPath(
    "/services",
    Object.fromEntries(
      Object.entries(resolvedSearchParams).map(([key, value]) => [
        key,
        key === "page" ? String(services.page) : key === "perPage" ? String(services.perPage) : value
      ])
    )
  );

  return (
    <DashboardShell activePath="/services" bookingLink={business.bookingLink}>
      <div className="space-y-6">
        <FeedbackBanner feedback={feedback} />
        <Card className="p-6 sm:p-8">
          <PageHeader
            eyebrow="Services"
            title="Daftar layanan yang siap dijual"
            description="Setiap layanan punya durasi, harga, status aktif, dan label populer. Semua form langsung tersambung ke Prisma supaya flow CRUD lebih terasa nyata."
          />
        </Card>

        <Card className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-lg font-semibold">Cari & filter layanan</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Temukan layanan berdasarkan nama, deskripsi, atau status aktif.</p>
            </div>
            <form className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto] lg:min-w-[520px]" method="get">
              <input type="hidden" name="page" value="1" />
              <input type="hidden" name="perPage" value={services.perPage} />
              <Input name="q" placeholder="Cari nama / deskripsi layanan" defaultValue={query} />
              <Select name="status" defaultValue={status}>
                <option value="">Semua status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </Select>
              <SubmitButton variant="secondary" className="sm:w-fit">Terapkan</SubmitButton>
            </form>
          </div>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Menampilkan {services.items.length} dari {services.total} layanan.
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-lg font-semibold">Tambah layanan baru</p>
          <form action={createService} className="mt-5 grid gap-4 md:grid-cols-2">
            <input type="hidden" name="redirectTo" value={currentPath} />
            <Input name="name" placeholder="Nama layanan" required />
            <Input name="duration" type="number" min="15" step="15" placeholder="Durasi (menit)" required />
            <Input name="price" type="number" min="0" step="1000" placeholder="Harga" required />
            <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm">
              <input type="checkbox" name="popular" />
              Tandai sebagai populer
            </label>
            <div className="md:col-span-2">
              <Textarea name="description" placeholder="Deskripsi singkat layanan" rows={4} required />
            </div>
            <SubmitButton className="md:w-fit">Tambah layanan</SubmitButton>
          </form>
        </Card>

        {services.total > 0 ? (
          <PaginationControls
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
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {services.items.map((service) => (
              <Card key={service.id} className="p-6">
                <form action={updateService} className="space-y-4">
                  <input type="hidden" name="redirectTo" value={currentPath} />
                  <input type="hidden" name="serviceId" value={service.id} />
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <Input name="name" defaultValue={service.name} required />
                      <Textarea name="description" rows={4} defaultValue={service.description} required />
                    </div>
                    {service.popular ? (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                        populer
                      </span>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-2 gap-3 rounded-[24px] bg-white p-4 text-sm">
                    <div>
                      <p className="mb-2 text-[var(--muted)]">Durasi</p>
                      <Input name="duration" type="number" min="15" step="15" defaultValue={service.duration} />
                    </div>
                    <div>
                      <p className="mb-2 text-[var(--muted)]">Harga</p>
                      <Input name="price" type="number" min="0" step="1000" defaultValue={service.price} />
                      <p className="mt-2 text-xs text-[var(--muted)]">{formatCurrency(service.price)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="active" defaultChecked={service.active ?? true} />
                      Aktif di booking publik
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="popular" defaultChecked={service.popular} />
                      Populer
                    </label>
                  </div>
                  <SubmitButton variant="secondary" className="w-full">Simpan perubahan</SubmitButton>
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
