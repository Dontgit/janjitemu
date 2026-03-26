import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PublicBookingFlow } from "@/components/booking/public-booking-flow";
import { Card } from "@/components/ui/card";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
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

  return (
    <div className="page-shell py-5 sm:py-8 lg:py-10">
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
            <p className="text-sm text-[var(--muted)]">Layanan aktif</p>
            <p className="mt-1 font-semibold">{services.length} layanan</p>
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
