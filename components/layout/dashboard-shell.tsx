import Link from "next/link";
import {
  CalendarRange,
  ChartColumn,
  Settings,
  Sparkles,
  Users,
  CalendarDays
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
  bookingLink = "temujanji.app/book/temujanji-studio"
}: {
  children: React.ReactNode;
  activePath: string;
  bookingLink?: string;
}) {
  const sessionUser = await getOptionalSessionUser();

  return (
    <div className="min-h-screen bg-transparent">
      <div className="page-shell grid gap-6 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="glass-card rounded-[32px] border border-[var(--border)] p-5">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)] text-lg font-bold text-white">
              T
            </div>
            <div>
              <p className="font-semibold">Temujanji</p>
              <p className="text-sm text-[var(--muted)]">
                {sessionUser?.name ? `Owner workspace • ${sessionUser.name}` : "Owner workspace"}
              </p>
            </div>
          </div>

          <nav className="space-y-2">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  activePath === href
                    ? "bg-[var(--primary)] text-white shadow-[0_10px_25px_rgba(15,118,110,0.2)]"
                    : "text-[var(--muted)] hover:bg-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-[24px] bg-[#14312c] p-5 text-white">
            <p className="text-sm text-white/70">Link publik</p>
            <p className="mt-2 text-sm font-medium">{bookingLink}</p>
            <p className="mt-3 text-xs leading-6 text-white/70">
              Siap dibagikan ke Instagram bio, WhatsApp, dan Google Business Profile.
            </p>
            <Link
              href="/onboarding"
              className="mt-4 inline-flex text-xs font-semibold text-teal-200"
            >
              Atur profil bisnis
            </Link>
            <form action={logoutOwner} className="mt-3">
              <button type="submit" className="inline-flex text-xs font-semibold text-white/80">
                Logout
              </button>
            </form>
          </div>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}
