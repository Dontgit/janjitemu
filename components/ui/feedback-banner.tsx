import { Feedback } from "@/lib/feedback";
import { cn } from "@/lib/utils";

export function FeedbackBanner({
  feedback,
  className
}: {
  feedback: Feedback | null;
  className?: string;
}) {
  if (!feedback) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-[24px] border px-4 py-3 text-sm",
        feedback.type === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-rose-200 bg-rose-50 text-rose-800",
        className
      )}
    >
      {feedback.message}
    </div>
  );
}
