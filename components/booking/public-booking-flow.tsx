"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, CircleCheckBig, MessageCircleMore, Store, Sparkles } from "lucide-react";
import { createPublicBooking } from "@/lib/actions";
import { Card } from "@/components/ui/card";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AvailabilityDay, BusinessProfile, PublicBookingFormValues, Service } from "@/lib/types";
import { formatCurrency, formatLongDate } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Pilih layanan", detail: "Service, add-on, tanggal, jam" },
  { id: 2, title: "Data customer", detail: "Kontak & catatan" },
  { id: 3, title: "Ringkasan", detail: "Cek ulang lalu kirim" }
] as const;

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
  const mainServices = useMemo(() => services.filter((service) => !service.isAddon), [services]);
  const addOnServices = useMemo(() => services.filter((service) => service.isAddon), [services]);
  const parsedInitialAddOnIds = useMemo(
    () => (initialValues.addOnIds ?? "").split(",").map((item) => item.trim()).filter(Boolean),
    [initialValues.addOnIds]
  );

  const initialServiceId =
    initialValues.serviceId && mainServices.some((service) => service.id === initialValues.serviceId)
      ? initialValues.serviceId
      : mainServices[0]?.id ?? "";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedServiceId, setSelectedServiceId] = useState(initialServiceId);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>(parsedInitialAddOnIds);
  const [selectedDate, setSelectedDate] = useState(initialValues.date ?? availability[0]?.value ?? "");
  const [selectedTime, setSelectedTime] = useState(initialValues.time ?? availability[0]?.slots[0] ?? "");
  const [customerName, setCustomerName] = useState(initialValues.customerName ?? "");
  const [phone, setPhone] = useState(initialValues.phone ?? "");
  const [email, setEmail] = useState(initialValues.email ?? "");
  const [source, setSource] = useState(initialValues.source ?? "");
  const [notes, setNotes] = useState(initialValues.notes ?? "");

  const selectedService = useMemo(
    () => mainServices.find((service) => service.id === selectedServiceId) ?? mainServices[0],
    [selectedServiceId, mainServices]
  );

  const selectedAddOns = useMemo(
    () => addOnServices.filter((service) => selectedAddOnIds.includes(service.id)),
    [addOnServices, selectedAddOnIds]
  );

  const serviceAvailability = useMemo(
    () => availabilityByService[selectedServiceId] ?? availability,
    [availability, availabilityByService, selectedServiceId]
  );

  const slots = useMemo(
    () => serviceAvailability.find((item) => item.value === selectedDate)?.slots ?? [],
    [serviceAvailability, selectedDate]
  );

  const totalDuration = (selectedService?.duration ?? 0) + selectedAddOns.reduce((sum, item) => sum + item.duration, 0);
  const totalPrice = (selectedService?.price ?? 0) + selectedAddOns.reduce((sum, item) => sum + item.price, 0);

  useEffect(() => {
    if (mainServices.length > 0 && !mainServices.some((service) => service.id === selectedServiceId)) {
      setSelectedServiceId(mainServices[0]?.id ?? "");
    }
  }, [selectedServiceId, mainServices]);

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

  const stepOneReady = Boolean(selectedServiceId && selectedDate && selectedTime);
  const stepTwoReady = Boolean(customerName.trim() && phone.trim());

  function toggleAddOn(addOnId: string) {
    setSelectedAddOnIds((current) =>
      current.includes(addOnId) ? current.filter((item) => item !== addOnId) : [...current, addOnId]
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_380px]">
      <Card className="premium-panel p-5 sm:p-7 xl:p-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/85 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
              <Sparkles className="h-3.5 w-3.5" />
              Booking publik
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{business.name}</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Flow dibuat bertahap supaya customer lebih fokus: pilih slot dulu, isi data kedua, lalu review sebelum kirim.
            </p>
          </div>
          <div className="rounded-[22px] border border-teal-100 bg-teal-50/80 px-4 py-3 text-sm text-[var(--foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Bisnis</p>
            <p className="mt-1 font-semibold">{slug}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{business.city}</p>
          </div>
        </div>

        <div className="mb-8 grid gap-3 md:grid-cols-3">
          {STEPS.map((item) => {
            const active = item.id === step;
            const passed = item.id < step;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === 1 || (item.id === 2 && stepOneReady) || (item.id === 3 && stepOneReady && stepTwoReady)) {
                    setStep(item.id);
                  }
                }}
                className={`rounded-[22px] border px-4 py-4 text-left transition ${
                  active
                    ? "border-teal-500 bg-teal-50"
                    : passed
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-[var(--border)] bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${passed ? "bg-emerald-600 text-white" : active ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                    {passed ? <CheckCircle2 className="h-4 w-4" /> : item.id}
                  </span>
                  <div>
                    <p className="font-semibold">Step {item.id}</p>
                    <p className="text-sm text-[var(--muted)]">{item.title}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-[var(--muted)]">{item.detail}</p>
              </button>
            );
          })}
        </div>

        <form action={createPublicBooking} className="space-y-8">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="serviceId" value={selectedServiceId} />
          <input type="hidden" name="addOnIds" value={selectedAddOnIds.join(",")} />
          <input type="hidden" name="date" value={selectedDate} />
          <input type="hidden" name="time" value={selectedTime} />

          {step === 1 ? (
            <section className="space-y-8">
              <section className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">1. Pilih layanan utama</h2>
                  <p className="text-sm text-[var(--muted)]">Layanan utama wajib dipilih dulu, add-on opsional bisa ditambahkan setelahnya.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {mainServices.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setSelectedServiceId(service.id)}
                      className={`rounded-[24px] border p-4 text-left transition ${
                        selectedServiceId === service.id
                          ? "border-teal-500 bg-teal-50 shadow-[0_14px_30px_rgba(15,118,110,0.08)]"
                          : "border-[var(--border)] bg-white hover:border-teal-300 hover:shadow-[0_10px_24px_rgba(20,49,44,0.05)]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{service.name}</p>
                            {service.popular ? <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">Populer</span> : null}
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

              {addOnServices.length > 0 ? (
                <section className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">Add-on tambahan</h2>
                    <p className="text-sm text-[var(--muted)]">Customer bisa pilih satu atau lebih tambahan sesuai kebutuhan.</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {addOnServices.map((service) => {
                      const selected = selectedAddOnIds.includes(service.id);
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => toggleAddOn(service.id)}
                          className={`rounded-[22px] border p-4 text-left transition ${selected ? "border-teal-500 bg-teal-50" : "border-[var(--border)] bg-white hover:border-teal-300"}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">{service.name}</p>
                              <p className="mt-1 text-sm text-[var(--muted)]">{service.description}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selected ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                              {selected ? "Dipilih" : "Opsional"}
                            </span>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-sm">
                            <span>{formatCurrency(service.price)}</span>
                            <span className="text-[var(--muted)]">+{service.duration} menit</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              <section className="grid gap-6 2xl:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">Pilih tanggal</h2>
                    <p className="text-sm text-[var(--muted)]">Tanggal libur tetap terlihat, tapi tanpa slot.</p>
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
                        className={`rounded-[22px] border px-4 py-3 text-left text-sm transition ${selectedDate === date.value ? "border-teal-500 bg-teal-50" : "border-[var(--border)] bg-white hover:border-teal-300"}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold">{date.label}</p>
                            <p className="text-[var(--muted)]">{date.value}</p>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--muted)] shadow-[0_6px_18px_rgba(20,49,44,0.05)]">
                            {date.slots.length} slot
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">Pilih jam</h2>
                    <p className="text-sm text-[var(--muted)]">Ketersediaan sudah mengikuti jam operasional, booking lain, dan interval slot bisnis.</p>
                  </div>
                  {slots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2">
                      {slots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${selectedTime === slot ? "border-teal-500 bg-teal-600 text-white shadow-[0_16px_30px_rgba(15,118,110,0.2)]" : "border-[var(--border)] bg-white hover:border-teal-300"}`}
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

              <div className="flex flex-wrap gap-3">
                <button type="button" className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50" disabled={!stepOneReady} onClick={() => setStep(2)}>
                  Lanjut ke data customer
                </button>
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">2. Isi data customer</h2>
                <p className="text-sm text-[var(--muted)]">Cukup data inti untuk booking pertama. Detail lanjutan bisa ditambah owner dari dashboard.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="form-field">
                  <span className="form-label">Nama lengkap</span>
                  <Input name="customerName" placeholder="Nama lengkap" value={customerName} onChange={(event) => setCustomerName(event.target.value)} required />
                </div>
                <div className="form-field">
                  <span className="form-label">WhatsApp</span>
                  <Input name="phone" placeholder="Nomor WhatsApp" value={phone} onChange={(event) => setPhone(event.target.value)} required />
                </div>
                <div className="form-field">
                  <span className="form-label">Email</span>
                  <Input name="email" placeholder="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                </div>
                <div className="form-field">
                  <span className="form-label">Sumber</span>
                  <Input name="source" placeholder="Instagram / referral (opsional)" value={source} onChange={(event) => setSource(event.target.value)} />
                </div>
              </div>
              <div className="form-field">
                <span className="form-label">Catatan tambahan</span>
                <Textarea name="notes" rows={4} placeholder="Contoh: prefer stylist tertentu atau punya kebutuhan khusus." value={notes} onChange={(event) => setNotes(event.target.value)} />
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" className="rounded-2xl border border-[var(--border)] px-5 py-3 text-sm font-semibold" onClick={() => setStep(1)}>
                  Kembali
                </button>
                <button type="button" className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50" disabled={!stepTwoReady} onClick={() => setStep(3)}>
                  Lanjut ke ringkasan
                </button>
              </div>
            </section>
          ) : null}

          {step === 3 ? (
            <section className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">3. Review & konfirmasi</h2>
                <p className="text-sm text-[var(--muted)]">Cek ringkasan akhir sebelum booking dikirim.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Layanan utama</p>
                  <p className="mt-1 font-semibold">{selectedService?.name ?? "Belum dipilih"}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Jadwal</p>
                  <p className="mt-1 font-semibold">{selectedDate ? `${formatLongDate(selectedDate)} • ${selectedTime}` : "Belum dipilih"}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4 md:col-span-2">
                  <p className="text-sm text-[var(--muted)]">Add-on</p>
                  {selectedAddOns.length > 0 ? (
                    <ul className="mt-2 space-y-2 text-sm">
                      {selectedAddOns.map((item) => (
                        <li key={item.id} className="flex items-center justify-between gap-3">
                          <span>{item.name}</span>
                          <span className="text-[var(--muted)]">{formatCurrency(item.price)} • +{item.duration} menit</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 font-semibold">Tidak ada add-on</p>
                  )}
                </div>
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Customer</p>
                  <p className="mt-1 font-semibold">{customerName || "Belum diisi"}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{phone || "Nomor belum diisi"}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Estimasi total</p>
                  <p className="mt-1 font-semibold">{formatCurrency(totalPrice)}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{totalDuration} menit</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" className="rounded-2xl border border-[var(--border)] px-5 py-3 text-sm font-semibold" onClick={() => setStep(2)}>
                  Kembali
                </button>
                <SubmitButton className="w-full sm:w-auto" disabled={!stepOneReady || !stepTwoReady}>
                  Konfirmasi booking
                </SubmitButton>
              </div>
            </section>
          ) : null}
        </form>
      </Card>

      <div className="space-y-6 xl:sticky xl:top-24">
        <Card className="p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">Ringkasan booking</p>
          <div className="mt-5 space-y-3">
            <div className="surface-card rounded-[20px] p-4">
              <p className="text-sm text-[var(--muted)]">Layanan</p>
              <p className="font-semibold">{selectedService?.name ?? "Belum dipilih"}</p>
            </div>
            <div className="surface-card rounded-[20px] p-4">
              <p className="text-sm text-[var(--muted)]">Add-on</p>
              <p className="font-semibold">{selectedAddOns.length > 0 ? selectedAddOns.map((item) => item.name).join(", ") : "Tidak ada"}</p>
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
                <p className="font-semibold">{totalDuration ? `${totalDuration} menit` : "-"}</p>
              </div>
              <div className="surface-card rounded-[20px] p-4">
                <p className="text-sm text-[var(--muted)]">Estimasi biaya</p>
                <p className="font-semibold">{totalPrice ? formatCurrency(totalPrice) : "-"}</p>
              </div>
            </div>
            <div className="surface-card rounded-[20px] p-4">
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
              { icon: CalendarClock, label: `${business.reminderChannel || "Reminder dashboard"} • interval slot ${business.bookingSlotInterval ?? 15} menit` },
              { icon: MessageCircleMore, label: business.phone || "Kontak bisnis akan tampil setelah setup selesai" },
              { icon: CircleCheckBig, label: "Status awal booking: pending confirmation" }
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
    </div>
  );
}
