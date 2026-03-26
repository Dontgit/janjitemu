import Link from "next/link";
import { redirect } from "next/navigation";
import { registerOwner } from "@/lib/actions";
import { getOptionalSessionUser } from "@/lib/auth";
import { getFeedbackFromSearchParams } from "@/lib/feedback";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card } from "@/components/ui/card";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Input } from "@/components/ui/input";

export default async function RegisterPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [sessionUser, resolvedSearchParams] = await Promise.all([getOptionalSessionUser(), searchParams]);
  if (sessionUser) {
    redirect("/dashboard");
  }

  const feedback = getFeedbackFromSearchParams(resolvedSearchParams);

  return (
    <div className="page-shell flex min-h-screen items-center py-10">
      <Card className="mx-auto w-full max-w-md p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
          Register
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Daftarkan bisnis ke Temujanji</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          Buat akun untuk mulai menerima booking online dan mengatur jadwal bisnismu dengan lebih rapi.
        </p>

        <FeedbackBanner feedback={feedback} className="mt-6" />

        <form action={registerOwner} className="mt-8 space-y-4">
          <input type="hidden" name="redirectTo" value="/auth/register" />
          <Input name="name" placeholder="Nama owner" required />
          <Input type="email" name="email" placeholder="Email" required />
          <Input name="businessName" placeholder="Nama bisnis" required />
          <Input name="slug" placeholder="Slug bisnis (opsional)" />
          <Input type="password" name="password" placeholder="Password minimal 10 karakter, huruf dan angka" required />
          <SubmitButton className="w-full">Buat akun</SubmitButton>
        </form>

        <p className="mt-6 text-sm text-[var(--muted)]">
          Sudah punya akun?{" "}
          <Link href="/auth/login" className="font-semibold text-[var(--primary)]">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}
