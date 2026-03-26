import Link from "next/link";
import { logoutOwner } from "@/lib/actions";
import { getOptionalSessionUser } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";

export async function SiteHeader() {
  const sessionUser = await getOptionalSessionUser();

  return (
    <header className="sticky top-0 z-30 border-b border-white/50 bg-[#fbfaf6]/80 backdrop-blur-xl">
      <div className="page-shell flex items-center justify-between gap-4 py-4 lg:py-5">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)] text-sm font-bold text-white sm:h-11 sm:w-11">
            T
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold sm:text-lg">Temujanji</p>
            <p className="truncate text-xs text-[var(--muted)] sm:text-sm">Booking untuk bisnis jasa</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-[var(--muted)] lg:flex xl:gap-8">
          <Link href="#fitur">Fitur</Link>
          <Link href="#cara-kerja">Cara kerja</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/onboarding">Onboarding</Link>
          <Link href="/book/temujanji-studio">Demo booking</Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            {sessionUser ? (
              <>
                <Link href="/dashboard" className={buttonVariants("ghost", "hidden md:inline-flex")}>Dashboard</Link>
                <form action={logoutOwner}>
                  <button type="submit" className={buttonVariants("ghost", "hidden md:inline-flex")}>
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <Link href="/auth/login" className={buttonVariants("ghost", "hidden md:inline-flex")}>
                Login
              </Link>
            )}
          </div>
          <Link href="/book/temujanji-studio" className={buttonVariants("primary", "px-3 sm:px-4")}>
            <span className="hidden sm:inline">Coba booking</span>
            <span className="sm:hidden">Booking</span>
          </Link>
          <Link
            href={sessionUser ? "/dashboard" : "/auth/login"}
            className={buttonVariants("secondary", "px-3 sm:hidden")}
          >
            {sessionUser ? "Dashboard" : "Login"}
          </Link>
        </div>
      </div>
    </header>
  );
}
