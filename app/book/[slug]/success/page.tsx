import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPublicBusiness } from "@/lib/data";

export default async function BookingSuccessPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const businessProfile = await getPublicBusiness(slug);

  return (
    <div className="page-shell flex min-h-screen items-center py-10">
      <Card className="mx-auto w-full max-w-2xl p-8 text-center sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
          Booking berhasil dikirim
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Customer langsung mendapat kepastian bahwa request sudah masuk
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          Halaman success ini masih mock, tapi sudah menampilkan pola yang benar untuk MVP: status awal, ringkasan singkat, dan langkah berikutnya.
        </p>

        <div className="mt-8 rounded-[28px] bg-white p-6 text-left">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-[var(--muted)]">Bisnis</p>
              <p className="font-semibold">{businessProfile.name}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Status</p>
              <p className="font-semibold text-amber-600">Pending confirmation</p>
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Booking link</p>
              <p className="font-semibold">{slug}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Reminder</p>
              <p className="font-semibold">{businessProfile.reminderChannel}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={`/book/${slug}`}
            className={buttonVariants("secondary", "w-full sm:w-auto")}
          >
            Buat booking lagi
          </Link>
          <Link href="/dashboard" className={buttonVariants("primary", "w-full sm:w-auto")}>
            Lihat dashboard owner
          </Link>
        </div>
      </Card>
    </div>
  );
}
