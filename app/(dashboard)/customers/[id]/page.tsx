import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BellRing,
  CalendarClock,
  CircleDollarSign,
  ClipboardList,
  Mail,
  MessageSquareShare,
  PhoneCall,
  Sparkles,
  UserRound
} from "lucide-react";
import { SubmitButton } from "@/components/forms/submit-button";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { FollowUpBadge, StatusBadge, getFollowUpStatusLabel } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Textarea } from "@/components/ui/textarea";
import { updateCustomer } from "@/lib/actions";
import { getCustomerDetail, getOwnerBusiness } from "@/lib/data";
import { getFeedbackFromSearchParams } from "@/lib/feedback";
import { formatCurrency, formatDateTimeLabel, formatDurationLabel } from "@/lib/utils";

function buildCustomerSearch(basePath: string, keyword: string) {
  return `${basePath}?${new URLSearchParams({ q: keyword }).toString()}`;
}

export default async function CustomerDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const [business, detail] = await Promise.all([getOwnerBusiness(), getCustomerDetail(id)]);

  if (!detail) {
    notFound();
  }

  const feedback = getFeedbackFromSearchParams(resolvedSearchParams);
  const redirectTo = `/customers/${detail.customer.id}`;
  const customerKeyword = detail.customer.phone || detail.customer.name;
  const nextActionLabel = detail.nextAction ? getFollowUpStatusLabel(detail.nextAction.status) : "Belum ada";

  return (
    <DashboardShell activePath="/customers" bookingLink={business.bookingLink}>
      <div className="space-y-6 xl:space-y-7">
        <FeedbackBanner feedback={feedback} />

        <Card className="premium-panel overflow-hidden p-6 sm:p-8 xl:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-4xl">
              <Link href="/customers" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
                <ArrowLeft className="h-4 w-4" />
                Kembali ke customer
              </Link>
              <PageHeader
                className="mt-4"
                eyebrow="Customer Detail"
                title={detail.customer.name}
                description="CRM-lite owner-facing untuk membaca histori booking, follow up aktif, dan konteks relasi customer tanpa keluar dari dashboard internal."
                actions={
                  <>
                    <Link href={buildCustomerSearch("/bookings", customerKeyword)} className={buttonVariants("secondary")}>Lihat bookings</Link>
                    <Link href={buildCustomerSearch("/follow-ups", customerKeyword)} className={buttonVariants("secondary")}>Follow-up terkait</Link>
                    <Link href={buildCustomerSearch("/reminders", customerKeyword)} className={buttonVariants("secondary")}>Reminder terkait</Link>
                  </>
                }
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">
                {(detail.stats.totalBookings ?? 0) > 1 ? "Repeat customer" : "Lead tersimpan"}
              </span>
              {detail.nextAction ? <FollowUpBadge status={detail.nextAction.status} /> : null}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="soft-stat rounded-[24px] p-4">
              <p className="text-sm text-[var(--muted)]">Total booking</p>
              <p className="mt-2 text-2xl font-semibold">{detail.stats.totalBookings}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{detail.stats.completedBookings} selesai • {detail.stats.pendingBookings} pending</p>
            </div>
            <div className="soft-stat rounded-[24px] p-4">
              <p className="text-sm text-[var(--muted)]">Total value</p>
              <p className="mt-2 text-2xl font-semibold">{formatCurrency(detail.stats.totalSpent)}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Rata-rata {formatCurrency(detail.stats.averageOrderValue)}</p>
            </div>
            <div className="soft-stat rounded-[24px] p-4">
              <p className="text-sm text-[var(--muted)]">Recent activity</p>
              <p className="mt-2 text-lg font-semibold">{formatDateTimeLabel(detail.stats.recentActivityAt)}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Booking terakhir {formatDateTimeLabel(detail.stats.latestBookingAt)}</p>
            </div>
            <div className="soft-stat rounded-[24px] p-4">
              <p className="text-sm text-[var(--muted)]">Next action</p>
              <p className="mt-2 text-lg font-semibold">{formatDateTimeLabel(detail.nextAction?.dueAt)}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{nextActionLabel}</p>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.08fr)_400px]">
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <span className="icon-chip">
                  <UserRound className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold">Profil customer</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Kontak inti, source lead, dan konteks dasar customer untuk operasional harian.</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="surface-card rounded-[22px] p-4">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="h-4 w-4 text-[var(--primary)]" />
                    <p className="text-sm text-[var(--muted)]">WhatsApp</p>
                  </div>
                  <p className="mt-2 font-semibold">{detail.customer.phone}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[var(--primary)]" />
                    <p className="text-sm text-[var(--muted)]">Email</p>
                  </div>
                  <p className="mt-2 font-semibold">{detail.customer.email || "-"}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                    <p className="text-sm text-[var(--muted)]">Source</p>
                  </div>
                  <p className="mt-2 font-semibold">{detail.customer.source || "-"}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-[var(--primary)]" />
                    <p className="text-sm text-[var(--muted)]">Upcoming</p>
                  </div>
                  <p className="mt-2 font-semibold">{detail.stats.upcomingBookings}</p>
                </div>
              </div>

              <div className="mt-4 rounded-[22px] border border-dashed border-[var(--border)] bg-white/70 p-4">
                <div className="flex items-center gap-2">
                  <MessageSquareShare className="h-4 w-4 text-[var(--primary)]" />
                  <p className="text-sm font-semibold">Catatan customer</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">
                  {detail.customer.notes?.trim() ? detail.customer.notes : "Belum ada catatan internal untuk customer ini."}
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <span className="icon-chip">
                  <ClipboardList className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold">Histori booking</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Booking terbaru customer ini, lengkap dengan status, nilai, assignment staff, dan pintasan ke detail booking.</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {detail.recentBookings.length === 0 ? (
                  <div className="rounded-[22px] border border-dashed border-[var(--border)] bg-white/60 p-4 text-sm text-[var(--muted)]">
                    Belum ada booking untuk customer ini.
                  </div>
                ) : (
                  detail.recentBookings.map((booking) => (
                    <div key={booking.id} className="surface-card rounded-[22px] p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">{booking.serviceName}</p>
                            <StatusBadge status={booking.status} />
                            <FollowUpBadge status={booking.followUpStatus ?? "none"} />
                          </div>
                          <p className="mt-2 text-sm text-[var(--muted)]">
                            {booking.date} • {booking.time}{booking.endTime ? ` - ${booking.endTime}` : ""} • {formatCurrency(booking.totalPrice ?? 0)}
                          </p>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {booking.assignedStaffName ? `Assigned ke ${booking.assignedStaffName}` : "Belum ada assignment staff"} • {formatDurationLabel(booking.totalDuration ?? booking.duration)}
                          </p>
                          <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">
                            {booking.followUpNote || booking.notes || "Belum ada catatan tambahan di booking ini."}
                          </p>
                        </div>
                        <Link href={`/bookings/${booking.id}`} className={buttonVariants("ghost", "justify-center whitespace-nowrap")}>
                          Detail booking
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
                  <BellRing className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold">Status follow up</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Lihat fokus aksi berikutnya dan lompat ke board atau reminder center saat perlu update cepat.</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Next action</p>
                  <p className="mt-2 text-lg font-semibold">{formatDateTimeLabel(detail.nextAction?.dueAt)}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{nextActionLabel}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Catatan aksi</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">
                    {detail.nextAction?.note || "Belum ada catatan follow up aktif untuk customer ini."}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link href={buildCustomerSearch("/follow-ups", customerKeyword)} className={buttonVariants("secondary", "justify-center")}>
                    Board follow-up
                  </Link>
                  <Link href={buildCustomerSearch("/reminders", customerKeyword)} className={buttonVariants("secondary", "justify-center")}>
                    Reminder center
                  </Link>
                </div>
                {detail.nextAction?.bookingId ? (
                  <Link href={`/bookings/${detail.nextAction.bookingId}`} className={buttonVariants("ghost", "w-full justify-center")}>
                    Buka booking pemicu
                  </Link>
                ) : null}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <span className="icon-chip">
                  <CircleDollarSign className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold">Ringkasan CRM</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Snapshot cepat untuk membaca kualitas relasi customer dan nilai bisnisnya.</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="soft-stat rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Completed bookings</p>
                  <p className="mt-2 text-xl font-semibold">{detail.stats.completedBookings}</p>
                </div>
                <div className="soft-stat rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Pending bookings</p>
                  <p className="mt-2 text-xl font-semibold">{detail.stats.pendingBookings}</p>
                </div>
                <div className="soft-stat rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Cancelled / no-show</p>
                  <p className="mt-2 text-xl font-semibold">{detail.stats.cancelledBookings}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <span className="icon-chip">
                  <UserRound className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold">Update profil</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Edit kontak, source, dan catatan langsung dari halaman detail customer.</p>
                </div>
              </div>

              <form action={updateCustomer} className="mt-5 space-y-4">
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <input type="hidden" name="customerId" value={detail.customer.id} />
                <div className="grid gap-4">
                  <Input name="name" defaultValue={detail.customer.name} required />
                  <Input name="phone" defaultValue={detail.customer.phone} required />
                  <Input name="email" type="email" defaultValue={detail.customer.email ?? ""} />
                  <Input name="source" defaultValue={detail.customer.source ?? ""} />
                  <Textarea name="notes" rows={5} defaultValue={detail.customer.notes ?? ""} placeholder="Catatan internal customer" />
                </div>
                <SubmitButton className="w-full">Simpan perubahan</SubmitButton>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
