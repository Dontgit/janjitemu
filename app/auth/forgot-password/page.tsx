import Link from "next/link";
import { KeyRound, MailCheck, ShieldAlert } from "lucide-react";
import { redirect } from "next/navigation";
import { requestPasswordReset } from "@/lib/actions";
import { getOptionalSessionUser } from "@/lib/auth";
import { getFeedbackFromSearchParams } from "@/lib/feedback";
import { SubmitButton } from "@/components/forms/submit-button";
import { AuthPageShell } from "@/components/ui/auth-page-shell";
import { Card } from "@/components/ui/card";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Input } from "@/components/ui/input";

export default async function ForgotPasswordPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [sessionUser, resolvedSearchParams] = await Promise.all([getOptionalSessionUser(), searchParams]);
  if (sessionUser) redirect("/dashboard");
  const feedback = getFeedbackFromSearchParams(resolvedSearchParams);
  const resetLink = typeof resolvedSearchParams.resetLink === "string" ? resolvedSearchParams.resetLink : "";

  return (
    <AuthPageShell
      heroEyebrow="Akses akun"
      heroTitle="Pulihkan akses owner tanpa alur yang ribet."
      heroDescription="Gunakan email akun untuk membuat link reset sekali pakai. Tampilan dipoles agar terasa sekelas dengan halaman login dan register, tanpa mengubah alur reset yang sudah ada."
      heroHighlights={[
        { label: "Reset link", value: "Sekali pakai" },
        { label: "Owner", value: "Tetap aman" },
        { label: "Flow", value: "Ringkas" }
      ]}
      heroBullets={[
        {
          icon: KeyRound,
          title: "Pemulihan cepat",
          description: "Owner bisa kembali ke dashboard tanpa proses yang bertele-tele."
        },
        {
          icon: MailCheck,
          title: "Berbasis email akun",
          description: "Gunakan email yang terdaftar agar reset link tetap terikat pada akun yang benar."
        },
        {
          icon: ShieldAlert,
          title: "Risiko lebih terkontrol",
          description: "Tautan pemulihan dirancang untuk sekali pakai agar akses lama tidak terus terbuka."
        }
      ]}
      formWidthClassName="lg:grid-cols-[minmax(0,1fr)_500px]"
      formCard={
        <Card className="mx-auto w-full max-w-xl p-6 sm:p-8 xl:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">Reset password</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Lupa password owner</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-[15px]">
            Masukkan email akunmu, lalu gunakan tautan pemulihan yang muncul untuk mengganti password.
          </p>
          <FeedbackBanner feedback={feedback} className="mt-6" />
          {resetLink ? (
            <div className="mt-4 rounded-[24px] border border-dashed border-[var(--border)] bg-slate-50 p-4 text-sm">
              <p className="font-medium">Link reset sekali pakai</p>
              <p className="mt-2 break-all text-[var(--muted)]">{resetLink}</p>
            </div>
          ) : null}
          <form action={requestPasswordReset} className="mt-8 space-y-4">
            <input type="hidden" name="redirectTo" value="/auth/forgot-password" />
            <Input type="email" name="email" placeholder="Email akun owner" required />
            <SubmitButton className="w-full" pendingLabel="Sedang membuat link...">Buat link reset</SubmitButton>
          </form>
          <p className="mt-6 text-sm text-[var(--muted)]">
            Sudah ingat password? <Link href="/auth/login" className="font-semibold text-[var(--primary)]">Kembali ke login</Link>
          </p>
        </Card>
      }
    />
  );
}
