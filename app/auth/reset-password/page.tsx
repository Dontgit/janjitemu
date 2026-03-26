import Link from "next/link";
import { redirect } from "next/navigation";
import { resetPassword } from "@/lib/actions";
import { getOptionalSessionUser } from "@/lib/auth";
import { getFeedbackFromSearchParams } from "@/lib/feedback";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card } from "@/components/ui/card";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Input } from "@/components/ui/input";

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [sessionUser, resolvedSearchParams] = await Promise.all([getOptionalSessionUser(), searchParams]);
  const token = typeof resolvedSearchParams.token === "string" ? resolvedSearchParams.token : "";

  if (sessionUser) {
    redirect("/dashboard");
  }

  const feedback = getFeedbackFromSearchParams(resolvedSearchParams);

  return (
    <div className="page-shell flex min-h-screen items-center py-10">
      <Card className="mx-auto w-full max-w-md p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">Password baru</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Setel ulang password</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          Link reset berlaku 30 menit dan hanya bisa dipakai sekali. Setelah berhasil, semua session lama ikut tidak berlaku.
        </p>

        <FeedbackBanner feedback={feedback} className="mt-6" />

        {token ? (
          <form action={resetPassword} className="mt-8 space-y-4">
            <input type="hidden" name="redirectTo" value="/auth/reset-password" />
            <input type="hidden" name="token" value={token} />
            <Input type="password" name="password" placeholder="Password baru minimal 10 karakter, huruf dan angka" required />
            <Input type="password" name="confirmPassword" placeholder="Ulangi password baru" required />
            <SubmitButton className="w-full">Simpan password baru</SubmitButton>
          </form>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-slate-50 p-4 text-sm text-[var(--muted)]">
            Token reset tidak ditemukan. Minta link baru dari halaman forgot password.
          </div>
        )}

        <p className="mt-6 text-sm text-[var(--muted)]">
          Butuh link baru?{" "}
          <Link href="/auth/forgot-password" className="font-semibold text-[var(--primary)]">
            Buat ulang reset link
          </Link>
        </p>
      </Card>
    </div>
  );
}
