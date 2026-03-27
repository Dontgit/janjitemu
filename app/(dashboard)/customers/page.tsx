import { UserPlus, Users } from "lucide-react";
import { createCustomer } from "@/lib/actions";
import { CustomerCard } from "@/components/customers/customer-card";
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
import { Textarea } from "@/components/ui/textarea";
import { getOwnerBusiness, getPaginatedCustomers } from "@/lib/data";
import { getFeedbackFromSearchParams } from "@/lib/feedback";
import { buildSearchPath, getSingleSearchParam, parsePaginationParams, replaceSearchParams } from "@/lib/search-params";

export default async function CustomersPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [business, resolvedSearchParams] = await Promise.all([getOwnerBusiness(), searchParams]);
  const feedback = getFeedbackFromSearchParams(resolvedSearchParams);
  const query = getSingleSearchParam(resolvedSearchParams.q).trim();
  const source = getSingleSearchParam(resolvedSearchParams.source).trim();
  const { page, perPage } = parsePaginationParams(resolvedSearchParams);
  const customers = await getPaginatedCustomers({ q: query, source, page, perPage });
  const currentPath = buildSearchPath(
    "/customers",
    Object.fromEntries(
      Object.entries(resolvedSearchParams).map(([key, value]) => [
        key,
        key === "page" ? String(customers.page) : key === "perPage" ? String(customers.perPage) : value
      ])
    )
  );

  const customersWithBookings = customers.items.filter((customer) => (customer.bookingCount ?? 0) > 0).length;
  const repeatLeads = customers.items.filter((customer) => (customer.bookingCount ?? 0) > 1).length;

  return (
    <DashboardShell activePath="/customers" bookingLink={business.bookingLink}>
      <PageTutorial
        pageKey="customers"
        pageTitle="Customer"
        steps={[
          {
            title: "Mulai dari ringkasan customer",
            description: "Halaman customer sekarang dibuat lebih ringkas supaya owner cepat membaca total lead, repeat customer, dan customer yang sudah pernah booking.",
            tip: "Kalau mau kirim promo atau follow up, mulai dari repeat customer lebih dulu.",
            targetSelector: '[data-tutorial="customers-overview"]',
            targetLabel: "Snapshot customer"
          },
          {
            title: "Filter dan tambah customer tanpa layout berat",
            description: "Filter dan form create dibuat lebih seimbang supaya tetap nyaman di mobile dan tidak terasa terlalu padat di desktop.",
            tip: "Gunakan source secara konsisten supaya akuisisi customer lebih mudah dibaca nanti.",
            targetSelector: '[data-tutorial="customers-filter"]',
            targetLabel: "Filter & create"
          },
          {
            title: "Kelola relasi dari daftar yang lebih ringan",
            description: "Daftar customer dipertahankan sebagai area kerja utama tanpa section yang berlebihan di atasnya.",
            tip: "Simpan catatan yang benar-benar berguna untuk repeat order berikutnya.",
            targetSelector: '[data-tutorial="customers-list"]',
            targetLabel: "Daftar customer"
          }
        ]}
      />

      <div className="space-y-5 xl:space-y-6">
        <FeedbackBanner feedback={feedback} />

        <Card data-tutorial="customers-overview" className="premium-panel p-5 sm:p-6 xl:p-8">
          <div className="space-y-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <span className="section-label">
                  <Users className="h-4 w-4" />
                  Customer CRM
                </span>
                <PageHeader
                  className="mt-4"
                  eyebrow="Customer"
                  title="Daftar customer dan repeat visitor"
                  description="Kelola lead yang masuk dari booking, rapikan profil customer, dan jaga relasi tanpa layout yang terlalu berat."
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:min-w-[360px] xl:max-w-[460px] xl:flex-1">
                {[
                  ["Total tersimpan", String(customers.total)],
                  ["Sudah booking", String(customersWithBookings)],
                  ["Repeat customer", String(repeatLeads)]
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

        <div data-tutorial="customers-filter" className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
          <FilterShell
            title="Cari customer"
            description="Filter cepat berdasarkan nama, WhatsApp, email, atau sumber lead untuk follow up yang lebih rapi."
            footer={
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="soft-stat rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Data tampil</p>
                  <p className="mt-2 text-xl font-semibold">{customers.items.length}</p>
                </div>
                <div className="soft-stat rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Filter aktif</p>
                  <p className="mt-2 text-xl font-semibold">{query || source ? "Ya" : "Belum ada"}</p>
                </div>
              </div>
            }
          >
            <form className="grid w-full gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_220px_auto]" method="get">
              <input type="hidden" name="page" value="1" />
              <input type="hidden" name="perPage" value={customers.perPage} />
              <Input name="q" placeholder="Cari nama / WhatsApp / email" defaultValue={query} />
              <Input name="source" placeholder="Filter sumber lead" defaultValue={source} />
              <SubmitButton variant="secondary" className="w-full md:col-span-2 xl:w-fit">
                Terapkan
              </SubmitButton>
            </form>
          </FilterShell>

          <Card className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span className="icon-chip">
                <UserPlus className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-semibold">Tambah customer baru</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Masukkan data dasar customer supaya histori booking, kontak, dan catatan internal tetap terkumpul di satu tempat.</p>
              </div>
            </div>
            <form action={createCustomer} className="mt-5 grid gap-4 md:grid-cols-2">
              <input type="hidden" name="redirectTo" value={currentPath} />
              <Input name="name" placeholder="Nama customer" required />
              <Input name="phone" placeholder="Nomor WhatsApp" required />
              <Input name="email" type="email" placeholder="Email (opsional)" />
              <Input name="source" placeholder="Sumber lead: Instagram, referral, dll." />
              <div className="md:col-span-2">
                <Textarea name="notes" rows={3} placeholder="Catatan internal customer" />
              </div>
              <SubmitButton className="md:w-fit">Simpan customer</SubmitButton>
            </form>
          </Card>
        </div>

        {customers.total > 0 ? (
          <PaginationControls
            className="surface-card border-none bg-white/85"
            page={customers.page}
            perPage={customers.perPage}
            total={customers.total}
            totalPages={customers.totalPages}
            createPageHref={(nextPage) =>
              replaceSearchParams("/customers", resolvedSearchParams, { page: nextPage, perPage: customers.perPage })
            }
            createPerPageHref={(nextPerPage) =>
              replaceSearchParams("/customers", resolvedSearchParams, { page: 1, perPage: nextPerPage })
            }
          />
        ) : null}

        <div data-tutorial="customers-list">
          {customers.items.length === 0 ? (
            <EmptyState
              title="Belum ada customer"
              description="Customer akan muncul otomatis saat booking masuk atau bisa ditambahkan manual dari form di atas."
            />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
              {customers.items.map((customer) => (
                <CustomerCard key={customer.id} customer={customer} currentPath={currentPath} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
