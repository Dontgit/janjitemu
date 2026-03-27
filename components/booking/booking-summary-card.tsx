import { CalendarClock, CircleCheckBig, MessageCircleMore, ShieldCheck, Store } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDurationLabel, formatLongDate } from "@/lib/utils";

type BookingSummaryCardProps = {
  selectedServiceName?: string;
  selectedAddOnNames: string[];
  selectedDate: string;
  selectedTime: string;
  totalDuration: number;
  totalPrice: number;
  estimatedEndTime: string | null;
  customerName: string;
  business: {
    category?: string | null;
    reminderChannel?: string | null;
    bookingSlotInterval?: number | null;
    bookingBufferMins?: number | null;
    phone?: string | null;
  };
  guidance: string[];
};

export function BookingSummaryCard({
  selectedServiceName,
  selectedAddOnNames,
  selectedDate,
  selectedTime,
  totalDuration,
  totalPrice,
  estimatedEndTime,
  customerName,
  business,
  guidance
}: BookingSummaryCardProps) {
  return (
    <div className="space-y-6 xl:sticky xl:top-24">
      <Card data-tutorial="public-booking-summary" className="overflow-hidden p-0">
        <div className="border-b border-teal-100 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_45%),linear-gradient(135deg,#f0fdfa,#ffffff_52%,#ecfeff)] px-6 py-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">Ringkasan booking</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[22px] bg-slate-900 px-4 py-4 text-white shadow-[0_18px_34px_rgba(15,23,42,0.18)]">
              <p className="text-xs uppercase tracking-[0.16em] text-white/55">Estimasi selesai</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{estimatedEndTime ?? "--:--"}</p>
              <p className="mt-1 text-sm text-white/70">{selectedTime ? `${selectedTime} mulai` : "Pilih slot dulu"}</p>
            </div>
            <div className="rounded-[22px] border border-teal-200 bg-white/90 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <p className="text-xs uppercase tracking-[0.16em] text-teal-700">Estimasi total</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{formatCurrency(totalPrice)}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{formatDurationLabel(totalDuration)}</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="mt-5 space-y-3">
            <div className="surface-card rounded-[20px] p-4">
              <p className="text-sm text-[var(--muted)]">Layanan</p>
              <p className="font-semibold">{selectedServiceName ?? "Belum dipilih"}</p>
            </div>
            <div className="surface-card rounded-[20px] p-4">
              <p className="text-sm text-[var(--muted)]">Add-on</p>
              <p className="font-semibold">{selectedAddOnNames.length > 0 ? selectedAddOnNames.join(", ") : "Tidak ada"}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="surface-card rounded-[20px] p-4">
                <p className="text-sm text-[var(--muted)]">Tanggal</p>
                <p className="font-semibold">{selectedDate ? formatLongDate(selectedDate) : "Belum dipilih"}</p>
              </div>
              <div className="surface-card rounded-[20px] p-4">
                <p className="text-sm text-[var(--muted)]">Jam</p>
                <p className="font-semibold">{selectedTime || "Belum dipilih"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="surface-card rounded-[20px] p-4">
                <p className="text-sm text-[var(--muted)]">Total durasi</p>
                <p className="font-semibold">{totalDuration ? formatDurationLabel(totalDuration) : "-"}</p>
              </div>
              <div className="surface-card rounded-[20px] p-4">
                <p className="text-sm text-[var(--muted)]">Estimasi biaya</p>
                <p className="font-semibold">{totalPrice ? formatCurrency(totalPrice) : "-"}</p>
              </div>
            </div>
            <div className="surface-card rounded-[20px] p-4">
              <p className="text-sm text-[var(--muted)]">Estimasi selesai</p>
              <p className="font-semibold">{estimatedEndTime ?? "Pilih tanggal dan jam dulu"}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {business.bookingBufferMins
                  ? `Bisnis memberi buffer ${business.bookingBufferMins} menit antar booking.`
                  : "Tidak ada buffer tambahan antar booking."}
              </p>
            </div>
            <div className="surface-card rounded-[20px] p-4">
              <p className="text-sm text-[var(--muted)]">Nama customer</p>
              <p className="font-semibold">{customerName || "Belum diisi"}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <p className="font-semibold">Info cepat untuk customer</p>
        <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
          {[
            { icon: Store, label: business.category || "Bisnis jasa" },
            {
              icon: CalendarClock,
              label: `${business.reminderChannel || "Reminder dashboard"} • interval ${business.bookingSlotInterval ?? 15} menit${business.bookingBufferMins ? ` • buffer ${business.bookingBufferMins} menit` : ""}`
            },
            { icon: MessageCircleMore, label: business.phone || "Kontak bisnis akan tampil setelah setup selesai" },
            { icon: CircleCheckBig, label: "Status awal booking: pending confirmation" },
            { icon: ShieldCheck, label: "Add-on yang tampil sudah disaring sesuai layanan utama" }
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="surface-card flex items-center gap-3 rounded-[20px] px-4 py-3">
              <span className="icon-chip h-10 w-10 rounded-[14px]">
                <Icon className="h-4 w-4 text-[var(--primary)]" />
              </span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <p className="font-semibold">Kenapa flow ini lebih enak dipakai</p>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
          {guidance.map((item) => <li key={item}>• {item}</li>)}
        </ul>
      </Card>
    </div>
  );
}
