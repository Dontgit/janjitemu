import Link from "next/link";
import {
  ArrowUpRight,
  BellRing,
  BriefcaseBusiness,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  ChartColumn,
  LayoutGrid,
  LineChart,
  PanelLeft,
  Settings,
  Sparkles,
  Users,
  Workflow
} from "lucide-react";
import { logoutOwner } from "@/lib/actions";
import { getOptionalSessionUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

const linkGroups = [
  {
    label: "Ringkasan",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
      { href: "/analytics", label: "Analytics", icon: LineChart }
    ]
  },
  {
    label: "Operasional",
    items: [
      { href: "/bookings", label: "Bookings", icon: CalendarRange },
      { href: "/follow-ups", label: "Follow-up", icon: Workflow },
      { href: "/reminders", label: "Reminder", icon: BellRing },
      { href: "/schedule", label: "Jadwal", icon: CalendarDays }
    ]
  },
  {
    label: "Katalog",
    items: [
      { href: "/services", label: "Layanan", icon: Sparkles },
      { href: "/customers", label: "Customer", icon: Users }
    ]
  },
  {
    label: "Tim",
    items: [
      { href: "/team", label: "Team", icon: BriefcaseBusiness },
      { href: "/team/capacity", label: "Kapasitas", icon: ChartColumn },
      { href: "/team/schedule", label: "Jadwal staff", icon: CalendarClock },
      { href: "/team/blocked-dates", label: "Blocked dates", icon: CalendarClock }
    ]
  },
  {
    label: "Workspace",
    items: [{ href: "/settings", label: "Pengaturan", icon: Settings }]
  }
] as const;

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
      <div className="page-shell-wide grid min-h-screen gap-4 py-4 sm:gap-5 sm:py-5 xl:h-dvh xl:grid-cols-[292px_minmax(0,1fr)] xl:items-stretch xl:gap-0 xl:py-0">
        <aside className="glass-card rounded-[28px] border border-[var(--border)] p-4 sm:p-4 xl:sticky xl:top-0 xl:flex xl:h-dvh xl:flex-col xl:self-stretch xl:rounded-none xl:border-y-0 xl:border-l-0 xl:border-r xl:px-5 xl:py-5">
          <div className="rounded-[24px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(248,252,251,0.92))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_20px_rgba(20,49,44,0.05)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)] text-base font-bold text-white shadow-[0_12px_24px_rgba(15,118,110,0.22)]">
                T
              </div>
              <div className="min-w-0">
                <p className="font-semibold">Temujanji</p>
                <p className="truncate text-sm text-[var(--muted)]">
                  {sessionUser?.name ? sessionUser.name : "Owner workspace"}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-[20px] bg-[var(--surface-muted)] px-3 py-3 text-sm">
              <p className="text-[var(--muted)]">Booking link aktif</p>
              <p className="mt-1 line-clamp-2 font-medium text-[var(--foreground)]">{bookingLink}</p>
            </div>
          </div>

          <div className="mb-3 mt-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] xl:hidden">
            <PanelLeft className="h-4 w-4" />
            Navigasi cepat
          </div>

          <nav className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 xl:mx-0 xl:mt-4 xl:min-h-0 xl:flex-1 xl:flex-col xl:overflow-y-auto xl:overflow-x-hidden xl:px-0 xl:pb-3">
            {linkGroups.map((group) => (
              <section
                key={group.label}
                className="min-w-[252px] rounded-[22px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,252,251,0.88))] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_18px_rgba(20,49,44,0.04)] xl:min-w-0"
              >
                <div className="px-2 pb-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">{group.label}</p>
                </div>
                <div className="flex gap-2 xl:grid xl:gap-1.5">
                  {group.items.map(({ href, label, icon: Icon }) => {
                    const isActive = activePath === href;

                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          "group flex min-w-fit items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition xl:min-w-0",
                          isActive
                            ? "bg-[var(--primary)] text-white shadow-[0_12px_24px_rgba(15,118,110,0.2)]"
                            : "bg-white/82 text-[var(--foreground-soft)] hover:bg-white hover:text-[var(--foreground)]"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition",
                            isActive
                              ? "border-white/15 bg-white/10 text-white"
                              : "border-[var(--border)] bg-[var(--background-soft)] text-[var(--primary)] group-hover:border-teal-100 group-hover:bg-teal-50"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <p className="truncate xl:flex-1">{label}</p>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </nav>

          <div className="mt-4 rounded-[24px] bg-[#14312c] p-4 text-white shadow-[0_16px_34px_rgba(20,49,44,0.18)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">Workspace action</p>
            <div className="mt-3 space-y-2 text-sm">
              <Link href="/onboarding" className="flex items-center justify-between rounded-[16px] bg-white/8 px-3 py-3 text-white/90 transition hover:bg-white/12">
                <span>Atur profil bisnis</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <form action={logoutOwner}>
                <button type="submit" className="w-full rounded-[16px] bg-white/8 px-3 py-3 text-left text-white/80 transition hover:bg-white/12 hover:text-white">
                  Logout
                </button>
              </form>
            </div>
          </div>
        </aside>

        <main className="min-w-0 xl:h-dvh xl:overflow-y-auto xl:px-7 xl:py-5 2xl:px-8">{children}</main>
      </div>
    </div>
  );
}
