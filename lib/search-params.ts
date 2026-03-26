const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 10;
const MAX_PER_PAGE = 50;

export function getSingleSearchParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export function normalizeQuery(value: string | string[] | undefined) {
  return getSingleSearchParam(value).trim();
}

export function parsePositiveInt(value: string | string[] | undefined, fallback: number) {
  const parsed = Number.parseInt(getSingleSearchParam(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function parsePaginationParams(searchParams: Record<string, string | string[] | undefined>) {
  const page = parsePositiveInt(searchParams.page, DEFAULT_PAGE);
  const requestedPerPage = parsePositiveInt(searchParams.perPage, DEFAULT_PER_PAGE);
  const perPage = Math.min(requestedPerPage, MAX_PER_PAGE);

  return { page, perPage };
}

export function buildSearchPath(
  pathname: string,
  searchParams: Record<string, string | string[] | undefined>
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string" && value) {
      params.set(key, value);
    }
  }

  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

export function replaceSearchParams(
  pathname: string,
  currentSearchParams: Record<string, string | string[] | undefined>,
  nextValues: Record<string, string | number | null | undefined>
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(currentSearchParams)) {
    if (typeof value === "string" && value) {
      params.set(key, value);
    }
  }

  for (const [key, value] of Object.entries(nextValues)) {
    params.delete(key);
    if (value !== null && value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }

  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}
