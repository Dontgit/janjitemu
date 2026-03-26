import Link from "next/link";
import { redirect } from "next/navigation";
import { requestPasswordReset } from "@/lib/actions";
import { getOptionalSessionUser } from "@/lib/auth";
import { getFeedbackFromSearchParams } from "@/lib/feedback";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card } from "@/components/ui/card";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Input } from "@/components/ui/input";

export default async function ForgotPasswordPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [sessionUser, resolvedSearchParams] = await Promise.all([getOptionalSessionUser(), searchParams]);
  if (sessionUser) {
    redirect("/dashboard");
  }

  const feedback = getFeedbackFromSearchParams(resolvedSearchParams);
  const resetLink = typeof resolvedSearchParams.resetLink === "string" ? resolvedSearchParams.resetLink : "";

  return (
    <div className="page-shell flex min-h-screen items-center py-10">
      <Card className="mx-auto w-full max-w-md p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">Reset password</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Lupa password owner</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          Versi MVP ini belum mengirim email otomatis. Sebagai gantinya, sistem membuat link reset sekali pakai yang bisa langsung dibuka, dengan throttling dasar agar tidak mudah disalahgunakan.
        </p>

        <FeedbackBanner feedback={feedback} className="mt-6" />

        {resetLink ? (
          <div className="mt-4 rounded-2xl border border-dashed border-[var(--border)] bg-slate-50 p-4 text-sm">
            <p className="font-medium">Link reset sekali pakai</p>
            <p className="mt-2 break-all text-[var(--muted)]">{resetLink}</p>
          </div>
        ) : null}

        <form action={requestPasswordReset} className="mt-8 space-y-4">
          <input type="hidden" name="redirectTo" value="/auth/forgot-password" />
          <Input type="email" name="email" placeholder="Email akun owner" required />
          <SubmitButton className="w-full">Buat link reset</SubmitButton>
        </form>

        <p className="mt-6 text-sm text-[var(--muted)]">
          Sudah ingat password?{" "}
          <Link href="/auth/login" className="font-semibold text-[var(--primary)]">
            Kembali ke login
          </Link>
        </p>
      </Card>
    </div>
  );
}
