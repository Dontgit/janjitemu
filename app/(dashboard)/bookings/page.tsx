import Link from "next/link";
import { CalendarRange, Plus } from "lucide-react";
import { createBooking } from "@/lib/actions";
import { BookingCard } from "@/components/bookings/booking-card";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card } from "@/components/ui/card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { EmptyState } from "@/components/ui/empty-state";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { FilterShell } from "@/components/ui/filter-shell";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { PageTutorial } from "@/components/ui/page-tutorial";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { buttonVariants } from "@/components/ui/button";
import { getAssignableTeamMembers, getBookingSummary, getOwnerBusiness, getPaginatedBookings, getServices } from "@/lib/data";
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
  const mainServices = services.filter((service) => !service.isAddon);
  const addOnServices = services.filter((service) => service.isAddon);
  const query = getSingleSearchParam(resolvedSearchParams.q).trim();
  const status = getSingleSearchParam(resolvedSearchParams.status);
  const followUpStatus = getSingleSearchParam(resolvedSearchParams.followUpStatus);
  const serviceFilter = getSingleSearchParam(resolvedSearchParams.serviceId);
  const { page, perPage } = parsePaginationParams(resolvedSearchParams);
  const assignableTeamMembers = await getAssignableTeamMembers();
  const paginatedBookings = await getPaginatedBookings({
    q: query,
    status,
    followUpStatus,
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
      <PageTutorial
        pageKey="bookings"
        pageTitle="Bookings"
        steps={[
          {
            title: "Filter dulu kalau datanya mulai ramai",
            description: "Bagian ini dipakai untuk menyaring booking berdasarkan customer, WhatsApp, layanan, status booking, dan status follow up dalam satu layar.",
            tip: "Kombinasi keyword + status cocok untuk mencari booking pending yang harus ditindak hari ini.",
            targetSelector: '[data-tutorial="bookings-filter"]',
            targetLabel: "Filter booking"
          },
          {
            title: "Tambah booking manual saat perlu",
            description: "Form ini berguna untuk walk-in, order via chat, atau input admin. Semua detail dasar booking bisa diisi tanpa pindah halaman.",
            tip: "Kalau booking datang dari link publik, area ini biasanya dipakai hanya untuk kasus manual.",
            targetSelector: '[data-tutorial="bookings-create"]',
            targetLabel: "Tambah booking"
          },
          {
            title: "Kelola status dan follow up dari kartu booking",
            description: "Area daftar booking dipakai untuk membaca status terbaru, jadwal terdekat, serta action lanjutan seperti update status atau follow up note.",
            tip: "Prioritaskan kartu dengan jadwal paling dekat atau status pending.",
            targetSelector: '[data-tutorial="bookings-list"]',
            targetLabel: "Daftar booking"
          }
        ]}
      />
      <div className="space-y-6 xl:space-y-7">
        <FeedbackBanner feedback={feedback} />
        <Card className="premium-panel p-6 sm:p-8 xl:p-10">
          <PageHeader
            eyebrow="Booking Management"
            title="Kelola semua booking dari satu layar"
            description="Tambah booking manual, ubah status, reschedule, atau hapus booking yang salah input. Ini sudah mendekati flow owner sehari-hari untuk MVP."
            actions={
              <>
                <Link href="/follow-ups" className={buttonVariants("secondary")}>Follow-up board</Link>
                <Link href="/reminders" className={buttonVariants("secondary")}>Reminder center</Link>
              </>
            }
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total", value: summary.total },
              { label: "Pending", value: summary.pending },
              { label: "Hari ini", value: summary.today },
              { label: "Upcoming", value: summary.upcoming }
            ].map((item) => (
              <div key={item.label} className="surface-card rounded-[24px] p-4">
                <p className="text-sm text-[var(--muted)]">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>

        <div data-tutorial="bookings-filter">
          <FilterShell
            title="Cari & filter booking"
            description="Filter berdasarkan customer, nomor WhatsApp, layanan, status booking, atau status follow up."
            footer={
              <>Menampilkan {paginatedBookings.items.length} dari {paginatedBookings.total} booking.</>
            }
          >
            <form className="grid w-full gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.15fr)_170px_190px_220px]" method="get">
              <input type="hidden" name="page" value="1" />
              <input type="hidden" name="perPage" value={paginatedBookings.perPage} />
              <div className="form-field">
                <span className="form-label">Keyword</span>
                <Input name="q" placeholder="Cari customer / WhatsApp / layanan" defaultValue={query} />
              </div>
              <div className="form-field">
                <span className="form-label">Status</span>
                <Select name="status" defaultValue={status}>
                  <option value="">Semua status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No-show</option>
                </Select>
              </div>
              <div className="form-field">
                <span className="form-label">Follow up</span>
                <Select name="followUpStatus" defaultValue={followUpStatus}>
                  <option value="">Semua follow up</option>
                  <option value="none">Belum perlu</option>
                  <option value="needs-follow-up">Perlu follow up</option>
                  <option value="contacted">Sudah dihubungi</option>
                  <option value="offer-sent">Penawaran dikirim</option>
                  <option value="won">Deal / berhasil</option>
                  <option value="lost">Belum berhasil</option>
                </Select>
              </div>
              <div className="form-field">
                <span className="form-label">Layanan</span>
                <Select name="serviceId" defaultValue={serviceFilter}>
                  <option value="">Semua layanan</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </Select>
              </div>
              <SubmitButton variant="secondary" className="w-full md:col-span-2 xl:col-span-4 xl:w-fit">Terapkan</SubmitButton>
            </form>
          </FilterShell>
        </div>

        <Card data-tutorial="bookings-create" className="p-6 xl:p-7">
          <div className="flex items-center gap-3">
            <span className="icon-chip">
              <Plus className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-semibold">Tambah booking manual</p>
              <p className="text-sm text-[var(--muted)]">Cocok untuk walk-in, booking via chat, atau follow up admin.</p>
            </div>
          </div>
          <form action={createBooking} className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <input type="hidden" name="redirectTo" value={currentPath} />
            <div className="form-field">
              <span className="form-label">Nama customer</span>
              <Input name="customerName" placeholder="Nama customer" required />
            </div>
            <div className="form-field">
              <span className="form-label">WhatsApp</span>
              <Input name="phone" placeholder="Nomor WhatsApp" required />
            </div>
            <div className="form-field">
              <span className="form-label">Email</span>
              <Input name="email" type="email" placeholder="Email (opsional)" />
            </div>
            <div className="form-field">
              <span className="form-label">Layanan</span>
              <Select name="serviceId" defaultValue={mainServices[0]?.id}>
                {mainServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="form-field">
              <span className="form-label">Tanggal</span>
              <Input name="date" type="date" required />
            </div>
            <div className="form-field">
              <span className="form-label">Jam</span>
              <Input name="time" type="time" required />
            </div>
            <div className="form-field">
              <span className="form-label">Assign staff</span>
              <Select name="assignedTeamMemberId" defaultValue="unassigned">
                <option value="unassigned">Belum di-assign</option>
                {assignableTeamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} • {member.roleLabel}{member.serviceFit ? "" : " • di luar service fit"}
                  </option>
                ))}
              </Select>
              <p className="mt-2 text-xs text-[var(--muted)]">Staff aktif diprioritaskan. Saat submit, sistem sekarang akan menolak assignment staff yang bentrok dengan booking lain, di luar weekly availability, atau sedang diblok di blocked dates. Hint service fit tetap jadi panduan operasional.</p>
            </div>
            {addOnServices.length > 0 ? (
              <div className="form-field md:col-span-2 xl:col-span-3">
                <span className="form-label">Add-on tambahan</span>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {addOnServices.map((service) => (
                    <label key={service.id} className="field-card flex items-center justify-between gap-3 rounded-[20px] px-4 py-3 text-sm">
                      <span>
                        <span className="font-medium">{service.name}</span>
                        <span className="mt-1 block text-[var(--muted)]">+{service.duration} menit • {service.price.toLocaleString('id-ID')}</span>
                      </span>
                      <input type="checkbox" name="addOnIds" value={service.id} />
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="form-field md:col-span-2 xl:col-span-3">
              <span className="form-label">Catatan</span>
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

        <div data-tutorial="bookings-list">
        {paginatedBookings.items.length === 0 ? (
          <EmptyState
            title="Belum ada booking"
            description="Tambahkan booking manual atau gunakan link publik untuk mulai mengisi kalender bisnis Anda."
          />
        ) : (
          <div className="grid gap-4">
            {paginatedBookings.items.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                currentPath={currentPath}
                assignableTeamMembers={assignableTeamMembers}
              />
            ))}
          </div>
        )}
        </div>
      </div>
    </DashboardShell>
  );
}
