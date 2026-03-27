import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, CircleDollarSign, Layers3, MessageSquareShare, PhoneCall, Sparkles } from "lucide-react";
import { FollowUpForm } from "@/components/booking/follow-up-form";
import { SubmitButton } from "@/components/forms/submit-button";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { FollowUpBadge, StatusBadge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateBookingStatus } from "@/lib/actions";
import { getAssignableTeamMembers, getBookingDetail, getOwnerBusiness } from "@/lib/data";
import { formatCurrency, formatDateTimeLabel, formatDurationLabel, formatLongDate } from "@/lib/utils";

export default async function BookingDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const [business, detail] = await Promise.all([getOwnerBusiness(), getBookingDetail(resolvedParams.id)]);

  if (!detail) {
    notFound();
  }

  const { booking, customer, relatedBookings, stats } = detail;
  const assignableTeamMembers = await getAssignableTeamMembers({
    serviceId: booking.serviceId,
    date: booking.date,
    time: booking.time,
    endTime: booking.endTime,
    ignoredBookingId: booking.id,
    includeInactiveAssignedTeamMemberId: booking.assignedTeamMemberId
  });
  const redirectTo = `/bookings/${booking.id}`;

  return (
    <DashboardShell activePath="/bookings" bookingLink={business.bookingLink}>
      <div className="space-y-6 xl:space-y-7">
        <Card className="premium-panel overflow-hidden p-6 sm:p-8 xl:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-4xl">
              <Link href="/bookings" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
                <ArrowLeft className="h-4 w-4" />
                Kembali ke bookings
              </Link>
              <PageHeader
                className="mt-4"
                eyebrow="Booking Detail"
                title={`${booking.customerName} • ${booking.serviceName}`}
                description="Halaman detail ini merangkum konteks booking, histori customer, dan action yang paling relevan tanpa harus kembali ke daftar."
                actions={
                  <>
                    <Link href="/follow-ups" className={buttonVariants("secondary")}>Buka follow-up board</Link>
                    <Link href="/reminders" className={buttonVariants("secondary")}>Buka reminder center</Link>
                  </>
                }
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={booking.status} />
              <FollowUpBadge status={booking.followUpStatus ?? "none"} />
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="soft-stat rounded-[24px] p-4">
              <p className="text-sm text-[var(--muted)]">Jadwal</p>
              <p className="mt-2 text-lg font-semibold">{formatLongDate(booking.date)}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{booking.time}{booking.endTime ? ` - ${booking.endTime}` : ""}</p>
            </div>
            <div className="soft-stat rounded-[24px] p-4">
              <p className="text-sm text-[var(--muted)]">Nilai booking</p>
              <p className="mt-2 text-lg font-semibold">{formatCurrency(booking.totalPrice ?? 0)}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{formatDurationLabel(booking.totalDuration ?? booking.duration)}</p>
            </div>
            <div className="soft-stat rounded-[24px] p-4">
              <p className="text-sm text-[var(--muted)]">Total booking customer</p>
              <p className="mt-2 text-lg font-semibold">{stats.totalBookings}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{stats.completedBookings} selesai • {stats.pendingBookings} pending</p>
            </div>
            <div className="soft-stat rounded-[24px] p-4">
              <p className="text-sm text-[var(--muted)]">Next action</p>
              <p className="mt-2 text-lg font-semibold">{formatDateTimeLabel(booking.followUpNextActionAt)}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Terakhir update {formatDateTimeLabel(booking.updatedAt)}</p>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.08fr)_400px]">
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <span className="icon-chip">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold">Ringkasan booking</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Context inti untuk membaca booking ini dengan cepat sebelum update status atau follow up.</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Kontak customer</p>
                  <p className="mt-2 font-semibold">{booking.customerName}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{booking.phone}</p>
                  {booking.email ? <p className="mt-1 text-sm text-[var(--muted)]">{booking.email}</p> : null}
                </div>
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Paket layanan</p>
                  <p className="mt-2 font-semibold">{booking.serviceName}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{formatDurationLabel(booking.duration)} dasar • total {formatDurationLabel(booking.totalDuration ?? booking.duration)}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{formatCurrency(booking.totalPrice ?? 0)}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Assigned staff</p>
                  <p className="mt-2 font-semibold">{booking.assignedStaffName ?? "Belum di-assign"}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{booking.assignedStaffName ? booking.assignedStaffServiceFit === false ? "Staff ini belum ditandai menangani layanan tersebut." : booking.assignedStaffActive === false ? "Staff saat ini nonaktif." : "Assignment terlihat sehat untuk operasional V1." : "Pilih staff dari panel update booking di kanan."}</p>
                </div>
              </div>

              {booking.addOns && booking.addOns.length > 0 ? (
                <div className="mt-4 rounded-[22px] border border-dashed border-[var(--border)] bg-white/70 p-4">
                  <div className="flex items-center gap-2">
                    <Layers3 className="h-4 w-4 text-[var(--primary)]" />
                    <p className="text-sm font-semibold">Add-on terpasang</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {booking.addOns.map((item) => (
                      <span key={item.id} className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-sm font-medium text-[var(--primary)]">
                        {item.name} • {formatCurrency(item.price)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {booking.notes ? (
                <div className="mt-4 rounded-[22px] border border-dashed border-[var(--border)] bg-white/70 p-4">
                  <div className="flex items-center gap-2">
                    <MessageSquareShare className="h-4 w-4 text-[var(--primary)]" />
                    <p className="text-sm font-semibold">Catatan internal</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">{booking.notes}</p>
                </div>
              ) : null}
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <span className="icon-chip">
                  <PhoneCall className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold">Context customer</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Histori singkat customer ini untuk membantu follow up yang lebih relevan.</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Nama</p>
                  <p className="mt-2 font-semibold">{customer?.name ?? booking.customerName}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Source lead</p>
                  <p className="mt-2 font-semibold">{customer?.source || "-"}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Lifetime value</p>
                  <p className="mt-2 font-semibold">{formatCurrency(stats.totalSpent)}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Booking terbaru</p>
                  <p className="mt-2 font-semibold">{formatDateTimeLabel(stats.latestBookingAt)}</p>
                </div>
              </div>

              {customer?.notes ? (
                <div className="mt-4 rounded-[22px] border border-dashed border-[var(--border)] bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Catatan customer</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">{customer.notes}</p>
                </div>
              ) : null}

              <div className="mt-5 space-y-3">
                {relatedBookings.length === 0 ? (
                  <div className="rounded-[22px] border border-dashed border-[var(--border)] bg-white/60 p-4 text-sm text-[var(--muted)]">
                    Belum ada histori booking lain dari customer ini.
                  </div>
                ) : (
                  relatedBookings.map((item) => (
                    <div key={item.id} className="surface-card rounded-[22px] p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">{item.serviceName}</p>
                            <StatusBadge status={item.status} />
                          </div>
                          <p className="mt-2 text-sm text-[var(--muted)]">{item.date} • {item.time} • {formatCurrency(item.totalPrice ?? 0)}</p>
                        </div>
                        <Link href={`/bookings/${item.id}`} className="text-sm font-semibold text-[var(--primary)]">
                          Lihat detail
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <span className="icon-chip">
                  <CalendarClock className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold">Update booking</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Kelola status operasional, jadwal, dan catatan inti dari satu panel.</p>
                </div>
              </div>

              <form action={updateBookingStatus} className="mt-5 grid gap-3">
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <input type="hidden" name="bookingId" value={booking.id} />
                <div className="form-field">
                  <span className="form-label">Status booking</span>
                  <Select name="status" defaultValue={booking.status}>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="rescheduled">Rescheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No-show</option>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
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
                        {member.name} • {member.roleLabel}
                        {member.assignmentWarnings && member.assignmentWarnings.length > 0
                          ? ` • ${member.assignmentWarnings.join(" • ")}`
                          : typeof member.dailyLoad === "number"
                            ? ` • ${member.dailyLoad} booking hari itu`
                            : ""}
                      </option>
                    ))}
                  </Select>
                  <p className="mt-2 text-xs text-[var(--muted)]">Urutan staff diprioritaskan yang tidak bentrok, masih available di weekly schedule, tidak sedang diblok manual, cocok layanan, lalu workload harian paling ringan. Simpan akan ditolak kalau staff bentrok, diblok, atau di luar jam availability.</p>
                </div>
                <div className="form-field">
                  <span className="form-label">Catatan</span>
                  <Textarea name="notes" rows={3} defaultValue={booking.notes} />
                </div>
                <input type="hidden" name="followUpStatus" value={booking.followUpStatus ?? "none"} />
                <input type="hidden" name="followUpNote" value={booking.followUpNote ?? ""} />
                <input type="hidden" name="followUpNextActionAt" value={booking.followUpNextActionAt ? booking.followUpNextActionAt.slice(0, 16) : ""} />
                <SubmitButton>Simpan perubahan booking</SubmitButton>
              </form>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <span className="icon-chip">
                  <CircleDollarSign className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold">Follow up & next action</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Fokus untuk after-sales, konfirmasi, atau langkah berikutnya tanpa mengubah jadwal booking.</p>
                </div>
              </div>
              <div className="mt-5">
                <FollowUpForm booking={booking} redirectTo={redirectTo} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
