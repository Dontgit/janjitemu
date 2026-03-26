import Link from "next/link";
import {
  CalendarRange,
  ChartColumn,
  Settings,
  Sparkles,
  Users,
  CalendarDays,
  PanelLeft,
  ArrowUpRight
} from "lucide-react";
import { logoutOwner } from "@/lib/actions";
import { getOptionalSessionUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: ChartColumn },
  { href: "/bookings", label: "Bookings", icon: CalendarRange },
  { href: "/services", label: "Layanan", icon: Sparkles },
  { href: "/customers", label: "Customer", icon: Users },
  { href: "/schedule", label: "Jadwal", icon: CalendarDays },
  { href: "/settings", label: "Pengaturan", icon: Settings }
];

export async function DashboardShell({
  children,
  activePath,
  bookingLink = "https://janjitemu.gobisnis.cloud/book/temujanji-studio"
}: {
  children: React.ReactNode;
  activePath: string;
  bookingLink?: string;
}) {
  const sessionUser = await getOptionalSessionUser();

  return (
    <div className="min-h-screen bg-transparent xl:h-dvh xl:overflow-hidden">
      <div className="page-shell-wide grid min-h-screen gap-5 py-4 sm:gap-6 sm:py-6 xl:h-dvh xl:grid-cols-[300px_minmax(0,1fr)] xl:items-stretch xl:gap-0 xl:py-0">
        <aside className="glass-card rounded-[30px] border border-[var(--border)] p-4 sm:p-5 xl:sticky xl:top-0 xl:flex xl:h-dvh xl:flex-col xl:self-stretch xl:rounded-none xl:border-y-0 xl:border-l-0 xl:border-r xl:px-6 xl:py-6">
          <div className="mb-5 flex items-center gap-3 sm:mb-6 xl:mb-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)] text-lg font-bold text-white shadow-[0_14px_32px_rgba(15,118,110,0.25)]">
              T
            </div>
            <div className="min-w-0">
              <p className="font-semibold sm:text-lg">Temujanji</p>
              <p className="truncate text-sm text-[var(--muted)]">
                {sessionUser?.name ? `Owner workspace • ${sessionUser.name}` : "Owner workspace"}
              </p>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)] xl:hidden">
            <PanelLeft className="h-4 w-4" />
            Navigasi cepat
          </div>

          <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 xl:mx-0 xl:grid xl:gap-2 xl:overflow-visible xl:px-0 xl:pb-0">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex min-w-fit items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition xl:min-w-0",
                  activePath === href
                    ? "bg-[var(--primary)] text-white shadow-[0_10px_25px_rgba(15,118,110,0.2)]"
                    : "bg-white/70 text-[var(--muted)] hover:bg-white hover:text-[var(--foreground)]"
                )}
              >
                <span className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl border transition",
                  activePath === href
                    ? "border-white/15 bg-white/10 text-white"
                    : "border-[var(--border)] bg-white text-[var(--primary)] group-hover:border-teal-100 group-hover:bg-teal-50"
                )}>
                  <Icon className="h-4 w-4" />
                </span>
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-5 rounded-[26px] bg-[#14312c] p-5 text-white shadow-[0_18px_40px_rgba(20,49,44,0.2)] sm:mt-6 xl:mt-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-white/70">Link publik</p>
                <p className="mt-2 break-all text-sm font-medium leading-6">{bookingLink}</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-teal-100">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-xs leading-6 text-white/70">
              Siap dibagikan ke Instagram bio, WhatsApp, dan Google Business Profile.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link href="/onboarding" className="inline-flex text-xs font-semibold text-teal-200">
                Atur profil bisnis
              </Link>
              <form action={logoutOwner}>
                <button type="submit" className="inline-flex text-xs font-semibold text-white/80">
                  Logout
                </button>
              </form>
            </div>
          </div>
        </aside>

        <main className="min-w-0 xl:h-dvh xl:overflow-y-auto xl:px-8 xl:py-6">{children}</main>
      </div>
    </div>
  );
}
