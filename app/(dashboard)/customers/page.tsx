import { createCustomer, deleteCustomer, updateCustomer } from "@/lib/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
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
  const [business, resolvedSearchParams] = await Promise.all([
    getOwnerBusiness(),
    searchParams
  ]);
  const feedback = getFeedbackFromSearchParams(resolvedSearchParams);
  const query = getSingleSearchParam(resolvedSearchParams.q).trim();
  const source = getSingleSearchParam(resolvedSearchParams.source).trim();
  const { page, perPage } = parsePaginationParams(resolvedSearchParams);
  const customers = await getPaginatedCustomers({
    q: query,
    source,
    page,
    perPage
  });
  const currentPath = buildSearchPath(
    "/customers",
    Object.fromEntries(
      Object.entries(resolvedSearchParams).map(([key, value]) => [
        key,
        key === "page" ? String(customers.page) : key === "perPage" ? String(customers.perPage) : value
      ])
    )
  );

  return (
    <DashboardShell activePath="/customers" bookingLink={business.bookingLink}>
      <div className="space-y-6">
        <FeedbackBanner feedback={feedback} />
        <Card className="p-6 sm:p-8">
          <PageHeader
            eyebrow="Customer"
            title="Daftar customer dan repeat visitor"
            description="Owner bisa menambah customer secara manual, memperbarui profil yang sudah ada, dan membersihkan data yang belum pernah punya booking."
          />
        </Card>

        <Card className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-lg font-semibold">Cari customer</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Filter cepat berdasarkan nama, WhatsApp, email, atau sumber lead.</p>
            </div>
            <form className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px_auto] lg:min-w-[560px]" method="get">
              <input type="hidden" name="page" value="1" />
              <input type="hidden" name="perPage" value={customers.perPage} />
              <Input name="q" placeholder="Cari nama / WhatsApp / email" defaultValue={query} />
              <Input name="source" placeholder="Filter sumber lead" defaultValue={source} />
              <SubmitButton variant="secondary" className="sm:w-fit">Terapkan</SubmitButton>
            </form>
          </div>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Menampilkan {customers.items.length} dari {customers.total} customer.
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-lg font-semibold">Tambah customer baru</p>
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

        {customers.total > 0 ? (
          <PaginationControls
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

        {customers.items.length === 0 ? (
          <EmptyState
            title="Belum ada customer"
            description="Customer akan muncul otomatis saat booking masuk atau bisa ditambahkan manual dari form di atas."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {customers.items.map((customer) => (
              <Card key={customer.id} className="p-6">
                <form action={updateCustomer} className="space-y-4">
                  <input type="hidden" name="redirectTo" value={currentPath} />
                  <input type="hidden" name="customerId" value={customer.id} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input name="name" defaultValue={customer.name} required />
                    <Input name="phone" defaultValue={customer.phone} required />
                    <Input name="email" type="email" defaultValue={customer.email ?? ""} />
                    <Input name="source" defaultValue={customer.source ?? ""} />
                  </div>
                  <Textarea name="notes" rows={3} defaultValue={customer.notes ?? ""} placeholder="Catatan customer" />

                  <div className="grid grid-cols-2 gap-3 rounded-[24px] bg-white p-4 text-sm">
                    <div>
                      <p className="text-[var(--muted)]">Total booking</p>
                      <p className="mt-1 font-semibold">{customer.bookingCount ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-[var(--muted)]">Booking terakhir</p>
                      <p className="mt-1 font-semibold">{formatDateTimeLabel(customer.lastBookingAt)}</p>
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
    </DashboardShell>
  );
}
