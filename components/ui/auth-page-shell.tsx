import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

type AuthHighlight = {
  label: string;
  value: string;
};

type AuthBullet = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type AuthPageShellProps = {
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroHighlights: AuthHighlight[];
  heroBullets: AuthBullet[];
  formCard: ReactNode;
  formWidthClassName?: string;
};

export function AuthPageShell({
  heroEyebrow,
  heroTitle,
  heroDescription,
  heroHighlights,
  heroBullets,
  formCard,
  formWidthClassName = "lg:grid-cols-[minmax(0,1fr)_540px]"
}: AuthPageShellProps) {
  return (
    <div className={`page-shell auth-shell gap-5 ${formWidthClassName} lg:gap-8`}>
      <Card className="auth-hero-panel hidden min-h-[640px] overflow-hidden p-8 text-white lg:block xl:p-10">
        <div className="auth-orb auth-orb-primary -left-16 top-8 h-48 w-48" />
        <div className="auth-orb auth-orb-accent right-0 top-0 h-56 w-56" />
        <div className="relative flex h-full flex-col justify-between rounded-[28px] p-1">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-100/90">{heroEyebrow}</p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
              {heroTitle}
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/72 xl:text-base">
              {heroDescription}
            </p>
          </div>

          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              {heroHighlights.map((item) => (
                <div key={item.label} className="soft-stat-strong rounded-[24px] p-4">
                  <p className="text-sm text-white/60">{item.label}</p>
                  <p className="mt-2 font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-3">
              {heroBullets.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex items-start gap-4 rounded-[24px] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-sm"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-teal-100">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-white">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-white/68">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center">{formCard}</div>
    </div>
  );
}
