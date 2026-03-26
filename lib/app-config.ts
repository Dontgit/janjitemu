const FALLBACK_APP_URL = "https://janjitemu.gobisnis.cloud";

export function getAppUrl() {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    FALLBACK_APP_URL;

  return raw.replace(/\/$/, "");
}

export function buildBookingUrl(slug: string) {
  return `${getAppUrl()}/book/${slug}`;
}
