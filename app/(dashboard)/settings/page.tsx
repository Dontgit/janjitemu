import Link from "next/link";
import { Globe, Settings2, ShieldCheck } from "lucide-react";
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
  const activeDays = businessHours.filter((hour) => hour.active).length;
  const publicUrl = `temujanji.app/book/${businessProfile.slug ?? "temujanji-studio"}`;

  return (
    <DashboardShell activePath="/settings" bookingLink={businessProfile.bookingLink}>
      <PageTutorial
        pageKey="settings"
        pageTitle="Pengaturan"
        steps={[
          {
            title: "Mulai dari profil bisnis",
            description: "Bagian identitas bisnis sekarang dibuat lebih fokus supaya perubahan penting seperti slug, kontak, interval slot, dan buffer lebih cepat dipahami.",
            tip: "Perubahan slug akan mengubah link publik, jadi cek sebelum dibagikan.",
            targetSelector: '[data-tutorial="settings-profile"]',
            targetLabel: "Profil bisnis"
          },
          {
            title: "Atur jam operasional dengan ritme realistis",
            description: "Jam operasional tetap penting, tapi layout-nya dibuat lebih ringan supaya tidak terasa berat di mobile atau desktop kecil.",
            tip: "Kalau jadwal terasa terlalu rapat, naikkan interval atau buffer booking.",
            targetSelector: '[data-tutorial="settings-hours"]',
            targetLabel: "Jam operasional"
          },
          {
            title: "Gunakan panel kanan untuk final check",
            description: "Area samping sekarang dipakai sebagai kontrol go-live dan ringkasan kerja, bukan sekadar panel dekoratif.",
            tip: "Sesudah update penting, buka preview booking page untuk QA cepat.",
            targetSelector: '[data-tutorial="settings-go-live"]',
            targetLabel: "Go-live actions"
          }
        ]}
      />

      <div className="space-y-5 xl:space-y-6">
        <FeedbackBanner feedback={feedback} />

        <Card className="premium-panel p-5 sm:p-6 xl:p-8">
          <div className="space-y-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <span className="section-label">
                  <Settings2 className="h-4 w-4" />
                  Business settings
                </span>
                <PageHeader
                  className="mt-4"
                  eyebrow="Workspace"
                  title="Atur profil bisnis dan pengalaman booking"
                  description="Semua pengaturan inti bisnis diringkas di satu halaman: identitas, link publik, kontak, reminder, buffer, dan jam operasional."
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[440px] xl:max-w-[620px] xl:flex-1">
                <div className="surface-card rounded-[22px] p-4 sm:col-span-2">
                  <p className="text-sm text-[var(--muted)]">Link publik</p>
                  <p className="mt-2 break-all text-sm font-semibold text-[var(--foreground)]">{publicUrl}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Hari aktif</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{activeDays}</p>
                </div>
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Buffer</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">{businessProfile.bookingBufferMins ?? 0}m</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-5 2xl:grid-cols-[1.06fr_0.94fr]">
          <Card className="p-5 sm:p-6 xl:p-8">
            <form action={saveBusinessProfile} className="space-y-6">
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
                    <div className="sm:col-span-2 rounded-[22px] border border-teal-100/80 bg-teal-50/70 p-4 text-sm leading-6 text-[var(--primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                      Link booking publik akan dibentuk otomatis menjadi <span className="font-semibold text-[var(--foreground)]">{publicUrl}</span> setelah disimpan.
                    </div>
                    <div className="sm:col-span-2 rounded-[22px] border border-slate-200/80 bg-slate-50/85 p-4 text-sm leading-6 text-[var(--muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
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
                  description="Atur hari aktif dan rentang jam supaya availability publik tetap realistis."
                >
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {businessHours.map((hour) => (
                      <div key={hour.day} className="surface-card rounded-[22px] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{hour.day}</p>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${hour.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                            {hour.active ? "Aktif" : "Libur"}
                          </span>
                        </div>
                        <label className="mt-4 flex items-center gap-2 text-sm text-[var(--muted)]">
                          <input type="checkbox" name={`active-${hour.dayOfWeek}`} defaultChecked={hour.active} />
                          Aktifkan hari ini
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

              <div data-tutorial="settings-go-live" className="flex flex-wrap gap-3 rounded-[24px] border border-[var(--border)] bg-white/78 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                <SubmitButton>Simpan perubahan</SubmitButton>
                <Link href={`/book/${businessProfile.slug ?? "temujanji-studio"}`} className={buttonVariants("secondary")}>
                  Preview booking page
                </Link>
                <TutorialResetButton />
              </div>
            </form>
          </Card>

          <div className="space-y-5">
            <Card className="p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <span className="icon-chip">
                  <Globe className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold">Public booking snapshot</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Ringkasan singkat supaya owner tahu apa yang customer lihat dari sisi booking publik.</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <div className="surface-card rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">URL aktif</p>
                  <p className="mt-2 break-all font-semibold">{publicUrl}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="soft-stat rounded-[22px] p-4">
                    <p className="text-sm text-[var(--muted)]">Kategori</p>
                    <p className="mt-2 text-lg font-semibold">{businessProfile.category}</p>
                  </div>
                  <div className="soft-stat rounded-[22px] p-4">
                    <p className="text-sm text-[var(--muted)]">Kota</p>
                    <p className="mt-2 text-lg font-semibold">{businessProfile.city}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-5 sm:p-6">
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
                <li className="surface-card rounded-[20px] px-4 py-3">Pakai auth owner nyata kalau sistem login sudah siap dipakai penuh.</li>
              </ul>
            </Card>

            <Card className="p-5 sm:p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">Working summary</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="soft-stat rounded-[22px] p-4">
                  <p className="text-sm text-[var(--muted)]">Hari aktif</p>
                  <p className="mt-2 text-2xl font-semibold">{activeDays}</p>
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
