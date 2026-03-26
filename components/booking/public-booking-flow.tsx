"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, CircleCheckBig, MessageCircleMore, Store } from "lucide-react";
import { createPublicBooking } from "@/lib/actions";
import { Card } from "@/components/ui/card";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AvailabilityDay, BusinessProfile, PublicBookingFormValues, Service } from "@/lib/types";
import { formatCurrency, formatLongDate } from "@/lib/utils";

export function PublicBookingFlow({
  slug,
  business,
  services,
  availability,
  availabilityByService,
  guidance = [],
  initialValues = {}
}: {
  slug: string;
  business: BusinessProfile;
  services: Service[];
  availability: AvailabilityDay[];
  availabilityByService: Record<string, AvailabilityDay[]>;
  guidance?: string[];
  initialValues?: PublicBookingFormValues;
}) {
  const initialServiceId =
    initialValues.serviceId && services.some((service) => service.id === initialValues.serviceId)
      ? initialValues.serviceId
      : services[0]?.id ?? "";

  const [selectedServiceId, setSelectedServiceId] = useState(initialServiceId);
  const [selectedDate, setSelectedDate] = useState(initialValues.date ?? availability[0]?.value ?? "");
  const [selectedTime, setSelectedTime] = useState(initialValues.time ?? availability[0]?.slots[0] ?? "");
  const [customerName, setCustomerName] = useState(initialValues.customerName ?? "");

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? services[0],
    [selectedServiceId, services]
  );

  const serviceAvailability = useMemo(
    () => availabilityByService[selectedServiceId] ?? availability,
    [availability, availabilityByService, selectedServiceId]
  );

  const slots = useMemo(
    () => serviceAvailability.find((item) => item.value === selectedDate)?.slots ?? [],
    [serviceAvailability, selectedDate]
  );

  useEffect(() => {
    if (services.length > 0 && !services.some((service) => service.id === selectedServiceId)) {
      setSelectedServiceId(services[0]?.id ?? "");
    }
  }, [selectedServiceId, services]);

  useEffect(() => {
    if (!selectedDate && serviceAvailability[0]) {
      setSelectedDate(serviceAvailability[0].value);
      setSelectedTime(serviceAvailability[0].slots[0] ?? "");
      return;
    }

    if (selectedDate && !serviceAvailability.some((item) => item.value === selectedDate)) {
      setSelectedDate(serviceAvailability[0]?.value ?? "");
      setSelectedTime(serviceAvailability[0]?.slots[0] ?? "");
      return;
    }

    if (slots.length === 0) {
      setSelectedTime("");
      return;
    }

    if (!slots.includes(selectedTime)) {
      setSelectedTime(slots[0] ?? "");
    }
  }, [selectedDate, selectedTime, serviceAvailability, slots]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <Card className="p-6 sm:p-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
              Booking publik
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{business.name}</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Pilih layanan, tentukan slot kosong, lalu isi data inti. Flow ini dibuat sependek mungkin supaya customer bisa booking tanpa chat panjang.
            </p>
          </div>
          <div className="rounded-2xl bg-teal-50 px-4 py-3 text-sm text-[var(--foreground)]">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Bisnis</p>
            <p className="mt-1 font-semibold">{slug}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{business.city}</p>
          </div>
        </div>

        <form action={createPublicBooking} className="space-y-8">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="serviceId" value={selectedServiceId} />
          <input type="hidden" name="date" value={selectedDate} />
          <input type="hidden" name="time" value={selectedTime} />

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">1. Pilih layanan</h2>
              <p className="text-sm text-[var(--muted)]">Tampilkan layanan aktif yang siap dibooking publik.</p>
            </div>
            <div className="grid gap-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`rounded-[24px] border p-4 text-left transition ${
                    selectedServiceId === service.id
                      ? "border-teal-500 bg-teal-50"
                      : "border-[var(--border)] bg-white hover:border-teal-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{service.name}</p>
                        {service.popular ? (
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
                            Populer
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-[var(--muted)]">{service.description}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold">{formatCurrency(service.price)}</p>
                      <p className="text-[var(--muted)]">{service.duration} menit</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">2. Pilih tanggal</h2>
                <p className="text-sm text-[var(--muted)]">Tanggal yang libur tetap terlihat, tapi tanpa slot supaya ekspektasi customer jelas.</p>
              </div>
              <div className="grid gap-3">
                {serviceAvailability.map((date) => (
                  <button
                    key={date.value}
                    type="button"
                    onClick={() => {
                      setSelectedDate(date.value);
                      setSelectedTime(date.slots[0] ?? "");
                    }}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      selectedDate === date.value
                        ? "border-teal-500 bg-teal-50"
                        : "border-[var(--border)] bg-white hover:border-teal-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{date.label}</p>
                        <p className="text-[var(--muted)]">{date.value}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                        {date.slots.length} slot
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">3. Pilih jam</h2>
                <p className="text-sm text-[var(--muted)]">Slot kosong langsung terlihat tanpa tanya admin.</p>
              </div>
              {slots.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                        selectedTime === slot
                          ? "border-teal-500 bg-teal-600 text-white"
                          : "border-[var(--border)] bg-white hover:border-teal-300"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-white p-5 text-sm text-[var(--muted)]">
                  Belum ada slot untuk tanggal ini. Pilih tanggal lain atau hubungi bisnis untuk reschedule manual.
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">4. Isi data customer</h2>
              <p className="text-sm text-[var(--muted)]">Cukup data penting untuk booking pertama, detail lain bisa ditambahkan owner dari dashboard.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                name="customerName"
                placeholder="Nama lengkap"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                required
              />
              <Input name="phone" placeholder="Nomor WhatsApp" defaultValue={initialValues.phone ?? ""} required />
              <Input name="email" placeholder="Email" type="email" defaultValue={initialValues.email ?? ""} />
              <Input name="source" placeholder="Instagram / referral (opsional)" defaultValue={initialValues.source ?? ""} />
            </div>
            <Textarea
              name="notes"
              rows={4}
              placeholder="Catatan tambahan, contoh: prefer stylist tertentu."
              defaultValue={initialValues.notes ?? ""}
            />
            <SubmitButton
              className="w-full sm:w-auto"
              disabled={!selectedServiceId || !selectedDate || !selectedTime}
            >
              Konfirmasi booking
            </SubmitButton>
          </section>
        </form>
      </Card>

      <div className="space-y-6">
        <Card className="p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
            Ringkasan booking
          </p>
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-sm text-[var(--muted)]">Layanan</p>
              <p className="font-semibold">{selectedService?.name ?? "Belum dipilih"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[var(--muted)]">Tanggal</p>
                <p className="font-semibold">{selectedDate ? formatLongDate(selectedDate) : "Belum dipilih"}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Jam</p>
                <p className="font-semibold">{selectedTime || "Belum dipilih"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[var(--muted)]">Durasi</p>
                <p className="font-semibold">{selectedService?.duration ? `${selectedService.duration} menit` : "-"}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Estimasi biaya</p>
                <p className="font-semibold">{selectedService ? formatCurrency(selectedService.price) : "-"}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Nama customer</p>
              <p className="font-semibold">{customerName || "Belum diisi"}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <p className="font-semibold">Info cepat untuk customer</p>
          <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            {[
              { icon: Store, label: business.category || "Bisnis jasa" },
              { icon: CalendarClock, label: business.reminderChannel || "Reminder dashboard" },
              { icon: MessageCircleMore, label: business.phone || "Kontak bisnis akan tampil setelah setup selesai" },
              { icon: CircleCheckBig, label: "Status awal booking: pending confirmation" }
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 rounded-[20px] bg-white px-4 py-3">
                <Icon className="h-4 w-4 text-[var(--primary)]" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <p className="font-semibold">Kenapa halaman ini cocok untuk MVP</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
            {guidance.map((item) => (
              <li key={item}>• {item}</li>
            ))}
            {guidance.length === 0 ? (
              <>
                <li>• Flow 4 langkah yang singkat dan mudah dipahami pelanggan baru.</li>
                <li>• Slot diambil dari jam operasional dan booking yang sudah tersimpan.</li>
                <li>• Ringkasan di kanan membantu mengurangi salah pilih layanan atau jam.</li>
              </>
            ) : null}
          </ul>
        </Card>
      </div>
    </div>
  );
}
