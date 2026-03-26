import { PublicBookingFormValues } from "@/lib/types";

export type Feedback = {
  type: "success" | "error";
  message: string;
};

const PUBLIC_BOOKING_FIELDS = ["serviceId", "addOnIds", "customerName", "phone", "email", "source", "date", "time", "notes"] as const;

export function normalizeRedirectTarget(path: string | null | undefined, fallback: string) {
  if (!path || !path.startsWith("/")) {
    return fallback;
  }

  return path;
}

export function withFeedback(path: string, feedback: Feedback) {
  const [pathname, queryString] = path.split("?");
  const params = new URLSearchParams(queryString ?? "");
  params.delete("success");
  params.delete("error");
  params.set(feedback.type, feedback.message);
  const suffix = params.toString();
  return suffix ? `${pathname}?${suffix}` : pathname;
}

export function getFeedbackFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): Feedback | null {
  const success = searchParams.success;
  if (typeof success === "string" && success) {
    return { type: "success", message: success };
  }

  const error = searchParams.error;
  if (typeof error === "string" && error) {
    return { type: "error", message: error };
  }

  return null;
}

export function withPublicBookingValues(
  path: string,
  values: PublicBookingFormValues
) {
  const [pathname, queryString] = path.split("?");
  const params = new URLSearchParams(queryString ?? "");

  for (const field of PUBLIC_BOOKING_FIELDS) {
    params.delete(field);
    const value = values[field];
    if (value) {
      params.set(field, value);
    }
  }

  const suffix = params.toString();
  return suffix ? `${pathname}?${suffix}` : pathname;
}

export function getPublicBookingValuesFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): PublicBookingFormValues {
  return PUBLIC_BOOKING_FIELDS.reduce<PublicBookingFormValues>((acc, field) => {
    const value = searchParams[field];
    if (typeof value === "string" && value) {
      acc[field] = value;
    }
    return acc;
  }, {});
}
