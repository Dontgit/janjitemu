import Link from "next/link";
import { PencilLine, Trash2 } from "lucide-react";
import { deleteBooking, updateBookingStatus } from "@/lib/actions";
import { formatDateTimeLabel } from "@/lib/utils";
import { SubmitButton } from "@/components/forms/submit-button";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BookingStatus } from "@/lib/types";

type AssignableTeamMember = {
  id: string;
  name: string;
  roleLabel: string;
  serviceFit?: boolean;
  dailyLoad?: number | null;
};

type BookingCardProps = {
  booking: {
    id: string;
    customerName: string;
    status: BookingStatus;
    serviceName: string;
    date: string;
    time: string;
    endTime?: string | null;
    assignedStaffName?: string | null;
    assignedStaffServiceFit?: boolean | null;
    assignedStaffActive?: boolean | null;
    assignedTeamMemberId?: string | null;
    phone: string;
    email?: string | null;
    notes?: string | null;
    addOns?: { id: string; name: string }[];
    followUpStatus?: string | null;
    followUpNote?: string | null;
    followUpNextActionAt?: string | null;
  };
  currentPath: string;
  assignableTeamMembers: AssignableTeamMember[];
};

export function BookingCard({ booking, currentPath, assignableTeamMembers }: BookingCardProps) {
  return (
    <Card className="p-5">
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
              <p className="mt-1 text-xs text-[var(--muted)]">
                {booking.assignedStaffName
                  ? booking.assignedStaffServiceFit === false
                    ? "Di luar service fit staff ini"
                    : booking.assignedStaffActive === false
                      ? "Staff sedang nonaktif"
                      : "Siap dipakai untuk operasional"
                  : "Pilih staff dari panel update booking"}
              </p>
            </div>
            <div className="surface-card rounded-[20px] px-4 py-3 sm:col-span-2 lg:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Kontak</p>
              <p className="mt-1 break-words text-sm font-medium">{booking.phone}{booking.email ? ` • ${booking.email}` : ""}</p>
            </div>
          </div>

          {booking.addOns && booking.addOns.length > 0 ? (
            <div className="rounded-[20px] border border-dashed border-[var(--border)] bg-white/70 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Add-on</p>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{booking.addOns.map((item) => item.name).join(", ")}</p>
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
            <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">Status: {booking.followUpStatus ?? "none"}</p>
            {booking.followUpNote ? <p className="mt-1 text-sm leading-6 text-[var(--foreground)]">{booking.followUpNote}</p> : null}
            <p className="mt-1 text-sm text-[var(--muted)]">Next action: {formatDateTimeLabel(booking.followUpNextActionAt)}</p>
          </div>
          <Link href={`/bookings/${booking.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
            Lihat detail booking
          </Link>
        </div>

        <div className="grid gap-3 xl:min-w-[320px] xl:max-w-[380px] xl:flex-1">
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
              <p className="mt-2 text-xs text-[var(--muted)]">Hint kapasitas harian dihitung dari jumlah booking staff di tanggal yang sama. Saat disimpan, assignment tetap diblok bila staff bentrok, di luar weekly availability, atau sedang diblok manual.</p>
            </div>
            <div className="form-field">
              <span className="form-label">Catatan</span>
              <Textarea name="notes" rows={2} defaultValue={booking.notes ?? ""} />
            </div>
            <div className="form-field">
              <span className="form-label">Follow up status</span>
              <Select name="followUpStatus" defaultValue={booking.followUpStatus ?? "none"}>
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
              <Textarea name="followUpNote" rows={2} defaultValue={booking.followUpNote ?? ""} />
            </div>
            <div className="form-field">
              <span className="form-label">Next action</span>
              <Input name="followUpNextActionAt" type="datetime-local" defaultValue={booking.followUpNextActionAt ? booking.followUpNextActionAt.slice(0, 16) : ""} />
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
  );
}
