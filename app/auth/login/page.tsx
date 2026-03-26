import Link from "next/link";
import { redirect } from "next/navigation";
import { loginOwner } from "@/lib/actions";
import { getOptionalSessionUser } from "@/lib/auth";
import { getFeedbackFromSearchParams } from "@/lib/feedback";
import { SubmitButton } from "@/components/forms/submit-button";
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
    <div className="page-shell flex min-h-screen items-center py-10">
      <Card className="mx-auto w-full max-w-md p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
          Login
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Masuk ke dashboard Temujanji</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          Login owner memakai session cookie `httpOnly` yang ditandatangani. Pastikan `DATABASE_URL` dan `AUTH_SECRET` sudah terisi agar auth aktif penuh.
        </p>

        <FeedbackBanner feedback={feedback} className="mt-6" />

        <form action={loginOwner} className="mt-8 space-y-4">
          <input type="hidden" name="redirectTo" value="/auth/login" />
          <input type="hidden" name="next" value={next} />
          <Input type="email" name="email" placeholder="Email bisnis" required />
          <Input type="password" name="password" placeholder="Password" required />
          <SubmitButton className="w-full">Login</SubmitButton>
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
            <Link href="/auth/register" className="font-semibold text-[var(--primary)]">
              Buat akun owner
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
