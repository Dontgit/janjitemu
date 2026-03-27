import { Gem, TimerReset } from "lucide-react";
import { deleteService, updateService } from "@/lib/actions";
import { formatCurrency } from "@/lib/utils";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ServiceOption = {
  id: string;
  name: string;
  price: number;
  duration: number;
};

type ServiceCardProps = {
  service: {
    id: string;
    name: string;
    price: number;
    description: string;
    duration: number;
    active?: boolean | null;
    popular?: boolean;
    isAddon?: boolean;
    linkedAddonNames?: string[];
    allowedPrimaryServiceNames?: string[];
    allowedPrimaryServiceIds?: string[];
  };
  currentPath: string;
  primaryServiceOptions: ServiceOption[];
};

export function ServiceCard({ service, currentPath, primaryServiceOptions }: ServiceCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold tracking-tight">{service.name}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{formatCurrency(service.price)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {service.isAddon ? (
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
              add-on
            </span>
          ) : null}
          {service.popular ? (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
              populer
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <div className="surface-card rounded-[20px] p-4">
          <p className="text-sm text-[var(--muted)]">{service.isAddon ? "Cakupan add-on" : "Add-on terkait"}</p>
          <p className="mt-1 font-semibold">
            {service.isAddon
              ? service.allowedPrimaryServiceNames && service.allowedPrimaryServiceNames.length > 0
                ? service.allowedPrimaryServiceNames.join(", ")
                : "Semua layanan utama"
              : service.linkedAddonNames && service.linkedAddonNames.length > 0
                ? service.linkedAddonNames.join(", ")
                : "Belum ada add-on khusus"}
          </p>
        </div>
      </div>

      <form action={updateService} className="mt-5 space-y-4">
        <input type="hidden" name="redirectTo" value={currentPath} />
        <input type="hidden" name="serviceId" value={service.id} />
        <div className="space-y-3">
          <Input name="name" defaultValue={service.name} required />
          <Textarea name="description" rows={4} defaultValue={service.description} required />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="soft-stat rounded-[22px] p-4 text-sm">
            <div className="mb-2 flex items-center gap-2 text-[var(--muted)]">
              <TimerReset className="h-4 w-4 text-[var(--primary)]" />
              Durasi
            </div>
            <Input name="duration" type="number" min="15" step="15" defaultValue={service.duration} />
          </div>
          <div className="soft-stat rounded-[22px] p-4 text-sm">
            <div className="mb-2 flex items-center gap-2 text-[var(--muted)]">
              <Gem className="h-4 w-4 text-[var(--primary)]" />
              Harga
            </div>
            <Input name="price" type="number" min="0" step="1000" defaultValue={service.price} />
            <p className="mt-2 text-xs text-[var(--muted)]">{formatCurrency(service.price)}</p>
          </div>
        </div>

        <div className="field-card rounded-[24px] p-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="active" defaultChecked={service.active ?? true} />
              Aktif di booking publik
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="popular" defaultChecked={service.popular} />
              Populer
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isAddon" defaultChecked={service.isAddon} />
              Add-on
            </label>
          </div>
        </div>

        <div className="field-card rounded-[24px] p-4">
          <p className="text-sm font-semibold">Aturan add-on per layanan utama</p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Dipakai saat layanan ini ditandai sebagai add-on. Kosongkan untuk membuat add-on tersedia di semua layanan utama.
          </p>
          {primaryServiceOptions.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {primaryServiceOptions
                .filter((option) => option.id !== service.id)
                .map((option) => (
                  <label key={option.id} className="field-card flex items-start gap-3 rounded-2xl px-4 py-3 text-sm">
                    <input
                      type="checkbox"
                      name="allowedPrimaryServiceIds"
                      value={option.id}
                      defaultChecked={service.allowedPrimaryServiceIds?.includes(option.id)}
                    />
                    <span>
                      <span className="block font-semibold text-[var(--foreground)]">{option.name}</span>
                      <span className="block text-[var(--muted)]">
                        {formatCurrency(option.price)} • {option.duration} menit
                      </span>
                    </span>
                  </label>
                ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--muted)]">Belum ada layanan utama untuk dipilih.</p>
          )}
        </div>

        <SubmitButton variant="secondary" className="w-full">
          Simpan perubahan
        </SubmitButton>
      </form>
      <form action={deleteService} className="mt-3">
        <input type="hidden" name="redirectTo" value={currentPath} />
        <input type="hidden" name="serviceId" value={service.id} />
        <SubmitButton variant="ghost" className="w-full">
          Hapus / nonaktifkan
        </SubmitButton>
      </form>
    </Card>
  );
}
