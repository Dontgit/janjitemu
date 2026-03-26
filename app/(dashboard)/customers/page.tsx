import { Search, UserPlus, Users, Repeat, MessageCircleMore } from "lucide-react";
import { createCustomer, deleteCustomer, updateCustomer } from "@/lib/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { PageTutorial } from "@/components/ui/page-tutorial";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Textarea } from "@/components/ui/textarea";
import { getOwnerBusiness, getPaginatedCustomers } from "@/lib/data";
import { getFeedbackFromSearchParams } from "@/lib/feedback";
import { buildSearchPath, getSingleSearchParam, parsePaginationParams, replaceSearchParams } from "@/lib/search-params";
import { formatDateTimeLabel } from "@/lib/utils";

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
            title: "Gunakan halaman ini sebagai CRM ringan",
            description: "Panel snapshot membantu membaca total lead, customer yang sudah booking, dan repeat customer. Ini berguna untuk melihat kualitas basis customer secara cepat.",
            tip: "Kalau lagi cari peluang promo, mulai dari repeat customer.",
            targetSelector: '[data-tutorial="customers-overview"]',
            targetLabel: "Snapshot customer"
          },
          {
            title: "Cari berdasarkan sumber atau kontak",
            description: "Area filter dipakai untuk menyaring customer berdasarkan nama, kontak, atau source lead supaya segmentasi follow up lebih cepat.",
            tip: "Isi source secara konsisten agar channel acquisition lebih mudah dibaca.",
            targetSelector: '[data-tutorial="customers-filter"]',
            targetLabel: "Cari customer"
          },
          {
            title: "Simpan catatan yang berguna untuk repeat order",
            description: "Kartu customer dipakai untuk merapikan profil, mencatat histori singkat, dan menyimpan konteks internal supaya layanan berikutnya terasa lebih personal.",
            tip: "Jangan hapus customer yang sudah punya histori booking kalau masih ingin menjaga jejak relasi.",
            targetSelector: '[data-tutorial="customers-list"]',
            targetLabel: "Daftar customer"
          }
        ]}
      />
      <div className="space-y-6 xl:space-y-7">
        <FeedbackBanner feedback={feedback} />

        <Card data-tutorial="customers-overview" className="premium-panel overflow-hidden p-6 sm:p-8 xl:p-10">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
            <div>
              <span className="section-label">
                <Users className="h-4 w-4" />
                Customer CRM
              </span>
              <PageHeader
                className="mt-4"
                eyebrow="Customer"
                title="Daftar customer dan repeat visitor"
                description="Kelola lead yang masuk dari booking, rapikan profil customer, dan pertahankan relasi dengan repeat visitor dari satu workspace yang terasa konsisten dengan dashboard utama."
              />
            </div>
            <div className="surface-card rounded-[28px] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">Customer snapshot</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                {[
                  ["Total tersimpan", String(customers.total)],
                  ["Sudah pernah booking", String(customersWithBookings)],
                  ["Repeat customer", String(repeatLeads)]
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
          <Card data-tutorial="customers-filter" className="p-6">
            <div className="flex items-start gap-4">
              <span className="icon-chip">
                <Search className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-semibold">Cari customer</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Filter cepat berdasarkan nama, WhatsApp, email, atau sumber lead untuk follow up yang lebih rapi.</p>
              </div>
            </div>
            <form className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px_auto]" method="get">
              <input type="hidden" name="page" value="1" />
              <input type="hidden" name="perPage" value={customers.perPage} />
              <Input name="q" placeholder="Cari nama / WhatsApp / email" defaultValue={query} />
              <Input name="source" placeholder="Filter sumber lead" defaultValue={source} />
              <SubmitButton variant="secondary" className="sm:w-fit">
                Terapkan
              </SubmitButton>
            </form>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="soft-stat rounded-[22px] p-4">
                <p className="text-sm text-[var(--muted)]">Data tampil</p>
                <p className="mt-2 text-xl font-semibold">{customers.items.length}</p>
              </div>
              <div className="soft-stat rounded-[22px] p-4">
                <p className="text-sm text-[var(--muted)]">Filter aktif</p>
                <p className="mt-2 text-xl font-semibold">{query || source ? "Ya" : "Belum ada"}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 sm:p-7">
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
          <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
            {customers.items.map((customer) => (
              <Card key={customer.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold tracking-tight">{customer.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{customer.phone}</p>
                  </div>
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">
                    {(customer.bookingCount ?? 0) > 1 ? "Repeat" : "Lead"}
                  </span>
                </div>

                <form action={updateCustomer} className="mt-5 space-y-4">
                  <input type="hidden" name="redirectTo" value={currentPath} />
                  <input type="hidden" name="customerId" value={customer.id} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input name="name" defaultValue={customer.name} required />
                    <Input name="phone" defaultValue={customer.phone} required />
                    <Input name="email" type="email" defaultValue={customer.email ?? ""} />
                    <Input name="source" defaultValue={customer.source ?? ""} />
                  </div>
                  <Textarea name="notes" rows={3} defaultValue={customer.notes ?? ""} placeholder="Catatan customer" />

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="soft-stat rounded-[22px] p-4 text-sm">
                      <p className="text-[var(--muted)]">Total booking</p>
                      <p className="mt-2 text-lg font-semibold">{customer.bookingCount ?? 0}</p>
                    </div>
                    <div className="soft-stat rounded-[22px] p-4 text-sm sm:col-span-2">
                      <p className="text-[var(--muted)]">Booking terakhir</p>
                      <p className="mt-2 font-semibold">{formatDateTimeLabel(customer.lastBookingAt)}</p>
                    </div>
                  </div>

                  <div className="field-card rounded-[24px] p-4 text-sm text-[var(--muted)]">
                    <div className="flex items-start gap-3">
                      <MessageCircleMore className="mt-0.5 h-4 w-4 text-[var(--primary)]" />
                      <p>{customer.notes?.trim() ? customer.notes : "Belum ada catatan internal untuk customer ini."}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <SubmitButton variant="secondary">Update customer</SubmitButton>
                  </div>
                </form>
                <form action={deleteCustomer} className="mt-3">
                  <input type="hidden" name="redirectTo" value={currentPath} />
                  <input type="hidden" name="customerId" value={customer.id} />
                  <SubmitButton variant="ghost" className="w-full" disabled={(customer.bookingCount ?? 0) > 0}>
                    {(customer.bookingCount ?? 0) > 0 ? "Tidak bisa hapus: sudah punya booking" : "Hapus customer"}
                  </SubmitButton>
                </form>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>
    </DashboardShell>
  );
}
