import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock3, Link2, Sparkles } from "lucide-react";
import { requireSessionUser } from "@/lib/auth";
import { getFeedbackFromSearchParams } from "@/lib/feedback";
import { saveBusinessProfile } from "@/lib/actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card } from "@/components/ui/card";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buttonVariants } from "@/components/ui/button";
import { getBusinessHours, getOwnerBusiness } from "@/lib/data";

const onboardingSteps = [
  {
    icon: BadgeCheck,
    title: "Identitas bisnis",
    description: "Nama, kategori, kota, dan deskripsi singkat supaya booking page langsung terasa meyakinkan."
  },
  {
    icon: Link2,
    title: "Link booking publik",
    description: "Slug dibuat pendek dan mudah dibagikan ke Instagram bio, WhatsApp, atau Google Business Profile."
  },
  {
    icon: Clock3,
    title: "Jam operasional",
    description: "Slot booking akan mengikuti jam buka bisnis, jadi customer hanya melihat waktu yang benar-benar relevan."
  }
] as const;

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
  const bookingPreviewLink = business.bookingLink ?? `https://janjitemu.gobisnis.cloud/book/${business.slug ?? "temujanji-studio"}`;

  return (
    <div className="page-shell py-8 sm:py-12 lg:py-14">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr] xl:gap-8">
        <div className="space-y-6">
          <Card className="premium-panel overflow-hidden p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)] shadow-[0_8px_20px_rgba(20,49,44,0.05)]">
              <Sparkles className="h-3.5 w-3.5" />
              Onboarding workspace
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              Setup Temujanji supaya link booking siap dipakai hari ini.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              Fokus onboarding ini sederhana: rapikan identitas bisnis, aktifkan link booking publik, lalu set jam operasional inti agar customer hanya melihat slot yang relevan.
            </p>

            <div className="mt-8 grid gap-4">
              {onboardingSteps.map(({ icon: Icon, title, description }, index) => (
                <div key={title} className="surface-subtle rounded-[24px] p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Step 0{index + 1}</p>
                      <p className="mt-1 font-semibold">{title}</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[28px] bg-[#14312c] p-6 text-white shadow-[0_18px_40px_rgba(20,49,44,0.18)]">
              <p className="text-sm uppercase tracking-[0.18em] text-white/60">Hasil akhir</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/80">
                <li>Link booking publik siap dibagikan ke customer.</li>
                <li>Dashboard sudah memakai context bisnis yang sama untuk layanan, booking, customer, dan schedule.</li>
                <li>Slot awal mengikuti jam operasional sehingga flow booking terasa lebih akurat sejak awal.</li>
              </ul>
            </div>
          </Card>

          <Card className="p-6 sm:p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">Quick tip</p>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Pilih slug yang pendek dan mudah diingat. Misalnya nama studio atau brand utama. Ini bikin link lebih enak dibagikan lewat chat maupun bio sosial media.
            </p>
            <div className="mt-4 rounded-[22px] bg-[var(--surface-muted)] px-4 py-4 text-sm text-[var(--foreground)]">
              Preview link booking: <span className="font-semibold break-all">{bookingPreviewLink}</span>
            </div>
          </Card>
        </div>

        <Card className="p-6 sm:p-8">
          <FeedbackBanner feedback={feedback} className="mb-6" />
          <form action={saveBusinessProfile} className="space-y-5">
            <input type="hidden" name="redirectTo" value="/dashboard" />

            <FormSection
              eyebrow="Bagian 1"
              title="Profil bisnis utama"
              description="Data ini jadi fondasi booking page dan dashboard owner."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Input name="name" defaultValue={business.name} placeholder="Nama bisnis" required />
                <Input name="slug" defaultValue={business.slug} placeholder="Slug booking" required />
                <Input name="category" defaultValue={business.category} placeholder="Kategori bisnis" required />
                <Input name="city" defaultValue={business.city} placeholder="Kota" required />
                <Input name="phone" defaultValue={business.phone} placeholder="Nomor WhatsApp bisnis" />
                <Input name="email" defaultValue={business.email} placeholder="Email bisnis" type="email" />
              </div>
            </FormSection>

            <FormSection
              eyebrow="Bagian 2"
              title="Channel komunikasi & deskripsi"
              description="Bantu customer paham bisnis Anda dan bagaimana reminder akan dikirim."
            >
              <div className="grid gap-4">
                <Input
                  name="reminderChannel"
                  defaultValue={business.reminderChannel}
                  placeholder="Reminder channel"
                />
                <Textarea
                  name="description"
                  defaultValue={business.description}
                  rows={4}
                  placeholder="Deskripsi singkat bisnis"
                  required
                />
              </div>
            </FormSection>

            <FormSection
              eyebrow="Bagian 3"
              title="Jam operasional"
              description="Aktifkan hari kerja dan isi jam buka-tutup agar sistem bisa menyiapkan slot booking yang realistis."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {hours.map((hour) => (
                  <div key={hour.day} className="surface-subtle rounded-[22px] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{hour.day}</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">Atur apakah hari ini aktif untuk booking.</p>
                      </div>
                      <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
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
              </div>
            </FormSection>

            <div className="flex flex-wrap gap-3 pt-2">
              <SubmitButton>Simpan onboarding</SubmitButton>
              <Link href="/dashboard" className={buttonVariants("secondary")}>
                Lewati ke dashboard
              </Link>
              <Link href={bookingPreviewLink} className={buttonVariants("ghost")}>
                Preview booking page
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
