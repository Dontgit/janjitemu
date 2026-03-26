import { createBooking, deleteBooking, updateBookingStatus } from "@/lib/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { EmptyState } from "@/components/ui/empty-state";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getBookingSummary, getOwnerBusiness, getPaginatedBookings, getServices } from "@/lib/data";
import { getFeedbackFromSearchParams } from "@/lib/feedback";
import { buildSearchPath, getSingleSearchParam, parsePaginationParams, replaceSearchParams } from "@/lib/search-params";

export default async function BookingsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [business, resolvedSearchParams, services, summary] = await Promise.all([
    getOwnerBusiness(),
    searchParams,
    getServices(),
    getBookingSummary()
  ]);
  const query = getSingleSearchParam(resolvedSearchParams.q).trim();
  const status = getSingleSearchParam(resolvedSearchParams.status);
  const serviceFilter = getSingleSearchParam(resolvedSearchParams.serviceId);
  const { page, perPage } = parsePaginationParams(resolvedSearchParams);
  const paginatedBookings = await getPaginatedBookings({
    q: query,
    status,
    serviceId: serviceFilter,
    page,
    perPage
  });
  const feedback = getFeedbackFromSearchParams(resolvedSearchParams);
  const currentPath = buildSearchPath(
    "/bookings",
    Object.fromEntries(
      Object.entries(resolvedSearchParams).map(([key, value]) => [
        key,
        key === "page" ? String(paginatedBookings.page) : key === "perPage" ? String(paginatedBookings.perPage) : value
      ])
    )
  );

  return (
    <DashboardShell activePath="/bookings" bookingLink={business.bookingLink}>
      <div className="space-y-6">
        <FeedbackBanner feedback={feedback} />
        <Card className="p-6 sm:p-8">
          <PageHeader
            eyebrow="Booking Management"
            title="Kelola semua booking dari satu layar"
            description="Tambah booking manual, ubah status, reschedule, atau hapus booking yang salah input. Ini sudah mendekati flow owner sehari-hari untuk MVP."
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            {[
              { label: "Total", value: summary.total },
              { label: "Pending", value: summary.pending },
              { label: "Hari ini", value: summary.today },
              { label: "Upcoming", value: summary.upcoming }
            ].map((item) => (
              <div key={item.label} className="rounded-[24px] bg-white p-4">
                <p className="text-sm text-[var(--muted)]">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-lg font-semibold">Cari & filter booking</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Filter berdasarkan customer, nomor WhatsApp, layanan, atau status booking.</p>
            </div>
            <form className="grid gap-3 lg:min-w-[720px] lg:grid-cols-[minmax(0,1fr)_170px_220px_auto]" method="get">
              <input type="hidden" name="page" value="1" />
              <input type="hidden" name="perPage" value={paginatedBookings.perPage} />
              <Input name="q" placeholder="Cari customer / WhatsApp / layanan" defaultValue={query} />
              <Select name="status" defaultValue={status}>
                <option value="">Semua status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="rescheduled">Rescheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No-show</option>
              </Select>
              <Select name="serviceId" defaultValue={serviceFilter}>
                <option value="">Semua layanan</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </Select>
              <SubmitButton variant="secondary" className="lg:w-fit">Terapkan</SubmitButton>
            </form>
          </div>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Menampilkan {paginatedBookings.items.length} dari {paginatedBookings.total} booking.
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-lg font-semibold">Tambah booking manual</p>
          <form action={createBooking} className="mt-5 grid gap-4 md:grid-cols-2">
            <input type="hidden" name="redirectTo" value={currentPath} />
            <Input name="customerName" placeholder="Nama customer" required />
            <Input name="phone" placeholder="Nomor WhatsApp" required />
            <Input name="email" type="email" placeholder="Email (opsional)" />
            <Select name="serviceId" defaultValue={services[0]?.id}>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </Select>
            <Input name="date" type="date" required />
            <Input name="time" type="time" required />
            <div className="md:col-span-2">
              <Textarea name="notes" rows={3} placeholder="Catatan tambahan" />
            </div>
            <SubmitButton className="md:w-fit">Tambah booking</SubmitButton>
          </form>
        </Card>

        {paginatedBookings.total > 0 ? (
          <PaginationControls
            page={paginatedBookings.page}
            perPage={paginatedBookings.perPage}
            total={paginatedBookings.total}
            totalPages={paginatedBookings.totalPages}
            createPageHref={(nextPage) =>
              replaceSearchParams("/bookings", resolvedSearchParams, { page: nextPage, perPage: paginatedBookings.perPage })
            }
            createPerPageHref={(nextPerPage) =>
              replaceSearchParams("/bookings", resolvedSearchParams, { page: 1, perPage: nextPerPage })
            }
          />
        ) : null}

        {paginatedBookings.items.length === 0 ? (
          <EmptyState
            title="Belum ada booking"
            description="Tambahkan booking manual atau gunakan link publik untuk mulai mengisi kalender bisnis Anda."
          />
        ) : (
          <div className="grid gap-4">
            {paginatedBookings.items.map((booking) => (
              <div
                key={booking.id}
                className="rounded-[28px] border border-[var(--border)] bg-white p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2 lg:max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold">{booking.customerName}</p>
                      <StatusBadge status={booking.status} />
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {booking.id}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--muted)]">
                      {booking.serviceName} • {booking.date} • {booking.time}
                    </p>
                    <p className="text-sm text-[var(--muted)]">{booking.phone}{booking.email ? ` • ${booking.email}` : ""}</p>
                    {booking.notes ? (
                      <p className="text-sm leading-6 text-[var(--foreground)]">{booking.notes}</p>
                    ) : null}
                  </div>

                  <div className="grid gap-3 sm:min-w-[320px]">
                    <form action={updateBookingStatus} className="grid gap-2">
                      <input type="hidden" name="redirectTo" value={currentPath} />
                      <input type="hidden" name="bookingId" value={booking.id} />
                      <Select name="status" defaultValue={booking.status}>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="rescheduled">Rescheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no-show">No-show</option>
                      </Select>
                      <div className="grid grid-cols-2 gap-2">
                        <Input name="date" type="date" defaultValue={booking.date} />
                        <Input name="time" type="time" defaultValue={booking.time} />
                      </div>
                      <Textarea name="notes" rows={2} defaultValue={booking.notes} />
                      <SubmitButton variant="secondary">Simpan perubahan</SubmitButton>
                    </form>
                    <form action={deleteBooking}>
                      <input type="hidden" name="redirectTo" value={currentPath} />
                      <input type="hidden" name="bookingId" value={booking.id} />
                      <SubmitButton variant="ghost" className="w-full">Hapus booking</SubmitButton>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
