import Link from "next/link";
import { Globe, Settings2, ShieldCheck, Sparkles } from "lucide-react";
import { saveBusinessProfile } from "@/lib/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { PageTutorial } from "@/components/ui/page-tutorial";
import { Textarea } from "@/components/ui/textarea";
import { TutorialResetButton } from "@/components/ui/tutorial-reset-button";
import { getBusinessHours, getOwnerBusiness } from "@/lib/data";
import { getFeedbackFromSearchParams } from "@/lib/feedback";

export default async function SettingsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [businessProfile, businessHours, resolvedSearchParams] = await Promise.all([
    getOwnerBusiness(),
    getBusinessHours(),
    searchParams
  ]);
  const feedback = getFeedbackFromSearchParams(resolvedSearchParams);

  return (
    <DashboardShell activePath="/settings" bookingLink={businessProfile.bookingLink}>
      <PageTutorial
        pageKey="settings"
        pageTitle="Pengaturan"
        steps={[
          {
            title: "Selesaikan setup profil bisnis lebih dulu",
            description: "Bagian ini mengatur identitas bisnis, slug booking publik, kontak, interval slot, dan buffer. Semua ini langsung memengaruhi pengalaman customer di halaman booking.",
            tip: "Perubahan slug akan mengubah link publik, jadi cek sebelum dibagikan.",
            targetSelector: '[data-tutorial="settings-profile"]',
            targetLabel: "Profil bisnis"
          },
          {
            title: "Atur jam operasional secara teliti",
            description: "Di sini Anda menentukan hari aktif, jam buka-tutup, dan ritme availability publik supaya slot yang tampil ke customer tetap realistis.",
            tip: "Kalau jadwal terasa terlalu rapat, naikkan interval atau buffer.",
            targetSelector: '[data-tutorial="settings-hours"]',
            targetLabel: "Jam operasional"
          },
          {
            title: "Gunakan halaman ini untuk go-live",
            description: "Panel samping dan action bar dipakai untuk final check sebelum go-live: preview halaman publik, cek checklist, lalu reset panduan kalau onboarding ingin diulang.",
            tip: "Sesudah update penting, buka preview booking page untuk QA cepat.",
            targetSelector: '[data-tutorial="settings-go-live"]',
            targetLabel: "Go-live actions"
          }
        ]}
      />
      <div className="space-y-6 xl:space-y-7">
        <FeedbackBanner feedback={feedback} />

        <Card className="premium-panel overflow-hidden p-6 sm:p-8 xl:p-10">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
            <div>
              <span className="section-label">
                <Settings2 className="h-4 w-4" />
                Business control
              </span>
              <PageHeader
                className="mt-4"
                eyebrow="Business settings"
                title="Atur profil bisnis dan link booking"
                description="Halaman ini menggabungkan profil bisnis, kontak, reminder, dan jam operasional agar owner tidak perlu bolak-balik antar layar saat setup awal."
              />
            </div>
            <div className="rounded-[30px] bg-[#14312c] p-6 text-white shadow-[0_24px_55px_rgba(20,49,44,0.22)]">
              <p className="text-sm uppercase tracking-[0.18em] text-white/60">Public booking</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight">Link siap dibagikan</p>
              <div className="mt-6 rounded-[24px] border border-white/10 bg-white/10 p-4 text-sm leading-6 text-white/80 backdrop-blur-sm">
                temujanji.app/book/{businessProfile.slug ?? "temujanji-studio"}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="soft-stat-strong rounded-[22px] p-4">
                  <p className="text-sm text-white/60">Kategori</p>
                  <p className="mt-2 font-semibold text-white">{businessProfile.category}</p>
                </div>
                <div className="soft-stat-strong rounded-[22px] p-4">
                  <p className="text-sm text-white/60">Kota</p>
                  <p className="mt-2 font-semibold text-white">{businessProfile.city}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 2xl:grid-cols-[1.08fr_0.92fr]">
          <Card className="p-6 sm:p-8 xl:p-10">
            <form action={saveBusinessProfile} className="space-y-8">
              <input type="hidden" name="redirectTo" value="/settings" />

              <div data-tutorial="settings-profile">
                <FormSection
                  eyebrow="Bagian 1"
                  title="Profil bisnis"
                  description="Pastikan identitas usaha terlihat rapi di dashboard internal dan halaman booking publik."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input name="name" defaultValue={businessProfile.name} placeholder="Nama bisnis" required />
                    <Input name="category" defaultValue={businessProfile.category} placeholder="Kategori" required />
                    <Input name="city" defaultValue={businessProfile.city} placeholder="Kota" required />
                    <Input name="reminderChannel" defaultValue={businessProfile.reminderChannel} placeholder="Reminder channel" />
                    <Input name="slug" defaultValue={businessProfile.slug} placeholder="Slug booking" required />
                    <Input name="bookingSlotInterval" type="number" min="5" step="5" defaultValue={businessProfile.bookingSlotInterval ?? 15} placeholder="Interval slot booking (menit)" required />
                    <Input name="bookingBufferMins" type="number" min="0" step="5" defaultValue={businessProfile.bookingBufferMins ?? 0} placeholder="Buffer antar booking (menit)" required />
                    <Input name="phone" defaultValue={businessProfile.phone} placeholder="Nomor WhatsApp bisnis" />
                    <div className="sm:col-span-2">
                      <Input name="email" defaultValue={businessProfile.email} type="email" placeholder="Email bisnis" />
                    </div>
                    <div className="sm:col-span-2 field-card rounded-[24px] p-4 text-sm leading-6 text-[var(--muted)]">
                      Link booking publik akan dibentuk otomatis menjadi <span className="font-semibold text-[var(--foreground)]">temujanji.app/book/{businessProfile.slug ?? "temujanji-studio"}</span> setelah disimpan.
                    </div>
                    <div className="sm:col-span-2 field-card rounded-[24px] p-4 text-sm leading-6 text-[var(--muted)]">
                      Buffer dipakai untuk memberi jeda antar booking saat cek ketersediaan publik dan bentrok internal. Isi <span className="font-semibold text-[var(--foreground)]">0</span> bila tidak perlu jeda tambahan.
                    </div>
                    <div className="sm:col-span-2">
                      <Textarea name="description" defaultValue={businessProfile.description} rows={5} placeholder="Deskripsi bisnis" />
                    </div>
                  </div>
                </FormSection>
              </div>

              <div data-tutorial="settings-hours">
                <FormSection
                  eyebrow="Bagian 2"
                  title="Jam operasional"
                  description="Atur hari aktif, rentang jam, dan granularity slot supaya availability publik benar-benar mengikuti ritme operasional bisnis."
                >
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {businessHours.map((hour) => (
                      <div key={hour.day} className="surface-card rounded-[24px] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{hour.day}</p>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${hour.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                            {hour.active ? "Aktif" : "Libur"}
                          </span>
                        </div>
                        <label className="mt-4 flex items-center gap-2 text-sm text-[var(--muted)]">
                          <input type="checkbox" name={`active-${hour.dayOfWeek}`} defaultChecked={hour.active} />
                          Aktif
                        </label>
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <Input name={`open-${hour.dayOfWeek}`} defaultValue={hour.open} type="time" />
                          <Input name={`close-${hour.dayOfWeek}`} defaultValue={hour.close} type="time" />
                        </div>
                      </div>
                    ))}
                  </div>
                </FormSection>
              </div>

              <div data-tutorial="settings-go-live" className="flex flex-wrap gap-3">
                <SubmitButton>Simpan perubahan</SubmitButton>
                <Link href={`/book/${businessProfile.slug ?? "temujanji-studio"}`} className={buttonVariants("secondary")}>
                  Preview booking page
                </Link>
                <TutorialResetButton />
              </div>
            </form>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <span className="icon-chip">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold">Checklist go-live MVP</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Gunakan panel ini sebagai quality gate ringan sebelum link booking dibagikan ke publik.</p>
                </div>
              </div>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-[var(--muted)]">
                <li className="surface-card rounded-[20px] px-4 py-3">Isi nomor WhatsApp dan email bisnis agar customer tahu jalur follow up.</li>
                <li className="surface-card rounded-[20px] px-4 py-3">Pastikan minimal satu layanan aktif dan satu layanan populer.</li>
                <li className="surface-card rounded-[20px] px-4 py-3">Cek preview halaman booking sebelum link dibagikan ke publik.</li>
                <li className="surface-card rounded-[20px] px-4 py-3">Sesudah auth ditambahkan, pindahkan owner dari seed default ke akun login nyata.</li>
              </ul>
            </Card>

            <Card className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">Working summary</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="soft-stat rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Hari aktif</p>
                  <p className="mt-2 text-2xl font-semibold">{businessHours.filter((hour) => hour.active).length}</p>
                </div>
                <div className="soft-stat rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Interval slot</p>
                  <p className="mt-2 text-2xl font-semibold">{businessProfile.bookingSlotInterval ?? 15}m</p>
                </div>
                <div className="soft-stat rounded-[22px] p-4 sm:col-span-2">
                  <p className="text-sm text-[var(--muted)]">Buffer booking</p>
                  <p className="mt-2 text-2xl font-semibold">{businessProfile.bookingBufferMins ?? 0}m</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
