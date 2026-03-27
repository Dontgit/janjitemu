import { CircleAlert, CircleCheckBig } from "lucide-react";
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

  const isSuccess = feedback.type === "success";

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-[24px] border px-4 py-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-rose-200 bg-rose-50 text-rose-800",
        className
      )}
    >
      <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center", isSuccess ? "text-emerald-700" : "text-rose-700")}>
        {isSuccess ? <CircleCheckBig className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />}
      </span>
      <p className="leading-6">{feedback.message}</p>
    </div>
  );
}
