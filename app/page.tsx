import Link from "next/link";
import { ArrowRight, CalendarCheck2, Clock3, Store } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getDashboardStats, getServices } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

const features = [
  {
    icon: CalendarCheck2,
    title: "Booking publik siap pakai",
    description: "Bagikan link booking ke Instagram, WhatsApp, dan Google Business Profile."
  },
  {
    icon: Clock3,
    title: "Jadwal lebih rapi",
    description: "Lihat slot hari ini, booking pending, dan reschedule dari satu dashboard."
  },
  {
    icon: Store,
    title: "Cocok untuk UMKM",
    description: "Bahasa UI sederhana, mobile-friendly, dan tidak terasa seperti software rumit."
  }
];

export default async function HomePage() {
  const [dashboardStats, services] = await Promise.all([getDashboardStats(), getServices()]);

  return (
    <div>
      <SiteHeader />

      <section className="page-shell grid gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <div className="space-y-8">
          <div className="inline-flex rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
            Booking dan penjadwalan sederhana untuk bisnis jasa di Indonesia
          </div>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Temujanji bantu owner UMKM menerima booking online tanpa ribet chat manual.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Landing page, booking page publik, dan dashboard owner dalam satu codebase. Cocok untuk salon, barbershop, tutor, studio, dan bisnis appointment-based lain.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard" className={buttonVariants("primary", "w-full sm:w-auto")}>
              Lihat dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/onboarding"
              className={buttonVariants("secondary", "w-full sm:w-auto")}
            >
              Mulai onboarding
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {dashboardStats.slice(0, 3).map((stat) => (
              <Card key={stat.label} className="p-5">
                <p className="text-sm text-[var(--muted)]">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
                <p className="mt-2 text-sm text-[var(--primary)]">{stat.detail}</p>
              </Card>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden p-4 sm:p-6">
          <div className="rounded-[28px] bg-[#14312c] p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-white/60">Preview owner</p>
                <p className="mt-2 text-2xl font-semibold">Dashboard hari ini</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm">26 Maret 2026</div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {dashboardStats.map((stat) => (
                <div key={stat.label} className="rounded-3xl bg-white/8 p-4">
                  <p className="text-sm text-white/70">{stat.label}</p>
                  <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
                  <p className="mt-2 text-sm text-teal-200">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            {services.map((service) => (
              <div key={service.id} className="rounded-[24px] border border-[var(--border)] bg-white p-5">
                <p className="font-semibold">{service.name}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{service.description}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span>{service.duration} menit</span>
                  <span className="font-semibold">{formatCurrency(service.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section id="fitur" className="page-shell py-12 lg:py-16">
        <SectionHeading
          eyebrow="Fitur MVP"
          title="Flow inti yang langsung terasa manfaatnya buat owner"
          description="MVP ini fokus pada perjalanan paling penting: owner setup layanan, customer booking sendiri, lalu owner memproses booking dari dashboard."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-[var(--primary)]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="cara-kerja" className="page-shell py-12 lg:py-16">
        <Card className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading
            eyebrow="Cara kerja"
            title="Ringkas untuk owner, jelas untuk customer"
            description="Struktur halaman sudah dipersiapkan untuk berkembang ke API, auth, database, dan otomatisasi reminder di iterasi berikutnya."
          />
          <div className="grid gap-4">
            {[
              "Owner menyelesaikan onboarding bisnis, layanan, dan jam operasional.",
              "Owner membagikan link booking publik.",
              "Customer memilih layanan, tanggal, dan slot kosong.",
              "Dashboard menampilkan booking pending, confirmed, dan reschedule."
            ].map((step, index) => (
              <div key={step} className="flex gap-4 rounded-[24px] bg-white p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)] text-sm font-bold text-white">
                  0{index + 1}
                </div>
                <p className="pt-1 text-sm leading-7 text-[var(--muted)]">{step}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
