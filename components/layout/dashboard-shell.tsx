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
    description: "Pantau kesehatan bisnis dan ritme operasional.",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
      { href: "/analytics", label: "Analytics", icon: LineChart }
    ]
  },
  {
    label: "Operasional",
    description: "Kelola booking, follow-up, reminder, dan jadwal harian.",
    items: [
      { href: "/bookings", label: "Bookings", icon: CalendarRange },
      { href: "/follow-ups", label: "Follow-up", icon: Workflow },
      { href: "/reminders", label: "Reminder", icon: BellRing },
      { href: "/schedule", label: "Jadwal", icon: CalendarDays }
    ]
  },
  {
    label: "Katalog & relasi",
    description: "Atur layanan dan customer yang aktif dipakai tim.",
    items: [
      { href: "/services", label: "Layanan", icon: Sparkles },
      { href: "/customers", label: "Customer", icon: Users }
    ]
  },
  {
    label: "Tim",
    description: "Pantau roster, kapasitas, schedule, dan blocked dates staff.",
    items: [
      { href: "/team", label: "Team", icon: BriefcaseBusiness },
      { href: "/team/capacity", label: "Kapasitas staff", icon: ChartColumn },
      { href: "/team/schedule", label: "Jadwal staff", icon: CalendarClock },
      { href: "/team/blocked-dates", label: "Blocked dates", icon: CalendarClock }
    ]
  },
  {
    label: "Workspace",
    description: "Setup bisnis dan pengaturan workspace owner.",
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
      <div className="page-shell-wide grid min-h-screen gap-5 py-4 sm:gap-6 sm:py-6 xl:h-dvh xl:grid-cols-[320px_minmax(0,1fr)] xl:items-stretch xl:gap-0 xl:py-0">
        <aside className="glass-card rounded-[30px] border border-[var(--border)] p-4 sm:p-5 xl:sticky xl:top-0 xl:flex xl:h-dvh xl:flex-col xl:self-stretch xl:rounded-none xl:border-y-0 xl:border-l-0 xl:border-r xl:px-6 xl:py-6">
          <div className="rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,252,251,0.92))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_24px_rgba(20,49,44,0.05)] sm:p-5">
            <div className="flex items-center gap-3">
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
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="surface-subtle rounded-[20px] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Mode</p>
                <p className="mt-1 font-semibold text-[var(--foreground)]">Operational</p>
              </div>
              <div className="surface-subtle rounded-[20px] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Scope</p>
                <p className="mt-1 font-semibold text-[var(--foreground)]">Owner dashboard</p>
              </div>
            </div>
          </div>

          <div className="mb-4 mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)] xl:hidden">
            <PanelLeft className="h-4 w-4" />
            Navigasi cepat
          </div>

          <nav className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 xl:mx-0 xl:mt-5 xl:min-h-0 xl:flex-1 xl:flex-col xl:overflow-y-auto xl:overflow-x-hidden xl:px-0 xl:pb-4">
            {linkGroups.map((group) => (
              <section
                key={group.label}
                className="min-w-[280px] rounded-[26px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,252,251,0.88))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_22px_rgba(20,49,44,0.04)] xl:min-w-0"
              >
                <div className="px-2 pb-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">{group.label}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{group.description}</p>
                </div>
                <div className="flex gap-2 xl:grid xl:gap-2">
                  {group.items.map(({ href, label, icon: Icon }) => {
                    const isActive = activePath === href;

                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          "group flex min-w-fit items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition xl:min-w-0",
                          isActive
                            ? "bg-[var(--primary)] text-white shadow-[0_14px_28px_rgba(15,118,110,0.22)]"
                            : "bg-white/82 text-[var(--foreground-soft)] hover:bg-white hover:text-[var(--foreground)]"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition",
                            isActive
                              ? "border-white/15 bg-white/10 text-white"
                              : "border-[var(--border)] bg-[var(--background-soft)] text-[var(--primary)] group-hover:border-teal-100 group-hover:bg-teal-50"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 xl:flex-1">
                          <p className="truncate">{label}</p>
                          <p className={cn("mt-0.5 text-[11px]", isActive ? "text-white/72" : "text-[var(--muted)]")}>{group.label}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </nav>

          <div className="mt-5 rounded-[28px] bg-[#14312c] p-5 text-white shadow-[0_18px_40px_rgba(20,49,44,0.2)] sm:mt-6 xl:mt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.16em] text-white/60">Link publik</p>
                <p className="mt-2 break-all text-sm font-medium leading-6">{bookingLink}</p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-teal-100">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-xs leading-6 text-white/70">
              Siap dibagikan ke Instagram bio, WhatsApp, dan Google Business Profile.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold">
              <Link href="/onboarding" className="inline-flex text-teal-200">
                Atur profil bisnis
              </Link>
              <form action={logoutOwner}>
                <button type="submit" className="inline-flex text-white/80">
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
