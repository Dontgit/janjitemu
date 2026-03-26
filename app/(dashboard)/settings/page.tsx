import Link from "next/link";
import { saveBusinessProfile } from "@/lib/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Textarea } from "@/components/ui/textarea";
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
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6 sm:p-8">
          <FeedbackBanner feedback={feedback} className="mb-6" />
          <PageHeader
            eyebrow="Business settings"
            title="Atur profil bisnis dan link booking"
            description="Halaman ini menggabungkan profil bisnis, kontak, reminder, dan jam operasional agar owner tidak perlu bolak-balik antar layar saat setup awal."
          />

          <form action={saveBusinessProfile} className="mt-8 grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="redirectTo" value="/settings" />
            <Input name="name" defaultValue={businessProfile.name} placeholder="Nama bisnis" required />
            <Input name="category" defaultValue={businessProfile.category} placeholder="Kategori" required />
            <Input name="city" defaultValue={businessProfile.city} placeholder="Kota" required />
            <Input name="reminderChannel" defaultValue={businessProfile.reminderChannel} placeholder="Reminder channel" />
            <Input name="slug" defaultValue={businessProfile.slug} placeholder="Slug booking" required />
            <Input name="phone" defaultValue={businessProfile.phone} placeholder="Nomor WhatsApp bisnis" />
            <div className="sm:col-span-2">
              <Input name="email" defaultValue={businessProfile.email} type="email" placeholder="Email bisnis" />
            </div>
            <div className="sm:col-span-2 rounded-[22px] bg-white p-4 text-sm text-[var(--muted)]">
              Link booking publik akan dibentuk otomatis menjadi <span className="font-semibold text-[var(--foreground)]">temujanji.app/book/{businessProfile.slug ?? "temujanji-studio"}</span> setelah disimpan.
            </div>
            <div className="sm:col-span-2">
              <Textarea name="description" defaultValue={businessProfile.description} rows={5} placeholder="Deskripsi bisnis" />
            </div>
            {businessHours.map((hour) => (
              <div key={hour.day} className="rounded-[22px] border border-[var(--border)] bg-white p-4">
                <p className="font-medium">{hour.day}</p>
                <label className="mt-3 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name={`active-${hour.dayOfWeek}`}
                    defaultChecked={hour.active}
                  />
                  Aktif
                </label>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Input name={`open-${hour.dayOfWeek}`} defaultValue={hour.open} type="time" />
                  <Input name={`close-${hour.dayOfWeek}`} defaultValue={hour.close} type="time" />
                </div>
              </div>
            ))}
            <div className="sm:col-span-2 flex flex-wrap gap-3">
              <SubmitButton>Simpan perubahan</SubmitButton>
              <Link href={`/book/${businessProfile.slug ?? "temujanji-studio"}`} className="inline-flex items-center justify-center rounded-2xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold">
                Preview booking page
              </Link>
            </div>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <p className="text-lg font-semibold">Jam operasional</p>
            <div className="mt-5 space-y-3">
              {businessHours.map((hour) => (
                <div
                  key={hour.day}
                  className="flex items-center justify-between rounded-[22px] border border-[var(--border)] bg-white px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{hour.day}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {hour.active ? `${hour.open} - ${hour.close}` : "Tutup"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      hour.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {hour.active ? "Aktif" : "Libur"}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-lg font-semibold">Checklist go-live MVP</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
              <li>Isi nomor WhatsApp dan email bisnis agar customer tahu jalur follow up.</li>
              <li>Pastikan minimal satu layanan aktif dan satu layanan populer.</li>
              <li>Cek preview halaman booking sebelum link dibagikan ke publik.</li>
              <li>Sesudah auth ditambahkan, pindahkan owner dari seed default ke akun login nyata.</li>
            </ul>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
