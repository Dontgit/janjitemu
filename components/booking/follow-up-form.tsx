import { updateBookingFollowUp } from "@/lib/actions";
import { Booking, FollowUpStatus } from "@/lib/types";
import { SubmitButton } from "@/components/forms/submit-button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export function FollowUpForm({
  booking,
  redirectTo,
  submitLabel = "Simpan follow up",
  compact = false
}: {
  booking: Booking;
  redirectTo: string;
  submitLabel?: string;
  compact?: boolean;
}) {
  return (
    <form action={updateBookingFollowUp} className="grid gap-3">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input type="hidden" name="bookingId" value={booking.id} />
      <div className="form-field">
        <span className="form-label">Status follow up</span>
        <Select name="followUpStatus" defaultValue={(booking.followUpStatus ?? "none") as FollowUpStatus}>
          <option value="none">Belum perlu follow up</option>
          <option value="needs-follow-up">Perlu follow up</option>
          <option value="contacted">Sudah dihubungi</option>
          <option value="offer-sent">Penawaran dikirim</option>
          <option value="won">Deal / berhasil</option>
          <option value="lost">Belum berhasil</option>
        </Select>
      </div>
      <div className="form-field">
        <span className="form-label">Follow up note</span>
        <Textarea name="followUpNote" rows={compact ? 2 : 3} defaultValue={booking.followUpNote ?? ""} />
      </div>
      <div className="form-field">
        <span className="form-label">Next action</span>
        <Input
          name="followUpNextActionAt"
          type="datetime-local"
          defaultValue={booking.followUpNextActionAt ? booking.followUpNextActionAt.slice(0, 16) : ""}
        />
      </div>
      <SubmitButton variant="secondary" className={compact ? "w-full justify-center" : ""}>
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
