import { Prisma } from "@prisma/client";
import { getOptionalSessionUser } from "@/lib/auth";
import { buildBookingUrl } from "@/lib/app-config";
import { prisma } from "@/lib/prisma";
import {
  availableDates,
  bookings as fallbackBookings,
  businessHours as fallbackBusinessHours,
  businessProfile as fallbackBusinessProfile,
  customers as fallbackCustomers,
  dashboardStats as fallbackStats,
  services as fallbackServices,
  teamMembers as fallbackTeamMembers,
  timelineItems as fallbackTimeline
} from "@/lib/mock-data";
import {
  AvailabilityDay,
  Booking,
  BookingDetailData,
  BookingSummary,
  BookingStatus,
  BusinessHour,
  BusinessProfile,
  Customer,
  TeamMember,
  TeamMemberAvailability,
  AnalyticsPageData,
  BookingAddOn,
  DashboardHighlight,
  DashboardStat,
  FollowUpBoardColumn,
  FollowUpStatus,
  PaginatedResult,
  ReminderItem,
  Service,
  TimelineItem
} from "@/lib/types";

const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"] as const;
const shortDayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] as const;
const AVAILABILITY_WINDOW_DAYS = 5;

const labelFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long"
});

function mapStatus(status: string): BookingStatus {
  switch (status) {
    case "CONFIRMED":
      return "confirmed";
    case "RESCHEDULED":
      return "rescheduled";
    case "COMPLETED":
      return "completed";
    case "CANCELLED":
      return "cancelled";
    case "NO_SHOW":
      return "no-show";
    default:
      return "pending";
  }
}

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

