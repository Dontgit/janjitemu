import Link from "next/link";
import { CalendarRange, Filter, PencilLine, Plus, Trash2 } from "lucide-react";
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
import { PageTutorial } from "@/components/ui/page-tutorial";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { buttonVariants } from "@/components/ui/button";
import { getAssignableTeamMembers, getBookingSummary, getOwnerBusiness, getPaginatedBookings, getServices } from "@/lib/data";
import { formatDateTimeLabel } from "@/lib/utils";
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

        <Card data-tutorial="bookings-filter" className="p-6 xl:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">
                <Filter className="h-3.5 w-3.5" />
                Filter
              </div>
              <p className="mt-3 text-lg font-semibold">Cari & filter booking</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Filter berdasarkan customer, nomor WhatsApp, layanan, status booking, atau status follow up.</p>
            </div>
            <form className="grid gap-3 lg:min-w-[860px] lg:grid-cols-[minmax(0,1fr)_170px_190px_220px_auto]" method="get">
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
              <SubmitButton variant="secondary" className="lg:mb-0.5 lg:w-fit">Terapkan</SubmitButton>
            </form>
          </div>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Menampilkan {paginatedBookings.items.length} dari {paginatedBookings.total} booking.
          </p>
        </Card>

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
              <p className="mt-2 text-xs text-[var(--muted)]">Staff aktif diprioritaskan. Hint service fit hanya panduan, belum hard enforcement.</p>
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
              <Card
                key={booking.id}
                className="p-5"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 space-y-4 xl:max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold">{booking.customerName}</p>
                      <StatusBadge status={booking.status} />
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-slate-600">
                        {booking.id}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="surface-card rounded-[20px] px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Layanan</p>
                        <p className="mt-1 text-sm font-medium">{booking.serviceName}</p>
                      </div>
                      <div className="surface-card rounded-[20px] px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Jadwal</p>
                        <p className="mt-1 text-sm font-medium">{booking.date} • {booking.time}</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">{booking.endTime ? `Selesai estimasi ${booking.endTime}` : "Estimasi selesai belum tersedia"}</p>
                      </div>
                      <div className="surface-card rounded-[20px] px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Staff</p>
                        <p className="mt-1 break-words text-sm font-medium">{booking.assignedStaffName ?? "Belum di-assign"}</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">{booking.assignedStaffName ? booking.assignedStaffServiceFit === false ? "Di luar service fit staff ini" : booking.assignedStaffActive === false ? "Staff sedang nonaktif" : "Siap dipakai untuk operasional" : "Pilih staff dari panel update booking"}</p>
                      </div>
                      <div className="surface-card rounded-[20px] px-4 py-3 sm:col-span-2 lg:col-span-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Kontak</p>
                        <p className="mt-1 break-words text-sm font-medium">{booking.phone}{booking.email ? ` • ${booking.email}` : ""}</p>
                      </div>
                    </div>

                    {booking.addOns && booking.addOns.length > 0 ? (
                      <div className="rounded-[20px] border border-dashed border-[var(--border)] bg-white/70 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Add-on</p>
                        <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{booking.addOns.map((item) => item.name).join(', ')}</p>
                      </div>
                    ) : null}

                    {booking.notes ? (
                      <div className="rounded-[20px] border border-dashed border-[var(--border)] bg-white/70 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Catatan</p>
                        <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{booking.notes}</p>
                      </div>
                    ) : null}

                    <div className="rounded-[20px] border border-dashed border-[var(--border)] bg-white/70 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">After-sales / follow up</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">Status: {booking.followUpStatus ?? 'none'}</p>
                      {booking.followUpNote ? <p className="mt-1 text-sm leading-6 text-[var(--foreground)]">{booking.followUpNote}</p> : null}
                      <p className="mt-1 text-sm text-[var(--muted)]">Next action: {formatDateTimeLabel(booking.followUpNextActionAt)}</p>
                    </div>
                    <Link href={`/bookings/${booking.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
                      Lihat detail booking
                    </Link>
                  </div>

                  <div className="grid gap-3 xl:min-w-[360px] xl:max-w-[380px] xl:flex-1">
                    <form action={updateBookingStatus} className="surface-card grid gap-3 rounded-[24px] p-4">
                      <input type="hidden" name="redirectTo" value={currentPath} />
                      <input type="hidden" name="bookingId" value={booking.id} />
                      <div className="flex items-center gap-2">
                        <span className="icon-chip h-10 w-10 rounded-[14px]">
                          <PencilLine className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold">Update booking</p>
                          <p className="text-xs text-[var(--muted)]">Status, tanggal, jam, dan catatan</p>
                        </div>
                      </div>
                      <div className="form-field">
                        <span className="form-label">Status</span>
                        <Select name="status" defaultValue={booking.status}>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="rescheduled">Rescheduled</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="no-show">No-show</option>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="form-field">
                          <span className="form-label">Tanggal</span>
                          <Input name="date" type="date" defaultValue={booking.date} />
                        </div>
                        <div className="form-field">
                          <span className="form-label">Jam</span>
                          <Input name="time" type="time" defaultValue={booking.time} />
                        </div>
                      </div>
                      <div className="form-field">
                        <span className="form-label">Assign staff</span>
                        <Select name="assignedTeamMemberId" defaultValue={booking.assignedTeamMemberId ?? "unassigned"}>
                          <option value="unassigned">Belum di-assign</option>
                          {assignableTeamMembers.map((member) => (
                            <option key={member.id} value={member.id}>
                              {member.name} • {member.roleLabel}{member.serviceFit ? "" : " • di luar service fit"}{typeof member.dailyLoad === "number" ? ` • ${member.dailyLoad} booking hari itu` : ""}
                            </option>
                          ))}
                        </Select>
                        <p className="mt-2 text-xs text-[var(--muted)]">Hint kapasitas harian dihitung ringan dari jumlah booking staff di tanggal yang sama.</p>
                      </div>
                      <div className="form-field">
                        <span className="form-label">Catatan</span>
                        <Textarea name="notes" rows={2} defaultValue={booking.notes} />
                      </div>
                      <div className="form-field">
                        <span className="form-label">Follow up status</span>
                        <Select name="followUpStatus" defaultValue={booking.followUpStatus ?? 'none'}>
                          <option value="none">Belum perlu follow up</option>
                          <option value="needs-follow-up">Perlu follow up</option>
                          <option value="contacted">Sudah dihubungi</option>
                          <option value="offer-sent">Penawaran dikirim</option>
                          <option value="won">Deal / berhasil</option>
                          <option value="lost">Belum berhasil</option>
                        </Select>
                      </div>
                      <div className="form-field">
                        <span className="form-label">Follow up note</span>
                        <Textarea name="followUpNote" rows={2} defaultValue={booking.followUpNote ?? ''} />
                      </div>
                      <div className="form-field">
                        <span className="form-label">Next action</span>
                        <Input name="followUpNextActionAt" type="datetime-local" defaultValue={booking.followUpNextActionAt ? booking.followUpNextActionAt.slice(0, 16) : ''} />
                      </div>
                      <SubmitButton variant="secondary">Simpan perubahan</SubmitButton>
                    </form>
                    <form action={deleteBooking}>
                      <input type="hidden" name="redirectTo" value={currentPath} />
                      <input type="hidden" name="bookingId" value={booking.id} />
                      <SubmitButton variant="ghost" className="w-full justify-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Hapus booking
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>
    </DashboardShell>
  );
}
