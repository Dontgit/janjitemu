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
  timelineItems as fallbackTimeline
} from "@/lib/mock-data";
import {
  AvailabilityDay,
  Booking,
  BookingSummary,
  BookingStatus,
  BusinessHour,
  BusinessProfile,
  Customer,
  DashboardHighlight,
  DashboardStat,
  PaginatedResult,
  Service,
  TimelineItem
} from "@/lib/types";

const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"] as const;
const AVAILABILITY_WINDOW_DAYS = 5;
const SLOT_INTERVAL_MINS = 15;

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

function hasOverlap(start: Date, end: Date, booking: Booking) {
  if (!isBlockingStatus(booking.status)) {
    return false;
  }

  const range = getBookingRange(booking);
  return start < range.end && end > range.start;
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
  status: string;
  notes: string | null;
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
    date: formatDate(booking.scheduledAt),
    time: formatTime(booking.scheduledAt),
    endDate: formatDate(booking.endAt),
    endTime: formatTime(booking.endAt),
    duration: booking.serviceDurationSnapshot,
    status: mapStatus(booking.status),
    notes: booking.notes ?? undefined
  } satisfies Booking;
}

function buildAvailability(
  hours: BusinessHour[],
  bookings: Booking[],
  serviceDuration: number
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

      if (slotStart > now && !dayBookings.some((booking) => hasOverlap(slotStart, slotEnd, booking))) {
        slots.push(formatTime(slotStart));
      }

      cursor.setMinutes(cursor.getMinutes() + SLOT_INTERVAL_MINS);
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

function getBookingWhereClause(businessId: string, params: Omit<BookingListParams, "businessId" | "page" | "perPage">): Prisma.BookingWhereInput {
  const trimmedQuery = params.q?.trim();

  return {
    businessId,
    status: params.status ? parsePrismaBookingStatus(params.status) : undefined,
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
      orderBy: [{ isPopular: "desc" }, { createdAt: "asc" }]
    });

    return items.map((service) => ({
      id: service.id,
      businessId: service.businessId,
      name: service.name,
      duration: service.durationMins,
      price: service.price,
      description: service.description,
      active: service.isActive,
      popular: service.isPopular
    }));
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
        const matchesService = !serviceId || booking.serviceId === serviceId;

        return matchesQuery && matchesStatus && matchesService;
      });

      return paginateItems(filtered, page, perPage);
    }

    const where = getBookingWhereClause(business.id, { q, status, serviceId });
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
        orderBy: [{ isPopular: "desc" }, { createdAt: "asc" }],
        skip: (normalizedPage - 1) * perPage,
        take: perPage
      });

      return buildPaginatedResult(
        normalizedItems.map((service) => ({
          id: service.id,
          businessId: service.businessId,
          name: service.name,
          duration: service.durationMins,
          price: service.price,
          description: service.description,
          active: service.isActive,
          popular: service.isPopular
        })),
        total,
        normalizedPage,
        perPage
      );
    }

    return buildPaginatedResult(
      items.map((service) => ({
        id: service.id,
        businessId: service.businessId,
        name: service.name,
        duration: service.durationMins,
        price: service.price,
        description: service.description,
        active: service.isActive,
        popular: service.isPopular
      })),
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

  return todayItems.length > 0 ? todayItems : fallbackTimeline;
}

export async function getAvailabilityForSlug(slug: string): Promise<AvailabilityDay[]> {
  const business = await getPublicBusiness(slug);
  const allBookings = await getBookings(business.id);
  const hours = await getBusinessHours(business.id);
  const services = await getServices(business.id);
  const activeServices = services.filter((service) => service.active ?? true);

  if (!business.id) {
    return fallbackBusinessProfile.slug === slug ? availableDates : [];
  }

  return buildAvailability(hours, allBookings, activeServices[0]?.duration ?? services[0]?.duration ?? 30);
}

export async function getPublicPageData(slug: string) {
  const business = await getPublicBusiness(slug);
  const [services, bookings, hours] = await Promise.all([
    getServices(business.id),
    getBookings(business.id),
    getBusinessHours(business.id)
  ]);
  const activeServices = services.filter((service) => service.active ?? true);
  const visibleServices = activeServices.length > 0 ? activeServices : services;
  const availabilityByService = Object.fromEntries(
    visibleServices.map((service) => [service.id, buildAvailability(hours, bookings, service.duration)])
  ) as Record<string, AvailabilityDay[]>;
  const openDays = hours.filter((hour) => hour.active).length;

  return {
    business,
    services: visibleServices,
    availability: visibleServices[0] ? availabilityByService[visibleServices[0].id] ?? [] : availableDates,
    availabilityByService,
    guidance: [
      `${openDays} hari operasional aktif per minggu`,
      business.phone ? `Konfirmasi tambahan bisa melalui ${business.phone}` : "Siapkan nomor aktif agar konfirmasi lebih cepat",
      visibleServices.length > 0 ? `${visibleServices.length} layanan siap dibooking` : "Tambahkan layanan aktif agar halaman publik lebih berguna"
    ]
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

export { addMinutes, combineDateTime, formatDate, formatTime, hasOverlap, isBlockingStatus };
