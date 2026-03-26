import Link from "next/link";
import { CheckCheck, KeySquare, ShieldCheck, Timer } from "lucide-react";
import { redirect } from "next/navigation";
import { resetPassword } from "@/lib/actions";
import { getOptionalSessionUser } from "@/lib/auth";
import { getFeedbackFromSearchParams } from "@/lib/feedback";
import { SubmitButton } from "@/components/forms/submit-button";
import { AuthPageShell } from "@/components/ui/auth-page-shell";
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
  if (sessionUser) redirect("/dashboard");
  const feedback = getFeedbackFromSearchParams(resolvedSearchParams);

  return (
    <AuthPageShell
      heroEyebrow="Password recovery"
      heroTitle="Setel password baru dan lanjutkan kerja tanpa hambatan."
      heroDescription="Token reset dibuat singkat dan jelas agar owner bisa segera kembali ke dashboard, dengan bahasa visual yang sekarang sejalan dengan seluruh auth flow."
      heroHighlights={[
        { label: "Token", value: "Sekali pakai" },
        { label: "Valid", value: "30 menit" },
        { label: "Session", value: "Aman ulang" }
      ]}
      heroBullets={[
        {
          icon: Timer,
          title: "Berlaku terbatas",
          description: "Reset link hanya aktif sebentar supaya risiko penyalahgunaan lebih kecil."
        },
        {
          icon: ShieldCheck,
          title: "Session lama ditutup",
          description: "Setelah password berubah, session sebelumnya ikut tidak berlaku."
        },
        {
          icon: KeySquare,
          title: "Akses balik ke dashboard",
          description: "Setelah reset berhasil, owner bisa login ulang dan kembali bekerja tanpa drama."
        }
      ]}
      formWidthClassName="lg:grid-cols-[minmax(0,1fr)_520px]"
      formCard={
        <Card className="mx-auto w-full max-w-xl p-6 sm:p-8 xl:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">Password baru</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Setel ulang password</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-[15px]">
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
            <div className="mt-8 rounded-[24px] border border-dashed border-[var(--border)] bg-slate-50 p-4 text-sm text-[var(--muted)]">
              Token reset tidak ditemukan. Minta link baru dari halaman forgot password.
            </div>
          )}
          <div className="mt-6 rounded-[24px] border border-teal-100 bg-teal-50/70 p-4 text-sm text-[var(--muted)]">
            <div className="flex items-start gap-3">
              <CheckCheck className="mt-0.5 h-4 w-4 text-[var(--primary)]" />
              <p>Gunakan kombinasi password yang kuat agar akses owner tetap aman saat dipakai di banyak perangkat.</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-[var(--muted)]">
            Butuh link baru? <Link href="/auth/forgot-password" className="font-semibold text-[var(--primary)]">Buat ulang reset link</Link>
          </p>
        </Card>
      }
    />
  );
}
