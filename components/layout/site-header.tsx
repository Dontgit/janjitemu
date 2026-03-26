import Link from "next/link";
import { logoutOwner } from "@/lib/actions";
import { getOptionalSessionUser } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";

export async function SiteHeader() {
  const sessionUser = await getOptionalSessionUser();

  return (
    <header className="sticky top-0 z-30 border-b border-white/50 bg-[#fbfaf6]/80 backdrop-blur-xl">
      <div className="page-shell flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--primary)] text-sm font-bold text-white">
            T
          </div>
          <div>
            <p className="text-base font-semibold">Temujanji</p>
            <p className="text-xs text-[var(--muted)]">Booking untuk bisnis jasa</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-[var(--muted)] md:flex">
          <Link href="#fitur">Fitur</Link>
          <Link href="#cara-kerja">Cara kerja</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/onboarding">Onboarding</Link>
          <Link href="/book/temujanji-studio">Demo booking</Link>
        </nav>

        <div className="flex items-center gap-2">
          {sessionUser ? (
            <>
              <Link href="/dashboard" className={buttonVariants("ghost", "hidden sm:inline-flex")}>
                Dashboard
              </Link>
              <form action={logoutOwner}>
                <button type="submit" className={buttonVariants("ghost", "hidden sm:inline-flex")}>
                  Logout
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/auth/login"
              className={buttonVariants("ghost", "hidden sm:inline-flex")}
            >
              Login
            </Link>
          )}
          <Link href="/book/temujanji-studio" className={buttonVariants()}>
            Coba booking
          </Link>
        </div>
      </div>
    </header>
  );
}
