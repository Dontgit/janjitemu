import Link from "next/link";
import { MessageCircleMore } from "lucide-react";
import { deleteCustomer, updateCustomer } from "@/lib/actions";
import { formatDateTimeLabel } from "@/lib/utils";
import { SubmitButton } from "@/components/forms/submit-button";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type CustomerCardProps = {
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    source?: string | null;
    notes?: string | null;
    bookingCount?: number | null;
    lastBookingAt?: string | null;
  };
  currentPath: string;
};

export function CustomerCard({ customer, currentPath }: CustomerCardProps) {
  const bookingCount = customer.bookingCount ?? 0;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href={`/customers/${customer.id}`} className="text-lg font-semibold tracking-tight transition hover:text-[var(--primary)]">
            {customer.name}
          </Link>
          <p className="mt-1 text-sm text-[var(--muted)]">{customer.phone}</p>
        </div>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">
          {bookingCount > 1 ? "Repeat" : "Lead"}
        </span>
      </div>

      <form action={updateCustomer} className="mt-5 space-y-4">
        <input type="hidden" name="redirectTo" value={currentPath} />
        <input type="hidden" name="customerId" value={customer.id} />
        <div className="grid gap-4 md:grid-cols-2">
          <Input name="name" defaultValue={customer.name} required />
          <Input name="phone" defaultValue={customer.phone} required />
          <Input name="email" type="email" defaultValue={customer.email ?? ""} />
          <Input name="source" defaultValue={customer.source ?? ""} />
        </div>
        <Textarea name="notes" rows={3} defaultValue={customer.notes ?? ""} placeholder="Catatan customer" />

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="soft-stat rounded-[22px] p-4 text-sm">
            <p className="text-[var(--muted)]">Total booking</p>
            <p className="mt-2 text-lg font-semibold">{bookingCount}</p>
          </div>
          <div className="soft-stat rounded-[22px] p-4 text-sm sm:col-span-2">
            <p className="text-[var(--muted)]">Booking terakhir</p>
            <p className="mt-2 font-semibold">{formatDateTimeLabel(customer.lastBookingAt)}</p>
          </div>
        </div>

        <div className="field-card rounded-[24px] p-4 text-sm text-[var(--muted)]">
          <div className="flex items-start gap-3">
            <MessageCircleMore className="mt-0.5 h-4 w-4 text-[var(--primary)]" />
            <p>{customer.notes?.trim() ? customer.notes : "Belum ada catatan internal untuk customer ini."}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={`/customers/${customer.id}`} className={buttonVariants("ghost")}>
            Detail CRM
          </Link>
          <SubmitButton variant="secondary">Update customer</SubmitButton>
        </div>
      </form>
      <form action={deleteCustomer} className="mt-3">
        <input type="hidden" name="redirectTo" value={currentPath} />
        <input type="hidden" name="customerId" value={customer.id} />
        <SubmitButton variant="ghost" className="w-full" disabled={bookingCount > 0}>
          {bookingCount > 0 ? "Tidak bisa hapus: sudah punya booking" : "Hapus customer"}
        </SubmitButton>
      </form>
    </Card>
  );
}
