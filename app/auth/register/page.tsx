import Link from "next/link";
import { Building2, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { registerOwner } from "@/lib/actions";
import { getOptionalSessionUser } from "@/lib/auth";
import { getFeedbackFromSearchParams } from "@/lib/feedback";
import { SubmitButton } from "@/components/forms/submit-button";
import { AuthPageShell } from "@/components/ui/auth-page-shell";
import { Card } from "@/components/ui/card";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Input } from "@/components/ui/input";

export default async function RegisterPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [sessionUser, resolvedSearchParams] = await Promise.all([getOptionalSessionUser(), searchParams]);
  if (sessionUser) redirect("/dashboard");
  const feedback = getFeedbackFromSearchParams(resolvedSearchParams);

  return (
    <AuthPageShell
      heroEyebrow="Owner setup"
      heroTitle="Buka halaman booking publik dalam beberapa menit."
      heroDescription="Buat akun owner, siapkan profil bisnis, lalu mulai terima booking tanpa pindah tool. Semua auth page sekarang terasa satu keluarga visual yang sama."
      heroHighlights={[
        { label: "Setup", value: "Cepat & rapi" },
        { label: "Booking", value: "Siap dibagikan" },
        { label: "Dashboard", value: "Langsung terhubung" }
      ]}
      heroBullets={[
        {
          icon: Building2,
          title: "Profil bisnis langsung siap",
          description: "Nama bisnis, slug, dan akun owner disusun dalam satu alur yang sederhana."
        },
        {
          icon: Sparkles,
          title: "Booking page lebih meyakinkan",
          description: "Begitu setup selesai, halaman publik dan dashboard memakai kualitas visual yang sejalan."
        },
        {
          icon: ShieldCheck,
          title: "Akses owner aman",
          description: "Password dan sesi dipakai untuk menjaga operasional tetap di tangan pemilik bisnis."
        }
      ]}
      formWidthClassName="lg:grid-cols-[minmax(0,1fr)_560px]"
      formCard={
        <Card className="mx-auto w-full max-w-2xl p-6 sm:p-8 xl:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">Register</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Daftarkan bisnis ke Temujanji</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-[15px]">
            Buat akun untuk mulai menerima booking online dan mengatur jadwal bisnismu dengan lebih rapi.
          </p>
          <FeedbackBanner feedback={feedback} className="mt-6" />
          <form action={registerOwner} className="mt-8 grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="redirectTo" value="/auth/register" />
            <Input name="name" placeholder="Nama owner" required />
            <Input type="email" name="email" placeholder="Email" required />
            <Input name="businessName" placeholder="Nama bisnis" required />
            <Input name="slug" placeholder="Slug bisnis (opsional)" />
            <div className="sm:col-span-2">
              <Input type="password" name="password" placeholder="Password minimal 10 karakter, huruf dan angka" required />
            </div>
            <SubmitButton className="w-full sm:col-span-2">Buat akun</SubmitButton>
          </form>
          <div className="mt-6 rounded-[24px] border border-teal-100 bg-teal-50/70 p-4 text-sm text-[var(--muted)]">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--primary)]" />
              <p>Sesudah akun jadi, kamu bisa lanjut melengkapi layanan, jam operasional, dan link booking publik dari dashboard.</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-[var(--muted)]">
            Sudah punya akun? <Link href="/auth/login" className="font-semibold text-[var(--primary)]">Login</Link>
          </p>
        </Card>
      }
    />
  );
}
