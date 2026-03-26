import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PublicBookingFlow } from "@/components/booking/public-booking-flow";
import { Card } from "@/components/ui/card";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { PageTutorial } from "@/components/ui/page-tutorial";
import { getPublicPageData } from "@/lib/data";
import { getFeedbackFromSearchParams, getPublicBookingValuesFromSearchParams } from "@/lib/feedback";

export default async function PublicBookingPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const { business, services, availability, availabilityByService, guidance } = await getPublicPageData(slug);
  const feedback = getFeedbackFromSearchParams(resolvedSearchParams);
  const initialValues = getPublicBookingValuesFromSearchParams(resolvedSearchParams);
  const mainServiceCount = services.filter((service) => !service.isAddon).length;
  const addOnCount = services.filter((service) => service.isAddon).length;

  return (
    <div className="page-shell py-5 sm:py-8 lg:py-10">
      <PageTutorial
        pageKey={`public-booking-${slug}`}
        pageTitle="Booking Publik"
        positionClassName="bottom-24 right-4 sm:bottom-4"
        steps={[
          {
            title: "Pilih layanan dan slot lebih dulu",
            description: "Bagian pertama dipakai customer untuk memilih layanan utama, add-on opsional, tanggal, lalu jam yang masih tersedia. Ini adalah inti proses booking.",
            tip: "Kalau slot kosong, customer bisa ganti tanggal atau kontak bisnis.",
            targetSelector: '[data-tutorial="public-booking-step-1"]',
            targetLabel: "Pilih layanan & slot"
          },
          {
            title: "Isi data inti secukupnya",
            description: "Step ini hanya meminta data yang benar-benar perlu untuk follow up: nama, WhatsApp, dan catatan penting bila ada kebutuhan khusus.",
            tip: "Customer tidak perlu isi terlalu banyak agar conversion tetap ringan.",
            targetSelector: '[data-tutorial="public-booking-step-2"]',
            targetLabel: "Data customer"
          },
          {
            title: "Review sebelum kirim",
            description: "Ringkasan membantu customer memastikan layanan, jadwal, estimasi biaya, dan detail kontak sudah benar sebelum booking dikirim.",
            tip: "Owner juga bisa pakai panel ini untuk QA tampilan halaman publik.",
            targetSelector: '[data-tutorial="public-booking-summary"]',
            targetLabel: "Ringkasan booking"
          }
        ]}
      />
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
      >
        <ChevronLeft className="h-4 w-4" />
        Kembali ke landing page
      </Link>

      <FeedbackBanner feedback={feedback} className="mb-6" />

      <Card className="mb-6 p-5 sm:p-6 lg:p-7">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-[var(--muted)]">Bisnis</p>
            <p className="mt-1 font-semibold">{business.name}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--muted)]">Katalog booking</p>
            <p className="mt-1 font-semibold">{mainServiceCount} layanan utama • {addOnCount} add-on</p>
          </div>
          <div>
            <p className="text-sm text-[var(--muted)]">Ketersediaan awal</p>
            <p className="mt-1 font-semibold">{availability.reduce((acc, day) => acc + day.slots.length, 0)} slot</p>
          </div>
        </div>
      </Card>

      <PublicBookingFlow
        slug={slug}
        business={business}
        services={services}
        availability={availability}
        availabilityByService={availabilityByService}
        guidance={guidance}
        initialValues={initialValues}
      />
    </div>
  );
}
