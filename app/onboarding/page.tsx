import Link from "next/link";
import { requireSessionUser } from "@/lib/auth";
import { getFeedbackFromSearchParams } from "@/lib/feedback";
import { saveBusinessProfile } from "@/lib/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card } from "@/components/ui/card";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getBusinessHours, getOwnerBusiness } from "@/lib/data";

export default async function OnboardingPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireSessionUser("/onboarding");
  const [business, hours, resolvedSearchParams] = await Promise.all([
    getOwnerBusiness(),
    getBusinessHours(),
    searchParams
  ]);
  const feedback = getFeedbackFromSearchParams(resolvedSearchParams);

  return (
    <div className="page-shell py-8 sm:py-12">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
            Onboarding
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Setup Temujanji untuk bisnis Anda
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            Halaman ini mengisi profil bisnis, slug booking publik, kontak, reminder, dan jam operasional dasar. Setelah disimpan, owner langsung bisa lanjut ke dashboard dan mulai menambah layanan.
          </p>

          <div className="mt-8 rounded-[28px] bg-[#14312c] p-6 text-white">
            <p className="text-sm uppercase tracking-[0.18em] text-white/60">Hasil akhir</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/80">
              <li>Link booking publik siap dibagikan.</li>
              <li>Dashboard sudah punya business profile utama.</li>
              <li>Services, bookings, customer, dan schedule memakai context bisnis yang sama.</li>
            </ul>
          </div>

          <div className="mt-6 rounded-[24px] bg-white p-5 text-sm text-[var(--muted)]">
            Tips: isi WhatsApp bisnis dan pilih slug yang pendek supaya mudah dibagikan di bio Instagram atau Google Business Profile.
          </div>
        </Card>

        <Card className="p-6 sm:p-8">
          <FeedbackBanner feedback={feedback} className="mb-6" />
          <form action={saveBusinessProfile} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="redirectTo" value="/dashboard" />
            <Input name="name" defaultValue={business.name} placeholder="Nama bisnis" required />
            <Input name="slug" defaultValue={business.slug} placeholder="Slug booking" required />
            <Input name="category" defaultValue={business.category} placeholder="Kategori bisnis" required />
            <Input name="city" defaultValue={business.city} placeholder="Kota" required />
            <Input name="phone" defaultValue={business.phone} placeholder="Nomor WhatsApp bisnis" />
            <Input name="email" defaultValue={business.email} placeholder="Email bisnis" type="email" />
            <div className="sm:col-span-2">
              <Input
                name="reminderChannel"
                defaultValue={business.reminderChannel}
                placeholder="Reminder channel"
              />
            </div>
            <div className="sm:col-span-2 rounded-[22px] bg-white p-4 text-sm text-[var(--muted)]">
              Preview link booking: <span className="font-semibold text-[var(--foreground)]">temujanji.app/book/{business.slug ?? "temujanji-studio"}</span>
            </div>
            <div className="sm:col-span-2">
              <Textarea
                name="description"
                defaultValue={business.description}
                rows={4}
                placeholder="Deskripsi singkat bisnis"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <p className="text-lg font-semibold">Jam operasional</p>
            </div>
            {hours.map((hour) => (
              <div key={hour.day} className="rounded-[22px] border border-[var(--border)] bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{hour.day}</p>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name={`active-${hour.dayOfWeek}`}
                      defaultChecked={hour.active}
                    />
                    Aktif
                  </label>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Input name={`open-${hour.dayOfWeek}`} type="time" defaultValue={hour.open} />
                  <Input name={`close-${hour.dayOfWeek}`} type="time" defaultValue={hour.close} />
                </div>
              </div>
            ))}
            <div className="sm:col-span-2 flex flex-wrap gap-3">
              <SubmitButton>Simpan onboarding</SubmitButton>
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-2xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold">
                Lewati ke dashboard
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
