import Link from "next/link";
import { ArrowRight, CalendarDays, LayoutDashboard, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { loginOwner } from "@/lib/actions";
import { getOptionalSessionUser } from "@/lib/auth";
import { getFeedbackFromSearchParams } from "@/lib/feedback";
import { SubmitButton } from "@/components/forms/submit-button";
import { AuthPageShell } from "@/components/ui/auth-page-shell";
import { Card } from "@/components/ui/card";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Input } from "@/components/ui/input";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [sessionUser, resolvedSearchParams] = await Promise.all([getOptionalSessionUser(), searchParams]);
  const next =
    typeof resolvedSearchParams.next === "string" && resolvedSearchParams.next.startsWith("/")
      ? resolvedSearchParams.next
      : "/dashboard";

  if (sessionUser) {
    redirect(next);
  }

  const feedback = getFeedbackFromSearchParams(resolvedSearchParams);

  return (
    <AuthPageShell
      heroEyebrow="Temujanji"
      heroTitle="Masuk cepat ke workspace booking bisnis Anda."
      heroDescription="Pantau booking masuk, rapikan jadwal harian, dan tindak lanjuti customer dari satu dashboard yang terasa premium di desktop maupun mobile."
      heroHighlights={[
        { label: "Booking", value: "Publik + manual" },
        { label: "Status", value: "Pending sampai selesai" },
        { label: "Owner", value: "Satu layar kerja" }
      ]}
      heroBullets={[
        {
          icon: LayoutDashboard,
          title: "Dashboard yang fokus",
          description: "Lihat ringkasan booking, customer, dan layanan tanpa berpindah banyak layar."
        },
        {
          icon: CalendarDays,
          title: "Jadwal lebih rapi",
          description: "Akses kalender operasional dan booking mendatang dengan ritme visual yang konsisten."
        },
        {
          icon: Sparkles,
          title: "Siap untuk follow up",
          description: "Gunakan data customer dan status booking untuk merespons lebih cepat."
        }
      ]}
      formWidthClassName="lg:grid-cols-[minmax(0,1fr)_500px]"
      formCard={
        <Card className="mx-auto w-full max-w-xl p-6 sm:p-8 xl:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">Login</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Masuk ke dashboard Temujanji</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-[15px]">
            Masuk untuk mengelola layanan, jadwal, dan booking pelanggan dari satu tempat.
          </p>

          <FeedbackBanner feedback={feedback} className="mt-6" />

          <form action={loginOwner} className="mt-8 space-y-4">
            <input type="hidden" name="redirectTo" value="/auth/login" />
            <input type="hidden" name="next" value={next} />
            <Input type="email" name="email" placeholder="Email bisnis" required />
            <Input type="password" name="password" placeholder="Password" required />
            <SubmitButton className="w-full" pendingLabel="Sedang login...">Login</SubmitButton>
          </form>

          <div className="mt-6 space-y-3 text-sm text-[var(--muted)]">
            <p>
              Lupa password?{" "}
              <Link href="/auth/forgot-password" className="font-semibold text-[var(--primary)]">
                Buat link reset
              </Link>
            </p>
            <p>
              Belum punya akun?{" "}
              <Link href="/auth/register" className="inline-flex items-center gap-1 font-semibold text-[var(--primary)]">
                Buat akun owner
                <ArrowRight className="h-4 w-4" />
              </Link>
            </p>
          </div>
        </Card>
      }
    />
  );
}