async function withFallback<T>(task: () => Promise<T>, fallback: T): Promise<T> {
  if (!hasDatabaseUrl()) {
    return fallback;
  }

  try {
    return await task();
  } catch {
    return fallback;
  }
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatTime(date: Date) {
  return date.toISOString().slice(11, 16);
}

function combineDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00+07:00`);
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

function subtractMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() - minutes * 60_000);
}

function normalizeBusinessId(businessId?: string) {
  return businessId || undefined;
}

function isBlockingStatus(status: BookingStatus | string) {
  return status !== "cancelled" && status !== "CANCELLED";
}

function getBookingRange(booking: Booking) {
  const start = combineDateTime(booking.date, booking.time);
  const end =
    booking.endDate && booking.endTime
      ? combineDateTime(booking.endDate, booking.endTime)
      : addMinutes(start, booking.duration ?? 30);

  return { start, end };
}

function hasOverlap(start: Date, end: Date, booking: Booking, bufferMins = 0) {
  if (!isBlockingStatus(booking.status)) {
    return false;
  }

  const range = getBookingRange(booking);
  const blockedStart = subtractMinutes(range.start, bufferMins);
  const blockedEnd = addMinutes(range.end, bufferMins);
  return start < blockedEnd && end > blockedStart;
}

function mapFollowUpStatus(status: string | null | undefined): FollowUpStatus {
  switch (status) {
    case "NEEDS_FOLLOW_UP":
      return "needs-follow-up";
    case "CONTACTED":
      return "contacted";
    case "OFFER_SENT":
      return "offer-sent";
    case "WON":
      return "won";
    case "LOST":
      return "lost";
    default:
      return "none";
  }
}

function parseBookingAddOns(value: Prisma.JsonValue | null | undefined): BookingAddOn[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const record = item as Record<string, unknown>;
      if (typeof record.id !== "string" || typeof record.name !== "string") return null;
      return {
        id: record.id,
        name: record.name,
        price: Number(record.price ?? 0),
        duration: Number(record.duration ?? 0)
      } satisfies BookingAddOn;
    })
    .filter(Boolean) as BookingAddOn[];
}

function mapServiceWithRules(
  service: {
    id: string;
    businessId: string;
    name: string;
    durationMins: number;
    price: number;
    description: string;
    isActive: boolean;
    isPopular: boolean;
    isAddon: boolean;
    allowedPrimaryForRules?: Array<{
      service: {
        id: string;
        name: string;
      };
    }>;
    allowedAddOnRules?: Array<{
      addOnService: {
        id: string;
        name: string;
      };
    }>;
  }
): Service {
  return {
    id: service.id,
    businessId: service.businessId,
    name: service.name,
    duration: service.durationMins,
    price: service.price,
    description: service.description,
    active: service.isActive,
    popular: service.isPopular,
    isAddon: service.isAddon,
    allowedPrimaryServiceIds: service.allowedPrimaryForRules?.map((rule) => rule.service.id) ?? [],
    allowedPrimaryServiceNames: service.allowedPrimaryForRules?.map((rule) => rule.service.name) ?? [],
    linkedAddonIds: service.allowedAddOnRules?.map((rule) => rule.addOnService.id) ?? [],
    linkedAddonNames: service.allowedAddOnRules?.map((rule) => rule.addOnService.name) ?? []
  };
}

function buildBookingFromDb(booking: {
  id: string;
  businessId: string;
  customerId: string;
  customerNameSnapshot: string;
  customerPhoneSnapshot: string;
  customerEmailSnapshot: string | null;
  serviceId: string;
  serviceNameSnapshot: string;
  scheduledAt: Date;
  endAt: Date;
  serviceDurationSnapshot: number;
  totalDurationSnapshot?: number;
  totalPriceSnapshot?: number;
  addOnSummary?: Prisma.JsonValue | null;
  status: string;
  notes: string | null;
  followUpStatus?: string | null;
  followUpNote?: string | null;
  followUpNextActionAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: booking.id,
    businessId: booking.businessId,
    customerId: booking.customerId,
    customerName: booking.customerNameSnapshot,
    phone: booking.customerPhoneSnapshot,
    email: booking.customerEmailSnapshot,
    serviceId: booking.serviceId,
    serviceName: booking.serviceNameSnapshot,
    addOns: parseBookingAddOns(booking.addOnSummary),
    date: formatDate(booking.scheduledAt),
    time: formatTime(booking.scheduledAt),
    endDate: formatDate(booking.endAt),
    endTime: formatTime(booking.endAt),
    duration: booking.serviceDurationSnapshot,
    totalDuration: booking.totalDurationSnapshot ?? booking.serviceDurationSnapshot,
    totalPrice: booking.totalPriceSnapshot ?? 0,
    status: mapStatus(booking.status),
    notes: booking.notes ?? undefined,
    followUpStatus: mapFollowUpStatus(booking.followUpStatus),
    followUpNote: booking.followUpNote ?? null,
    followUpNextActionAt: booking.followUpNextActionAt?.toISOString() ?? null,
    createdAt: booking.createdAt?.toISOString() ?? null,
    updatedAt: booking.updatedAt?.toISOString() ?? null
  } satisfies Booking;
}

function sortBookingsBySchedule(items: Booking[]) {
  return [...items].sort(
    (a, b) => combineDateTime(a.date, a.time).getTime() - combineDateTime(b.date, b.time).getTime()
  );
}

function getBookingDateTime(booking: Booking) {
  return combineDateTime(booking.date, booking.time);
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function getFollowUpColumnMeta(status: FollowUpStatus) {
  switch (status) {
    case "needs-follow-up":
      return { label: "Perlu follow up", description: "Booking yang masih menunggu sentuhan pertama." };
    case "contacted":
      return { label: "Sudah dihubungi", description: "Customer sudah dihubungi, tinggal ditarik ke langkah berikutnya." };
    case "offer-sent":
      return { label: "Penawaran dikirim", description: "Harga atau paket sudah dilempar, tinggal dipantau responsnya." };
    case "won":
      return { label: "Deal", description: "Follow up berhasil dan siap dijaga retensinya." };
    case "lost":
      return { label: "Belum berhasil", description: "Lead belum jadi, tapi konteksnya masih perlu tercatat." };
    default:
      return { label: "Belum perlu", description: "Belum ada follow up aktif." };
  }
}

function getReminderPriority(booking: Booking, dueAt: Date, type: ReminderItem["type"]): ReminderItem["priority"] {
  const now = new Date();
  const diffHours = (dueAt.getTime() - now.getTime()) / 3_600_000;

  if (type === "follow-up") {
    if (diffHours <= 0 || booking.followUpStatus === "needs-follow-up") return "high";
    if (diffHours <= 24) return "medium";
    return "low";
  }

  if (booking.status === "pending" && diffHours <= 24) return "high";
  if (diffHours <= 24) return "medium";
  return "low";
}


function getBookingStatusLabel(status: BookingStatus) {
  switch (status) {
    case "confirmed":
      return "Confirmed";
    case "rescheduled":
      return "Rescheduled";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    case "no-show":
      return "No-show";
    default:
      return "Pending";
  }
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) {
    return "0%";
  }

  return `${Math.round(value)}%`;
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    notation: value >= 1_000_000 ? "compact" : "standard",
    maximumFractionDigits: 0
  }).format(value);
}

function buildAvailability(
  hours: BusinessHour[],
  bookings: Booking[],
  serviceDuration: number,
  slotIntervalMins: number,
  bufferMins = 0
): AvailabilityDay[] {
  const now = new Date();

  return Array.from({ length: AVAILABILITY_WINDOW_DAYS }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + index);

    const dateValue = formatDate(date);
    const dayHour = hours.find((hour) => hour.dayOfWeek === date.getDay());

    if (!dayHour || !dayHour.active) {
      return {
        label: index === 0 ? "Hari ini" : labelFormatter.format(date),
        value: dateValue,
        slots: []
      };
    }

    const [openHour, openMinute] = dayHour.open.split(":").map(Number);
    const [closeHour, closeMinute] = dayHour.close.split(":").map(Number);
    const openAt = combineDateTime(dateValue, `${String(openHour).padStart(2, "0")}:${String(openMinute).padStart(2, "0")}`);
    const closeAt = combineDateTime(dateValue, `${String(closeHour).padStart(2, "0")}:${String(closeMinute).padStart(2, "0")}`);

    const dayBookings = bookings.filter((booking) => booking.date === dateValue && isBlockingStatus(booking.status));
    const slots: string[] = [];
    const cursor = new Date(openAt);

    while (addMinutes(cursor, serviceDuration) <= closeAt) {
      const slotStart = new Date(cursor);
      const slotEnd = addMinutes(slotStart, serviceDuration);

      if (slotStart > now && !dayBookings.some((booking) => hasOverlap(slotStart, slotEnd, booking, bufferMins))) {
        slots.push(formatTime(slotStart));
      }

      cursor.setMinutes(cursor.getMinutes() + slotIntervalMins);
    }

    return {
      label: index === 0 ? "Hari ini" : labelFormatter.format(date),
      value: dateValue,
      slots
    };
  });
}

function paginateItems<T>(items: T[], page: number, perPage: number): PaginatedResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * perPage;

  return {
    items: items.slice(start, start + perPage),
    total,
    page: safePage,
    perPage,
    totalPages
  };
}

function buildPaginatedResult<T>(items: T[], total: number, page: number, perPage: number): PaginatedResult<T> {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, totalPages);

  return {
    items,
    total,
    page: safePage,
    perPage,
    totalPages
  };
}

type BookingListParams = {
  businessId?: string;
  q?: string;
  status?: string;
  followUpStatus?: string;
  serviceId?: string;
  page: number;
  perPage: number;
};

type CustomerListParams = {
  businessId?: string;
  q?: string;
  source?: string;
  page: number;
  perPage: number;
};

type ServiceListParams = {
  businessId?: string;
  q?: string;
  status?: string;
  page: number;
  perPage: number;
};

type TeamListParams = {
  businessId?: string;
  q?: string;
  status?: string;
  serviceId?: string;
  page: number;
  perPage: number;
};

function getBookingWhereClause(businessId: string, params: Omit<BookingListParams, "businessId" | "page" | "perPage">): Prisma.BookingWhereInput {
  const trimmedQuery = params.q?.trim();

  return {
    businessId,
    status: params.status ? parsePrismaBookingStatus(params.status) : undefined,
    followUpStatus: params.followUpStatus ? parsePrismaFollowUpStatus(params.followUpStatus) : undefined,
    serviceId: params.serviceId || undefined,
    AND: trimmedQuery
      ? [
          {
            OR: [
              { customerNameSnapshot: { contains: trimmedQuery, mode: "insensitive" } },
              { customerPhoneSnapshot: { contains: trimmedQuery, mode: "insensitive" } },
              { customerEmailSnapshot: { contains: trimmedQuery, mode: "insensitive" } },
              { serviceNameSnapshot: { contains: trimmedQuery, mode: "insensitive" } }
            ]
          }
        ]
      : undefined
  };
}

function parsePrismaBookingStatus(status?: string) {
  switch (status) {
    case "confirmed":
      return "CONFIRMED";
    case "rescheduled":
      return "RESCHEDULED";
    case "completed":
      return "COMPLETED";
    case "cancelled":
      return "CANCELLED";
    case "no-show":
      return "NO_SHOW";
    case "pending":
      return "PENDING";
    default:
      return undefined;
  }
}

function parsePrismaFollowUpStatus(status?: string) {
  switch (status) {
    case "needs-follow-up":
      return "NEEDS_FOLLOW_UP";
    case "contacted":
      return "CONTACTED";
    case "offer-sent":
      return "OFFER_SENT";
    case "won":
      return "WON";
    case "lost":
      return "LOST";
    case "none":
      return "NONE";
    default:
      return undefined;
  }
}

async function getScopedBusinessRecord(businessId?: string) {
  const explicitBusinessId = normalizeBusinessId(businessId);
  if (explicitBusinessId) {
    return prisma.business.findUnique({
      where: { id: explicitBusinessId },
      include: { owner: true }
    });
  }

  const sessionUser = await getOptionalSessionUser();
  if (sessionUser?.businessId) {
    const sessionBusiness = await prisma.business.findUnique({
      where: { id: sessionUser.businessId },
      include: { owner: true }
    });

    if (sessionBusiness) {
      return sessionBusiness;
    }
  }

  return prisma.business.findFirst({
    orderBy: { createdAt: "asc" },
    include: { owner: true }
  });
}

export async function getOwnerBusiness(): Promise<BusinessProfile> {
  return withFallback(async () => {
    const business = await getScopedBusinessRecord();

    if (!business) {
      return fallbackBusinessProfile;
    }

    return {
      id: business.id,
      ownerName: business.owner.name,
      slug: business.slug,
      name: business.name,
      category: business.category,
      city: business.city,
      description: business.description,
      bookingLink: business.bookingLink ?? buildBookingUrl(business.slug),
      phone: business.phone ?? "",
      email: business.email ?? "",
      reminderChannel: business.reminderChannel ?? "Email + reminder dashboard",
      bookingSlotInterval: business.bookingSlotInterval ?? 15,
      bookingBufferMins: business.bookingBufferMins ?? 0,
      onboardingCompleted: business.onboardingCompleted
    };
  }, fallbackBusinessProfile);
}

export async function getPublicBusiness(slug: string): Promise<BusinessProfile> {
  const ownerBusiness = await getOwnerBusiness();
  if (ownerBusiness.slug === slug) {
    return ownerBusiness;
  }

  return withFallback(async () => {
    const business = await prisma.business.findUnique({
      where: { slug },
      include: { owner: true }
    });

    if (!business) {
      return ownerBusiness;
    }

    return {
      id: business.id,
      ownerName: business.owner.name,
      slug: business.slug,
      name: business.name,
      category: business.category,
      city: business.city,
      description: business.description,
      bookingLink: business.bookingLink ?? buildBookingUrl(business.slug),
      phone: business.phone ?? "",
      email: business.email ?? "",
      reminderChannel: business.reminderChannel ?? "Email + reminder dashboard",
      bookingSlotInterval: business.bookingSlotInterval ?? 15,
      bookingBufferMins: business.bookingBufferMins ?? 0,
      onboardingCompleted: business.onboardingCompleted
    };
  }, ownerBusiness);
}

export async function getServices(businessId?: string): Promise<Service[]> {
  return withFallback(async () => {
    const business = await getScopedBusinessRecord(businessId);
    if (!business?.id) {
      return fallbackServices;
    }

    const items = await prisma.service.findMany({
      where: { businessId: business.id },
      include: {
        allowedPrimaryForRules: {
          include: {
            service: {
              select: { id: true, name: true }
            }
          }
        },
        allowedAddOnRules: {
          include: {
            addOnService: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: [{ isPopular: "desc" }, { createdAt: "asc" }]
    });

    return items.map(mapServiceWithRules);
  }, fallbackServices);
}

export async function getBusinessHours(businessId?: string): Promise<BusinessHour[]> {
  return withFallback(async () => {
    const business = await getScopedBusinessRecord(businessId);
    if (!business?.id) {
      return fallbackBusinessHours;
    }

    const hours = await prisma.businessHour.findMany({
      where: { businessId: business.id },
      orderBy: { dayOfWeek: "asc" }
    });

    if (hours.length === 0) {
      return fallbackBusinessHours;
    }

    return hours.map((hour) => ({
      id: hour.id,
      dayOfWeek: hour.dayOfWeek,
      day: dayNames[hour.dayOfWeek],
      open: hour.openTime,
      close: hour.closeTime,
      active: hour.isActive
    }));
  }, fallbackBusinessHours);
}

export async function getBookings(businessId?: string): Promise<Booking[]> {
  return withFallback(async () => {
    const business = await getScopedBusinessRecord(businessId);
    if (!business?.id) {
      return fallbackBookings;
    }

    const items = await prisma.booking.findMany({
      where: { businessId: business.id },
      orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }]
    });

    return items.map(buildBookingFromDb);
  }, fallbackBookings);
}

export async function getCustomers(businessId?: string): Promise<Customer[]> {
  return withFallback(async () => {
    const business = await getScopedBusinessRecord(businessId);
    if (!business?.id) {
      return fallbackCustomers;
    }

    const items = await prisma.customer.findMany({
      where: { businessId: business.id },
      include: {
        bookings: {
          orderBy: { scheduledAt: "desc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return items.map((customer) => ({
      id: customer.id,
      businessId: customer.businessId,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      source: customer.source,
      notes: customer.notes,
      bookingCount: customer.bookings.length,
      lastBookingAt: customer.bookings[0]?.scheduledAt.toISOString() ?? null
    }));
  }, fallbackCustomers);
}

export async function getPaginatedBookings({
  businessId,
  q,
  status,
  followUpStatus,
  serviceId,
  page,
  perPage
}: BookingListParams): Promise<PaginatedResult<Booking>> {
  return withFallback(async () => {
    const business = await getScopedBusinessRecord(businessId);
    if (!business?.id) {
      const trimmedQuery = q?.trim().toLowerCase() ?? "";
      const filtered = fallbackBookings.filter((booking) => {
        const matchesQuery =
          !trimmedQuery ||
          booking.customerName.toLowerCase().includes(trimmedQuery) ||
          booking.phone.toLowerCase().includes(trimmedQuery) ||
          (booking.email ?? "").toLowerCase().includes(trimmedQuery) ||
          booking.serviceName.toLowerCase().includes(trimmedQuery);
        const matchesStatus = !status || booking.status === status;
        const matchesFollowUp = !followUpStatus || (booking.followUpStatus ?? "none") === followUpStatus;
        const matchesService = !serviceId || booking.serviceId === serviceId;

        return matchesQuery && matchesStatus && matchesFollowUp && matchesService;
      });

      return paginateItems(filtered, page, perPage);
    }

    const where = getBookingWhereClause(business.id, { q, status, followUpStatus, serviceId });
    const safePage = Math.max(1, page);
    const [total, items] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
        skip: (safePage - 1) * perPage,
        take: perPage
      })
    ]);

    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const normalizedPage = Math.min(safePage, totalPages);

    if (normalizedPage !== safePage) {
      const normalizedItems = await prisma.booking.findMany({
        where,
        orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
        skip: (normalizedPage - 1) * perPage,
        take: perPage
      });

      return buildPaginatedResult(normalizedItems.map(buildBookingFromDb), total, normalizedPage, perPage);
    }

    return buildPaginatedResult(items.map(buildBookingFromDb), total, normalizedPage, perPage);
  }, paginateItems(fallbackBookings, page, perPage));
}

export async function getBookingDetail(bookingId: string): Promise<BookingDetailData | null> {
  return withFallback(async () => {
    const business = await getScopedBusinessRecord();
    if (!business?.id) {
      const booking = fallbackBookings.find((item) => item.id === bookingId);
      if (!booking) return null;

      const relatedBookings = sortBookingsBySchedule(
        fallbackBookings.filter((item) => item.customerId === booking.customerId && item.id !== booking.id)
      ).reverse();
      const customer = fallbackCustomers.find((item) => item.id === booking.customerId) ?? null;
      const customerBookings = fallbackBookings.filter((item) => item.customerId === booking.customerId);

      return {
        booking,
        customer,
        relatedBookings: relatedBookings.slice(0, 4),
        stats: {
          totalBookings: customerBookings.length,
          completedBookings: customerBookings.filter((item) => item.status === "completed").length,
          pendingBookings: customerBookings.filter((item) => item.status === "pending").length,
          totalSpent: customerBookings.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0),
          latestBookingAt: customerBookings.length
            ? getBookingDateTime(sortBookingsBySchedule(customerBookings).at(-1) as Booking).toISOString()
            : null
        }
      };
    }

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, businessId: business.id },
      include: {
        customer: true
      }
    });

    if (!booking) {
      return null;
    }

    const [relatedRows, customerBookingStats] = await Promise.all([
      prisma.booking.findMany({
        where: {
          businessId: business.id,
          customerId: booking.customerId,
          id: { not: booking.id }
        },
        orderBy: { scheduledAt: "desc" },
        take: 4
      }),
      prisma.booking.findMany({
        where: {
          businessId: business.id,
          customerId: booking.customerId
        },
        orderBy: { scheduledAt: "desc" }
      })
    ]);

    const normalizedBookings = customerBookingStats.map(buildBookingFromDb);

    return {
      booking: buildBookingFromDb(booking),
      customer: {
        id: booking.customer.id,
        businessId: booking.customer.businessId,
        name: booking.customer.name,
        phone: booking.customer.phone,
        email: booking.customer.email,
        source: booking.customer.source,
        notes: booking.customer.notes,
        bookingCount: normalizedBookings.length,
        lastBookingAt: normalizedBookings[0] ? getBookingDateTime(normalizedBookings[0]).toISOString() : null
      },
      relatedBookings: relatedRows.map(buildBookingFromDb),
      stats: {
        totalBookings: normalizedBookings.length,
        completedBookings: normalizedBookings.filter((item) => item.status === "completed").length,
        pendingBookings: normalizedBookings.filter((item) => item.status === "pending").length,
        totalSpent: normalizedBookings.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0),
        latestBookingAt: normalizedBookings[0] ? getBookingDateTime(normalizedBookings[0]).toISOString() : null
      }
    };
  }, null);
}

export async function getFollowUpBoardData({
  q,
  focus
}: {
  q?: string;
  focus?: "active" | "closing";
} = {}): Promise<FollowUpBoardColumn[]> {
  const normalizedQuery = q?.trim().toLowerCase() ?? "";
  const statuses: FollowUpStatus[] =
    focus === "closing"
      ? ["offer-sent", "won", "lost"]
      : ["needs-follow-up", "contacted", "offer-sent", "won", "lost"];
  const bookings = await getBookings();

  return statuses.map((status) => {
    const meta = getFollowUpColumnMeta(status);
    const items = sortBookingsBySchedule(
      bookings.filter((booking) => {
        const matchesStatus = (booking.followUpStatus ?? "none") === status;
        const matchesQuery =
          !normalizedQuery ||
          booking.customerName.toLowerCase().includes(normalizedQuery) ||
          booking.phone.toLowerCase().includes(normalizedQuery) ||
          booking.serviceName.toLowerCase().includes(normalizedQuery);

        return matchesStatus && matchesQuery;
      })
    );

    return {
      id: status,
      label: meta.label,
      description: meta.description,
      items
    };
  });
}

export async function getReminderCenterData({
  q,
  priority,
  type
}: {
  q?: string;
  priority?: ReminderItem["priority"] | "";
  type?: ReminderItem["type"] | "";
} = {}): Promise<ReminderItem[]> {
  const bookings = await getBookings();
  const now = new Date();
  const nextThreeDays = addMinutes(now, 72 * 60);
  const normalizedQuery = q?.trim().toLowerCase() ?? "";

  const items = bookings.flatMap<ReminderItem>((booking) => {
    const appointmentAt = getBookingDateTime(booking);
    const appointmentItems =
      appointmentAt >= now && appointmentAt <= nextThreeDays
        ? [
            {
              booking,
              type: "appointment" as const,
              dueAt: appointmentAt.toISOString(),
              title: booking.status === "pending" ? "Konfirmasi booking mendekat" : "Booking akan berlangsung",
              detail:
                booking.status === "pending"
                  ? "Booking ini dekat jadwalnya dan masih perlu kepastian."
                  : "Slot sudah dekat, cocok untuk reminder operasional atau customer.",
              priority: getReminderPriority(booking, appointmentAt, "appointment")
            }
          ]
        : [];
    const followUpItems =
      booking.followUpNextActionAt
        ? [
            {
              booking,
              type: "follow-up" as const,
              dueAt: booking.followUpNextActionAt,
              title: "Next action follow up",
              detail: booking.followUpNote || "Sudah ada next action yang dijadwalkan untuk booking ini.",
              priority: getReminderPriority(booking, new Date(booking.followUpNextActionAt), "follow-up")
            }
          ]
        : [];

    return [...appointmentItems, ...followUpItems];
  });

  return items
    .filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        item.booking.customerName.toLowerCase().includes(normalizedQuery) ||
        item.booking.phone.toLowerCase().includes(normalizedQuery) ||
        item.booking.serviceName.toLowerCase().includes(normalizedQuery) ||
        item.title.toLowerCase().includes(normalizedQuery);
      const matchesPriority = !priority || item.priority === priority;
      const matchesType = !type || item.type === type;
      return matchesQuery && matchesPriority && matchesType;
    })
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
}

export async function getPaginatedCustomers({
  businessId,
  q,
  source,
  page,
  perPage
}: CustomerListParams): Promise<PaginatedResult<Customer>> {
  return withFallback(async () => {
    const business = await getScopedBusinessRecord(businessId);
    const trimmedQuery = q?.trim();
    const trimmedSource = source?.trim();

    if (!business?.id) {
      const filtered = fallbackCustomers.filter((customer) => {
        const normalizedQuery = trimmedQuery?.toLowerCase() ?? "";
        const normalizedSource = trimmedSource?.toLowerCase() ?? "";
        const matchesQuery =
          !normalizedQuery ||
          customer.name.toLowerCase().includes(normalizedQuery) ||
          customer.phone.toLowerCase().includes(normalizedQuery) ||
          (customer.email ?? "").toLowerCase().includes(normalizedQuery);
        const matchesSource =
          !normalizedSource || (customer.source ?? "").toLowerCase().includes(normalizedSource);

        return matchesQuery && matchesSource;
      });

      return paginateItems(filtered, page, perPage);
    }

    const where: Prisma.CustomerWhereInput = {
      businessId: business.id,
      source: trimmedSource ? { contains: trimmedSource, mode: "insensitive" } : undefined,
      AND: trimmedQuery
        ? [
            {
              OR: [
                { name: { contains: trimmedQuery, mode: "insensitive" } },
                { phone: { contains: trimmedQuery, mode: "insensitive" } },
                { email: { contains: trimmedQuery, mode: "insensitive" } }
              ]
            }
          ]
        : undefined
    };
    const safePage = Math.max(1, page);
    const [total, items] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        include: {
          _count: {
            select: { bookings: true }
          },
          bookings: {
            select: { scheduledAt: true },
            orderBy: { scheduledAt: "desc" },
            take: 1
          }
        },
        orderBy: { createdAt: "desc" },
        skip: (safePage - 1) * perPage,
        take: perPage
      })
    ]);

    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const normalizedPage = Math.min(safePage, totalPages);

    if (normalizedPage !== safePage) {
      const normalizedItems = await prisma.customer.findMany({
        where,
        include: {
          _count: {
            select: { bookings: true }
          },
          bookings: {
            select: { scheduledAt: true },
            orderBy: { scheduledAt: "desc" },
            take: 1
          }
        },
        orderBy: { createdAt: "desc" },
        skip: (normalizedPage - 1) * perPage,
        take: perPage
      });

      return buildPaginatedResult(
        normalizedItems.map((customer) => ({
          id: customer.id,
          businessId: customer.businessId,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          source: customer.source,
          notes: customer.notes,
          bookingCount: customer._count.bookings,
          lastBookingAt: customer.bookings[0]?.scheduledAt.toISOString() ?? null
        })),
        total,
        normalizedPage,
        perPage
      );
    }

    return buildPaginatedResult(
      items.map((customer) => ({
        id: customer.id,
        businessId: customer.businessId,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        source: customer.source,
        notes: customer.notes,
        bookingCount: customer._count.bookings,
        lastBookingAt: customer.bookings[0]?.scheduledAt.toISOString() ?? null
      })),
      total,
      normalizedPage,
      perPage
    );
  }, paginateItems(fallbackCustomers, page, perPage));
}

export async function getPaginatedServices({
  businessId,
  q,
  status,
  page,
  perPage
}: ServiceListParams): Promise<PaginatedResult<Service>> {
  return withFallback(async () => {
    const business = await getScopedBusinessRecord(businessId);
    const trimmedQuery = q?.trim();

    if (!business?.id) {
      const normalizedQuery = trimmedQuery?.toLowerCase() ?? "";
      const filtered = fallbackServices.filter((service) => {
        const matchesQuery =
          !normalizedQuery ||
          service.name.toLowerCase().includes(normalizedQuery) ||
          service.description.toLowerCase().includes(normalizedQuery);
        const matchesStatus =
          status === "active"
            ? service.active ?? true
            : status === "inactive"
              ? !(service.active ?? true)
              : true;

        return matchesQuery && matchesStatus;
      });

      return paginateItems(filtered, page, perPage);
    }

    const where: Prisma.ServiceWhereInput = {
      businessId: business.id,
      isActive: status === "active" ? true : status === "inactive" ? false : undefined,
      AND: trimmedQuery
        ? [
            {
              OR: [
                { name: { contains: trimmedQuery, mode: "insensitive" } },
                { description: { contains: trimmedQuery, mode: "insensitive" } }
              ]
            }
          ]
        : undefined
    };
    const safePage = Math.max(1, page);
    const [total, items] = await Promise.all([
      prisma.service.count({ where }),
      prisma.service.findMany({
        where,
        include: {
          allowedPrimaryForRules: {
            include: {
              service: {
                select: { id: true, name: true }
              }
            }
          },
          allowedAddOnRules: {
            include: {
              addOnService: {
                select: { id: true, name: true }
              }
            }
          }
        },
        orderBy: [{ isPopular: "desc" }, { createdAt: "asc" }],
        skip: (safePage - 1) * perPage,
        take: perPage
      })
    ]);

    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const normalizedPage = Math.min(safePage, totalPages);

    if (normalizedPage !== safePage) {
      const normalizedItems = await prisma.service.findMany({
        where,
        include: {
          allowedPrimaryForRules: {
            include: {
              service: {
                select: { id: true, name: true }
              }
            }
          },
          allowedAddOnRules: {
            include: {
              addOnService: {
                select: { id: true, name: true }
              }
            }
          }
        },
        orderBy: [{ isPopular: "desc" }, { createdAt: "asc" }],
        skip: (normalizedPage - 1) * perPage,
        take: perPage
      });

      return buildPaginatedResult(
        normalizedItems.map(mapServiceWithRules),
        total,
        normalizedPage,
        perPage
      );
    }

    return buildPaginatedResult(
      items.map(mapServiceWithRules),
      total,
      normalizedPage,
      perPage
    );
  }, paginateItems(fallbackServices, page, perPage));
}

export async function getDashboardStats(): Promise<DashboardStat[]> {
  const [serviceItems, bookingItems, customerItems] = await Promise.all([
    getServices(),
    getBookings(),
    getCustomers()
  ]);

  const today = formatDate(new Date());
  const todayBookings = bookingItems.filter((booking) => booking.date === today);
  const pending = bookingItems.filter((booking) => booking.status === "pending").length;
  const noShow = bookingItems.filter((booking) => booking.status === "no-show").length;
  const mostBooked = serviceItems
    .map((service) => ({
      name: service.name,
      count: bookingItems.filter((booking) => booking.serviceId === service.id).length
    }))
    .sort((a, b) => b.count - a.count)[0];

  if (serviceItems.length === 0 && bookingItems.length === 0 && customerItems.length === 0) {
    return fallbackStats;
  }

  return [
    {
      label: "Booking hari ini",
      value: String(todayBookings.length),
      detail: todayBookings.length > 0 ? "Slot aktif di kalender hari ini" : "Belum ada jadwal hari ini"
    },
    {
      label: "Menunggu konfirmasi",
      value: String(pending),
      detail: pending > 0 ? "Perlu follow up sebelum operasional mulai" : "Semua booking sudah diproses"
    },
    {
      label: "Customer aktif",
      value: String(customerItems.length),
      detail: "Total customer yang sudah tersimpan"
    },
    {
      label: "Layanan terlaris",
      value: mostBooked?.name ?? "-",
      detail: mostBooked ? `${mostBooked.count} booking tercatat` : "Belum ada data booking"
    },
    {
      label: "No-show",
      value: String(noShow),
      detail: "Terhitung dari data booking yang sudah masuk"
    }
  ].slice(0, 4);
}

export async function getBookingSummary(businessId?: string): Promise<BookingSummary> {
  return withFallback(async () => {
    const business = await getScopedBusinessRecord(businessId);
    if (!business?.id) {
      const bookingItems = fallbackBookings;
      const today = formatDate(new Date());
      const now = new Date();

      return {
        total: bookingItems.length,
        pending: bookingItems.filter((booking) => booking.status === "pending").length,
        confirmed: bookingItems.filter((booking) => booking.status === "confirmed").length,
        completed: bookingItems.filter((booking) => booking.status === "completed").length,
        cancelled: bookingItems.filter((booking) => booking.status === "cancelled").length,
        noShow: bookingItems.filter((booking) => booking.status === "no-show").length,
        upcoming: bookingItems.filter((booking) => combineDateTime(booking.date, booking.time) >= now).length,
        today: bookingItems.filter((booking) => booking.date === today).length
      };
    }

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const [total, pending, confirmed, completed, cancelled, noShow, upcoming, today] = await Promise.all([
      prisma.booking.count({ where: { businessId: business.id } }),
      prisma.booking.count({ where: { businessId: business.id, status: "PENDING" } }),
      prisma.booking.count({ where: { businessId: business.id, status: "CONFIRMED" } }),
      prisma.booking.count({ where: { businessId: business.id, status: "COMPLETED" } }),
      prisma.booking.count({ where: { businessId: business.id, status: "CANCELLED" } }),
      prisma.booking.count({ where: { businessId: business.id, status: "NO_SHOW" } }),
      prisma.booking.count({ where: { businessId: business.id, scheduledAt: { gte: now } } }),
      prisma.booking.count({
        where: {
          businessId: business.id,
          scheduledAt: {
            gte: todayStart,
            lt: tomorrowStart
          }
        }
      })
    ]);

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      noShow,
      upcoming,
      today
    };
  }, {
    total: fallbackBookings.length,
    pending: fallbackBookings.filter((booking) => booking.status === "pending").length,
    confirmed: fallbackBookings.filter((booking) => booking.status === "confirmed").length,
    completed: fallbackBookings.filter((booking) => booking.status === "completed").length,
    cancelled: fallbackBookings.filter((booking) => booking.status === "cancelled").length,
    noShow: fallbackBookings.filter((booking) => booking.status === "no-show").length,
    upcoming: fallbackBookings.filter((booking) => combineDateTime(booking.date, booking.time) >= new Date()).length,
    today: fallbackBookings.filter((booking) => booking.date === formatDate(new Date())).length
  });
}

export async function getDashboardHighlights(businessId?: string): Promise<DashboardHighlight[]> {
  const [services, customers, hours] = await Promise.all([
    getServices(businessId),
    getCustomers(businessId),
    getBusinessHours(businessId)
  ]);
  const activeServices = services.filter((service) => service.active ?? true).length;
  const popularService = services.find((service) => service.popular);
  const openDays = hours.filter((hour) => hour.active).length;
  const repeatCustomers = customers.filter((customer) => (customer.bookingCount ?? 0) > 1).length;

  return [
    {
      label: "Layanan aktif",
      value: String(activeServices),
      detail: activeServices > 0 ? "Tetap tampil di halaman booking publik" : "Tambahkan layanan pertama Anda"
    },
    {
      label: "Customer repeat",
      value: String(repeatCustomers),
      detail: repeatCustomers > 0 ? "Sudah kembali booking lebih dari sekali" : "Belum ada customer repeat"
    },
    {
      label: "Hari operasional",
      value: `${openDays}/7`,
      detail: "Dipakai untuk membentuk slot booking publik"
    },
    {
      label: "Layanan unggulan",
      value: popularService?.name ?? "-",
      detail: popularService ? "Ditandai sebagai populer untuk konversi publik" : "Belum ada layanan populer"
    }
  ];
}

export async function getTimelineItems(): Promise<TimelineItem[]> {
  const businessBookings = await getBookings();
  const today = formatDate(new Date());
  const todayItems = businessBookings
    .filter((booking) => booking.date === today)
    .slice(0, 5)
    .map((booking) => ({
      time: booking.time,
      title: `${booking.customerName} - ${booking.serviceName}`,
      meta: `${booking.status} • ${booking.phone}`
    }));

  return todayItems;
}

export async function getAvailabilityForSlug(slug: string): Promise<AvailabilityDay[]> {
  const business = await getPublicBusiness(slug);
  const allBookings = await getBookings(business.id);
  const hours = await getBusinessHours(business.id);
  const services = await getServices(business.id);
  const activeServices = services.filter((service) => (service.active ?? true) && !service.isAddon);

  if (!business.id) {
    return fallbackBusinessProfile.slug === slug ? availableDates : [];
  }

  return buildAvailability(
    hours,
    allBookings,
    activeServices[0]?.duration ?? services[0]?.duration ?? 30,
    business.bookingSlotInterval ?? 15,
    business.bookingBufferMins ?? 0
  );
}

export async function getPublicPageData(slug: string) {
  const business = await getPublicBusiness(slug);
  const [services, bookings, hours] = await Promise.all([
    getServices(business.id),
    getBookings(business.id),
    getBusinessHours(business.id)
  ]);
  const activeServices = services.filter((service) => (service.active ?? true) && !service.isAddon);
  const visibleServices = activeServices.length > 0 ? activeServices : services.filter((service) => !service.isAddon);
  const visibleAddOns = services.filter((service) => {
    if (!service.isAddon || !(service.active ?? true)) {
      return false;
    }

    const allowedFor = service.allowedPrimaryServiceIds ?? [];
    return allowedFor.length === 0 || allowedFor.some((id) => visibleServices.some((primary) => primary.id === id));
  });
  const availabilityByService = Object.fromEntries(
    visibleServices.map((service) => [
      service.id,
      buildAvailability(hours, bookings, service.duration, business.bookingSlotInterval ?? 15, business.bookingBufferMins ?? 0)
    ])
  ) as Record<string, AvailabilityDay[]>;
  const openDays = hours.filter((hour) => hour.active).length;

  return {
    business,
    services: [...visibleServices, ...visibleAddOns],
    availability: visibleServices[0] ? availabilityByService[visibleServices[0].id] ?? [] : availableDates,
    availabilityByService,
    guidance: [
      `${openDays} hari operasional aktif per minggu`,
      `Interval slot ${business.bookingSlotInterval ?? 15} menit`,
      business.bookingBufferMins ? `Buffer antar booking ${business.bookingBufferMins} menit` : "Tanpa buffer tambahan antar booking",
      visibleAddOns.length > 0 ? `${visibleAddOns.length} add-on siap dijual silang` : "Belum ada add-on aktif untuk upsell",
      business.phone ? `Konfirmasi tambahan bisa melalui ${business.phone}` : "Siapkan nomor aktif agar konfirmasi lebih cepat",
      visibleServices.length > 0 ? `${visibleServices.length} layanan siap dibooking` : "Tambahkan layanan aktif agar halaman publik lebih berguna"
    ]
  };
}


export async function getAnalyticsPageData(): Promise<AnalyticsPageData> {
  const [bookings, services, customers] = await Promise.all([getBookings(), getServices(), getCustomers()]);
  const primaryServices = services.filter((service) => !service.isAddon);
  const addonServices = services.filter((service) => service.isAddon);
  const now = new Date();
  const nextSevenDaysEnd = addMinutes(now, 7 * 24 * 60);
  const validRevenueBookings = bookings.filter((booking) => booking.status !== "cancelled" && booking.status !== "no-show");
  const totalRevenue = validRevenueBookings.reduce((sum, booking) => sum + (booking.totalPrice ?? 0), 0);
  const completedRevenue = bookings
    .filter((booking) => booking.status === "completed")
    .reduce((sum, booking) => sum + (booking.totalPrice ?? 0), 0);
  const addonRevenue = bookings.reduce(
    (sum, booking) => sum + (booking.addOns ?? []).reduce((inner, item) => inner + (item.price ?? 0), 0),
    0
  );
  const bookingsWithAddons = bookings.filter((booking) => (booking.addOns ?? []).length > 0).length;
  const repeatCustomers = customers.filter((customer) => (customer.bookingCount ?? 0) > 1).length;
  const nextSevenDaysBookings = bookings.filter((booking) => {
    const scheduledAt = getBookingDateTime(booking);
    return scheduledAt >= now && scheduledAt <= nextSevenDaysEnd;
  });
  const nextSevenDaysRevenue = nextSevenDaysBookings
    .filter((booking) => booking.status !== "cancelled" && booking.status !== "no-show")
    .reduce((sum, booking) => sum + (booking.totalPrice ?? 0), 0);
  const busyDayMap = nextSevenDaysBookings.reduce<Record<string, number>>((acc, booking) => {
    acc[booking.date] = (acc[booking.date] ?? 0) + 1;
    return acc;
  }, {});

  const summary = [
    {
      label: "Total booking",
      value: String(bookings.length),
      detail: `${bookings.filter((booking) => booking.status === "completed").length} selesai • ${bookings.filter((booking) => booking.status === "pending").length} masih pending`
    },
    {
      label: "Revenue tercatat",
      value: formatCompactCurrency(totalRevenue),
      detail: `${formatCompactCurrency(completedRevenue)} sudah completed`
    },
    {
      label: "Attach rate add-on",
      value: formatPercent(bookings.length ? (bookingsWithAddons / bookings.length) * 100 : 0),
      detail: `${bookingsWithAddons} dari ${bookings.length} booking memakai add-on`
    },
    {
      label: "Customer repeat",
      value: String(repeatCustomers),
      detail: `${customers.length} customer tersimpan di workspace`
    }
  ];

  const statusBreakdown = (["pending", "confirmed", "rescheduled", "completed", "cancelled", "no-show"] as BookingStatus[])
    .map((status) => {
      const count = bookings.filter((booking) => booking.status === status).length;
      return {
        status,
        label: getBookingStatusLabel(status),
        count,
        share: bookings.length ? Math.round((count / bookings.length) * 100) : 0
      };
    })
    .filter((item) => item.count > 0 || bookings.length === 0);

  const servicePerformance = primaryServices
    .map((service) => {
      const related = bookings.filter((booking) => booking.serviceId === service.id);
      const completed = related.filter((booking) => booking.status === "completed").length;
      const revenue = related
        .filter((booking) => booking.status !== "cancelled" && booking.status !== "no-show")
        .reduce((sum, booking) => sum + (booking.totalPrice ?? 0), 0);
      const addonAttached = related.filter((booking) => (booking.addOns ?? []).length > 0).length;

      return {
        id: service.id,
        name: service.name,
        bookings: related.length,
        revenue,
        completed,
        completionRate: related.length ? Math.round((completed / related.length) * 100) : 0,
        addonAttachRate: related.length ? Math.round((addonAttached / related.length) * 100) : 0
      };
    })
    .sort((a, b) => (b.revenue - a.revenue) || (b.bookings - a.bookings) || a.name.localeCompare(b.name, "id"));

  const addonPerformance = addonServices
    .map((service) => {
      const stats = bookings.reduce(
        (acc, booking) => {
          const match = (booking.addOns ?? []).find((item) => item.id === service.id || item.name === service.name);
          if (!match) return acc;
          acc.attachCount += 1;
          acc.revenue += match.price ?? 0;
          acc.totalDuration += match.duration ?? 0;
          return acc;
        },
        { attachCount: 0, revenue: 0, totalDuration: 0 }
      );

      return {
        id: service.id,
        name: service.name,
        ...stats
      };
    })
    .filter((item) => item.attachCount > 0)
    .sort((a, b) => (b.revenue - a.revenue) || (b.attachCount - a.attachCount) || a.name.localeCompare(b.name, "id"));

  const dueFollowUps = sortBookingsBySchedule(
    bookings.filter((booking) => booking.followUpNextActionAt && new Date(booking.followUpNextActionAt) <= nextSevenDaysEnd)
  ).slice(0, 5);

  const upcomingBookings = sortBookingsBySchedule(
    bookings.filter((booking) => getBookingDateTime(booking) >= now)
  ).slice(0, 6);

  const topService = servicePerformance[0];
  const highestPending = statusBreakdown.find((item) => item.status === "pending");
  const noShowItem = statusBreakdown.find((item) => item.status === "no-show");
  const bestAddon = addonPerformance[0];

  const operationalInsights = [
    topService
      ? {
          title: `Layanan terkuat saat ini: ${topService.name}`,
          detail: `${topService.bookings} booking dengan kontribusi ${formatCompactCurrency(topService.revenue)}. Cocok dijadikan anchor offer atau paket promosi.`,
          tone: "good" as const
        }
      : {
          title: "Belum ada layanan dominan",
          detail: "Data booking masih tipis. Setelah booking mulai rutin, panel ini akan membantu melihat layanan yang paling kuat secara revenue dan volume.",
          tone: "neutral" as const
        },
    highestPending && highestPending.count > 0
      ? {
          title: "Pending masih perlu perhatian",
          detail: `${highestPending.count} booking masih pending. Prioritaskan konfirmasi untuk mengurangi slot kosong mendadak di 7 hari ke depan.`,
          tone: "warning" as const
        }
      : {
          title: "Antrian pending cukup sehat",
          detail: "Tidak ada penumpukan booking pending yang signifikan. Operasional terlihat lebih siap jalan.",
          tone: "good" as const
        },
    bestAddon
      ? {
          title: `Upsell add-on terbaik: ${bestAddon.name}`,
          detail: `Terpasang ${bestAddon.attachCount} kali dan menambah ${formatCompactCurrency(bestAddon.revenue)}. Ini kandidat terbaik untuk diperjelas di flow booking publik.`,
          tone: "good" as const
        }
      : {
          title: "Belum ada add-on yang terbukti",
          detail: "Add-on belum banyak dipilih. Coba tampilkan benefit add-on lebih jelas di booking flow atau gabungkan ke paket utama tertentu.",
          tone: "neutral" as const
        },
    noShowItem && noShowItem.count > 0
      ? {
          title: "Ada sinyal no-show",
          detail: `${noShowItem.count} booking tercatat no-show. Pertimbangkan reminder H-1/H-0 atau deposit untuk slot yang paling rawan.`,
          tone: "warning" as const
        }
      : {
          title: "Belum ada no-show tercatat",
          detail: "Bagus untuk v1. Jaga dengan reminder dan follow up yang konsisten sebelum slot mulai padat.",
          tone: "good" as const
        }
  ];

  return {
    summary,
    statusBreakdown,
    servicePerformance,
    addonPerformance,
    operationalInsights,
    upcomingBookings,
    dueFollowUps,
    nextSevenDays: {
      totalBookings: nextSevenDaysBookings.length,
      totalRevenue: nextSevenDaysRevenue,
      busyDays: Object.entries(busyDayMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => (b.count - a.count) || a.date.localeCompare(b.date))
        .slice(0, 3)
    }
  };
}

export async function getDashboardPageData() {
  const [business, stats, timeline, bookings, highlights, bookingSummary] = await Promise.all([
    getOwnerBusiness(),
    getDashboardStats(),
    getTimelineItems(),
    getBookings(),
    getDashboardHighlights(),
    getBookingSummary()
  ]);

  return { business, stats, timeline, bookings, highlights, bookingSummary };
}

export async function getSchedulePageData() {
  const [bookings, hours, services] = await Promise.all([getBookings(), getBusinessHours(), getServices()]);
  const grouped = bookings.reduce<Record<string, Booking[]>>((acc, booking) => {
    acc[booking.date] ??= [];
    acc[booking.date].push(booking);
    return acc;
  }, {});

  return {
    bookingsByDate: grouped,
    hours,
    stats: {
      totalDates: Object.keys(grouped).length,
      totalBookings: bookings.length,
      activeServices: services.filter((service) => service.active ?? true).length
    }
  };
}

export { addMinutes, combineDateTime, formatDate, formatTime, hasOverlap, isBlockingStatus, subtractMinutes };



function mapTeamMemberAvailability(item: {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  note?: string | null;
}): TeamMemberAvailability {
  return {
    id: item.id,
    dayOfWeek: item.dayOfWeek,
    label: dayNames[item.dayOfWeek],
    shortLabel: shortDayNames[item.dayOfWeek],
    startTime: item.startTime,
    endTime: item.endTime,
    isAvailable: item.isAvailable,
    note: item.note ?? null
  };
}

function buildAvailabilitySummaryFromWeeklyAvailability(weeklyAvailability: TeamMemberAvailability[]) {
  const activeDays = weeklyAvailability.filter((item) => item.isAvailable);
  if (activeDays.length === 0) return null;
  const uniqueHours = [...new Set(activeDays.map((item) => `${item.startTime} - ${item.endTime}`))];
  const labels = activeDays.map((item) => item.shortLabel);
  return `${labels.join(', ')} • ${uniqueHours[0]}${uniqueHours.length > 1 ? ' +' : ''}`;
}

function buildWorkDaysSummaryFromWeeklyAvailability(weeklyAvailability: TeamMemberAvailability[]) {
  return weeklyAvailability.filter((item) => item.isAvailable).map((item) => item.shortLabel);
}

function mapTeamMember(member: {
  id: string;
  businessId: string;
  name: string;
  roleLabel: string;
  phone: string | null;
  email: string | null;
  bio: string | null;
  availabilitySummary: string | null;
  workDaysSummary: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  weeklyAvailability?: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    note: string | null;
  }>;
  serviceAssignments?: Array<{
    service: {
      id: string;
      name: string;
    };
  }>;
}): TeamMember {
  const availabilityMap = new Map((member.weeklyAvailability ?? []).map((item) => [item.dayOfWeek, mapTeamMemberAvailability(item)]));
  const weeklyAvailability = Array.from({ length: 7 }, (_, dayOfWeek) => availabilityMap.get(dayOfWeek) ?? mapTeamMemberAvailability({
    dayOfWeek,
    startTime: "09:00",
    endTime: "17:00",
    isAvailable: false,
    note: null
  }));
  const derivedWorkDays = buildWorkDaysSummaryFromWeeklyAvailability(weeklyAvailability);
  const derivedSummary = buildAvailabilitySummaryFromWeeklyAvailability(weeklyAvailability);
  const weeklyAvailabilityNote = weeklyAvailability.map((item) => item.note).find(Boolean) ?? null;

  return {
    id: member.id,
    businessId: member.businessId,
    name: member.name,
    roleLabel: member.roleLabel,
    phone: member.phone,
    email: member.email,
    bio: member.bio,
    availabilitySummary: member.availabilitySummary ?? derivedSummary,
    workDaysSummary: member.workDaysSummary.length > 0 ? member.workDaysSummary : derivedWorkDays,
    active: member.isActive,
    serviceIds: member.serviceAssignments?.map((item) => item.service.id) ?? [],
    serviceNames: member.serviceAssignments?.map((item) => item.service.name) ?? [],
    weeklyAvailability,
    weeklyAvailabilityNote,
    createdAt: member.createdAt?.toISOString() ?? null,
    updatedAt: member.updatedAt?.toISOString() ?? null
  };
}

export async function getTeamMembers(businessId?: string): Promise<TeamMember[]> {
  return withFallback(async () => {
    const business = await getScopedBusinessRecord(businessId);
    if (!business?.id) {
      return fallbackTeamMembers;
    }

    const items = await prisma.teamMember.findMany({
      where: { businessId: business.id },
      include: {
        serviceAssignments: {
          include: {
            service: {
              select: { id: true, name: true }
            }
          }
        },
        weeklyAvailability: {
          orderBy: { dayOfWeek: 'asc' }
        }
      },
      orderBy: [{ isActive: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }]
    });

    return items.map(mapTeamMember);
  }, fallbackTeamMembers);
}

export async function getPaginatedTeamMembers({
  businessId,
  q,
  status,
  serviceId,
  page,
  perPage
}: TeamListParams): Promise<PaginatedResult<TeamMember>> {
  return withFallback(async () => {
    const business = await getScopedBusinessRecord(businessId);
    const trimmedQuery = q?.trim();

    if (!business?.id) {
      const normalizedQuery = trimmedQuery?.toLowerCase() ?? '';
      const filtered = fallbackTeamMembers.filter((member) => {
        const matchesQuery =
          !normalizedQuery ||
          member.name.toLowerCase().includes(normalizedQuery) ||
          member.roleLabel.toLowerCase().includes(normalizedQuery) ||
          (member.serviceNames ?? []).some((name) => name.toLowerCase().includes(normalizedQuery));
        const matchesStatus =
          status === 'active'
            ? member.active ?? true
            : status === 'inactive'
              ? !(member.active ?? true)
              : true;
        const matchesService = !serviceId || (member.serviceIds ?? []).includes(serviceId);
        return matchesQuery && matchesStatus && matchesService;
      });

      return paginateItems(filtered, page, perPage);
    }

    const where: Prisma.TeamMemberWhereInput = {
      businessId: business.id,
      isActive: status === 'active' ? true : status === 'inactive' ? false : undefined,
      serviceAssignments: serviceId ? { some: { serviceId } } : undefined,
      AND: trimmedQuery
        ? [{
            OR: [
              { name: { contains: trimmedQuery, mode: 'insensitive' } },
              { roleLabel: { contains: trimmedQuery, mode: 'insensitive' } },
              { availabilitySummary: { contains: trimmedQuery, mode: 'insensitive' } },
              { serviceAssignments: { some: { service: { name: { contains: trimmedQuery, mode: 'insensitive' } } } } }
            ]
          }]
        : undefined
    };

    const safePage = Math.max(1, page);
    const [total, items] = await Promise.all([
      prisma.teamMember.count({ where }),
      prisma.teamMember.findMany({
        where,
        include: {
          serviceAssignments: {
            include: {
              service: {
                select: { id: true, name: true }
              }
            }
          },
          weeklyAvailability: {
            orderBy: { dayOfWeek: 'asc' }
          }
        },
        orderBy: [{ isActive: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
        skip: (safePage - 1) * perPage,
        take: perPage
      })
    ]);

    return buildPaginatedResult(items.map(mapTeamMember), total, Math.min(safePage, Math.max(1, Math.ceil(total / perPage))), perPage);
  }, paginateItems(fallbackTeamMembers, page, perPage));
}


export async function getTeamSchedulePageData() {
  const [teamMembers, services] = await Promise.all([getTeamMembers(), getServices()]);
  const activeMembers = teamMembers.filter((member) => member.active ?? true);
  const weeklyCoverage = dayNames.map((label, dayOfWeek) => {
    const scheduledMembers = activeMembers.filter((member) =>
      (member.weeklyAvailability ?? []).some((item) => item.dayOfWeek === dayOfWeek && item.isAvailable)
    );

    return {
      dayOfWeek,
      label,
      shortLabel: shortDayNames[dayOfWeek],
      scheduledCount: scheduledMembers.length,
      scheduledNames: scheduledMembers.map((member) => member.name)
    };
  });

  return {
    teamMembers,
    stats: {
      totalMembers: teamMembers.length,
      activeMembers: activeMembers.length,
      membersWithWeeklyAvailability: teamMembers.filter((member) => (member.weeklyAvailability ?? []).some((item) => item.isAvailable)).length,
      totalAssignedServices: teamMembers.reduce((sum, member) => sum + (member.serviceIds?.length ?? 0), 0),
      totalServices: services.filter((service) => service.active ?? true).length
    },
    weeklyCoverage
  };
}
