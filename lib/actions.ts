"use server";

import { Prisma } from "@prisma/client";
import { createHash, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  clearSession,
  createPasswordResetToken,
  hashPassword,
  hashPasswordResetToken,
  requireSessionUser,
  setSession,
  verifyPassword
} from "@/lib/auth";
import { normalizeRedirectTarget, withFeedback, withPublicBookingValues } from "@/lib/feedback";
import { buildBookingUrl } from "@/lib/app-config";
import { addMinutes, combineDateTime, hasDatabaseUrl } from "@/lib/data";
import { prisma } from "@/lib/prisma";

const defaultBusiness = {
  name: "Bisnis Baru Temujanji",
  slug: "bisnis-baru",
  category: "Bisnis jasa",
  city: "Bandung",
  description: "Lengkapi profil bisnis Anda lalu mulai terima booking online.",
  reminderChannel: "WhatsApp + dashboard"
};

const defaultHours = [
  { dayOfWeek: 0, openTime: "00:00", closeTime: "00:00", isActive: false },
  { dayOfWeek: 1, openTime: "09:00", closeTime: "18:00", isActive: true },
  { dayOfWeek: 2, openTime: "09:00", closeTime: "18:00", isActive: true },
  { dayOfWeek: 3, openTime: "09:00", closeTime: "19:00", isActive: true },
  { dayOfWeek: 4, openTime: "09:00", closeTime: "19:00", isActive: true },
  { dayOfWeek: 5, openTime: "09:00", closeTime: "19:00", isActive: true },
  { dayOfWeek: 6, openTime: "08:00", closeTime: "17:00", isActive: true }
];

const PASSWORD_RESET_WINDOW_MS = 15 * 60 * 1000;
const PASSWORD_RESET_BLOCK_MS = 30 * 60 * 1000;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_BLOCK_MS = 15 * 60 * 1000;
const MAX_NAME_LENGTH = 100;
const MAX_BUSINESS_TEXT_LENGTH = 160;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_NOTES_LENGTH = 2000;
const MAX_SOURCE_LENGTH = 80;
const FOLLOW_UP_STATUSES = ["none", "needs-follow-up", "contacted", "offer-sent", "won", "lost"] as const;

function normalizeText(value: string, maxLength: number) {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function normalizeEmailValue(value: string) {
  return normalizeText(value, 320).toLowerCase();
}

function normalizePhoneValue(value: string) {
  const trimmed = value.trim();
  const hasPlusPrefix = trimmed.startsWith("+");
  const digits = trimmed.replace(/[^\d]/g, "");
  return hasPlusPrefix ? `+${digits}` : digits;
}

function normalizeOptionalText(value: string, maxLength: number) {
  const normalized = normalizeText(value, maxLength);
  return normalized || null;
}

function isStrongPassword(password: string) {
  return password.length >= 10 && /[a-z]/i.test(password) && /\d/.test(password);
}

function hashIdentifier(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function getRequestIp() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  const realIp = headerStore.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || "unknown";
  return ip.slice(0, 200);
}

async function consumeRateLimit({
  scope,
  identifier,
  maxHits,
  windowMs,
  blockMs
}: {
  scope: string;
  identifier: string;
  maxHits: number;
  windowMs: number;
  blockMs: number;
}) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);
  const blockUntil = new Date(now.getTime() + blockMs);
  const key = hashIdentifier(identifier);

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const existing = await tx.authRateLimit.findUnique({
      where: {
        scope_identifier: {
          scope,
          identifier: key
        }
      }
    });

    if (!existing) {
      await tx.authRateLimit.create({
        data: {
          scope,
          identifier: key,
          hits: 1,
          windowStart: now
        }
      });

      return { allowed: true, retryAfterSeconds: 0 };
    }

    if (existing.blockedUntil && existing.blockedUntil > now) {
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil((existing.blockedUntil.getTime() - now.getTime()) / 1000)
      };
    }

    if (existing.windowStart < windowStart) {
      await tx.authRateLimit.update({
        where: { id: existing.id },
        data: {
          hits: 1,
          windowStart: now,
          blockedUntil: null
        }
      });

      return { allowed: true, retryAfterSeconds: 0 };
    }

    const hits = existing.hits + 1;
    const shouldBlock = hits > maxHits;

    await tx.authRateLimit.update({
      where: { id: existing.id },
      data: {
        hits,
        blockedUntil: shouldBlock ? blockUntil : null
      }
    });

    return {
      allowed: !shouldBlock,
      retryAfterSeconds: shouldBlock ? Math.ceil(blockMs / 1000) : 0
    };
  });

  return result;
}

async function clearRateLimit(scope: string, identifier: string) {
  await prisma.authRateLimit.deleteMany({
    where: {
      scope,
      identifier: hashIdentifier(identifier)
    }
  });
}

function getValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function parseStatus(value: string) {
  switch (value) {
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
    default:
      return "PENDING";
  }
}

function getRedirectTarget(formData: FormData, fallback: string) {
  return normalizeRedirectTarget(getValue(formData, "redirectTo"), fallback);
}

function redirectWithError(target: string, message: string): never {
  redirect(withFeedback(target, { type: "error", message }));
}

function redirectWithSuccess(target: string, message: string): never {
  redirect(withFeedback(target, { type: "success", message }));
}

function redirectPublicBookingWithError(
  target: string,
  message: string,
  values: {
    serviceId?: string;
    addOnIds?: string;
    customerName?: string;
    phone?: string;
    email?: string | null;
    source?: string | null;
    date?: string;
    time?: string;
    notes?: string | null;
  }
): never {
  const normalizedTarget = withPublicBookingValues(
    withFeedback(target, { type: "error", message }),
    {
      serviceId: values.serviceId,
      addOnIds: values.addOnIds,
      customerName: values.customerName,
      phone: values.phone,
      email: values.email ?? undefined,
      source: values.source ?? undefined,
      date: values.date,
      time: values.time,
      notes: values.notes ?? undefined
    }
  );

  redirect(normalizedTarget);
}

function ensureDatabaseConfigured(target: string) {
  if (!hasDatabaseUrl()) {
    redirectWithError(target, "DATABASE_URL belum disiapkan. Isi env lalu jalankan Prisma agar flow ini aktif.");
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function isValidEmail(value: string | null) {
  if (!value) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string) {
  return /^\+?\d{8,15}$/.test(value);
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTime(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}

function parseBookingSlotInterval(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function parseBookingBuffer(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function parseFollowUpStatus(value: string) {
  switch (value) {
    case "needs-follow-up": return "NEEDS_FOLLOW_UP";
    case "contacted": return "CONTACTED";
    case "offer-sent": return "OFFER_SENT";
    case "won": return "WON";
    case "lost": return "LOST";
    default: return "NONE";
  }
}

function normalizeFollowUpDateTime(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(`${trimmed}:00+07:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getSelectedValues(formData: FormData, key: string) {
  return formData.getAll(key).map((item) => String(item).trim()).filter(Boolean);
}

function isPrismaKnownError(error: unknown): error is { code: string } {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      typeof (error as { code?: unknown }).code === "string"
  );
}

function getNormalizedName(formData: FormData, key: string) {
  return normalizeText(getValue(formData, key), MAX_NAME_LENGTH);
}

function getNormalizedBusinessText(formData: FormData, key: string) {
  return normalizeText(getValue(formData, key), MAX_BUSINESS_TEXT_LENGTH);
}

function getNormalizedEmail(formData: FormData, key: string) {
  return normalizeEmailValue(getValue(formData, key));
}

function getNormalizedOptionalEmail(formData: FormData, key: string) {
  const value = getValue(formData, key);
  return value ? normalizeEmailValue(value) : null;
}

function getNormalizedPhone(formData: FormData, key: string) {
  return normalizePhoneValue(getValue(formData, key));
}

function getNormalizedOptionalText(formData: FormData, key: string, maxLength: number) {
  return normalizeOptionalText(getValue(formData, key), maxLength);
}

async function ensureBusinessForOwner(userId: string) {
  const existingBusiness = await prisma.business.findFirst({
    where: { ownerId: userId },
    orderBy: { createdAt: "asc" }
  });

  if (existingBusiness) {
    return existingBusiness;
  }

  const owner = await prisma.user.findUnique({ where: { id: userId } });
  const ownerName = owner?.name ?? "Owner Temujanji";
  let ownerSlug = slugify(ownerName) || defaultBusiness.slug;
  let suffix = 1;

  while (!(await validateUniqueSlug(ownerSlug))) {
    suffix += 1;
    ownerSlug = `${slugify(ownerName) || defaultBusiness.slug}-${suffix}`;
  }

  const business = await prisma.business.create({
    data: {
      ownerId: userId,
      name: `${ownerName} Studio`,
      slug: ownerSlug,
      category: defaultBusiness.category,
      city: defaultBusiness.city,
      description: defaultBusiness.description,
      reminderChannel: defaultBusiness.reminderChannel,
      bookingLink: buildBookingUrl(ownerSlug),
      onboardingCompleted: false
    }
  });

  await prisma.businessHour.createMany({
    data: defaultHours.map((hour) => ({ businessId: business.id, ...hour })),
    skipDuplicates: true
  });

  return business;
}

async function requireAuthenticatedBusiness() {
  const sessionUser = await requireSessionUser();
  return ensureBusinessForOwner(sessionUser.id);
}

async function validateUniqueSlug(slug: string, businessId?: string) {
  const existing = await prisma.business.findUnique({ where: { slug } });
  return !existing || existing.id === businessId;
}

async function validateBusinessHours(formData: FormData) {
  for (const hour of defaultHours) {
    const isActive = getBoolean(formData, `active-${hour.dayOfWeek}`);
    const openTime = getValue(formData, `open-${hour.dayOfWeek}`) || hour.openTime;
    const closeTime = getValue(formData, `close-${hour.dayOfWeek}`) || hour.closeTime;

    if (!isActive) {
      continue;
    }

    if (!isValidTime(openTime) || !isValidTime(closeTime) || openTime >= closeTime) {
      return "Jam operasional aktif harus punya rentang buka dan tutup yang valid.";
    }
  }

  return null;
}

async function findConflictingBooking({
  businessId,
  scheduledAt,
  endAt,
  bufferMins = 0,
  ignoredBookingId
}: {
  businessId: string;
  scheduledAt: Date;
  endAt: Date;
  bufferMins?: number;
  ignoredBookingId?: string;
}) {
  return prisma.booking.findFirst({
    where: {
      businessId,
      id: ignoredBookingId ? { not: ignoredBookingId } : undefined,
      status: { not: "CANCELLED" },
      scheduledAt: { lt: addMinutes(endAt, bufferMins) },
      endAt: { gt: addMinutes(scheduledAt, -bufferMins) }
    },
    orderBy: { scheduledAt: "asc" }
  });
}

async function ensureSlotWithinBusinessHours(businessId: string, scheduledAt: Date, endAt: Date) {
  const dayHours = await prisma.businessHour.findUnique({
    where: {
      businessId_dayOfWeek: {
        businessId,
        dayOfWeek: scheduledAt.getDay()
      }
    }
  });

  if (!dayHours || !dayHours.isActive) {
    return "Tanggal ini berada di luar jam operasional bisnis.";
  }

  const openAt = combineDateTime(scheduledAt.toISOString().slice(0, 10), dayHours.openTime);
  const closeAt = combineDateTime(scheduledAt.toISOString().slice(0, 10), dayHours.closeTime);

  if (scheduledAt < openAt || endAt > closeAt) {
    return "Jam booking harus berada di dalam jam operasional bisnis.";
  }

  return null;
}

async function createOrUpdateCustomerForBusiness({
  businessId,
  name,
  phone,
  email,
  source,
  notes
}: {
  businessId: string;
  name: string;
  phone: string;
  email: string | null;
  source: string | null;
  notes: string | null;
}) {
  return prisma.customer.upsert({
    where: {
      businessId_phone: {
        businessId,
        phone
      }
    },
    update: {
      name,
      email,
      source: source ?? undefined,
      notes: notes ?? undefined
    },
    create: {
      businessId,
      name,
      phone,
      email,
      source,
      notes
    }
  });
}

async function createBookingRecord({
  businessId,
  serviceId,
  addOnIds = [],
  name,
  phone,
  email,
  source,
  date,
  time,
  notes
}: {
  businessId: string;
  serviceId: string;
  addOnIds?: string[];
  name: string;
  phone: string;
  email: string | null;
  source: string | null;
  date: string;
  time: string;
  notes: string | null;
}) {
  const normalizedAddOnIds = [...new Set(addOnIds)];
  const [service, addOns, business] = await Promise.all([
    prisma.service.findFirst({ where: { id: serviceId, businessId, isAddon: false } }),
    normalizedAddOnIds.length > 0
      ? prisma.service.findMany({
          where: { id: { in: normalizedAddOnIds }, businessId, isAddon: true, isActive: true },
          include: {
            allowedPrimaryForRules: {
              select: { serviceId: true }
            }
          }
        })
      : Promise.resolve([]),
    prisma.business.findUnique({ where: { id: businessId }, select: { bookingBufferMins: true } })
  ]);

  if (!service) {
    return { error: "Layanan tidak ditemukan untuk bisnis ini." };
  }

  if (normalizedAddOnIds.length !== addOns.length) {
    return { error: "Beberapa add-on tidak valid atau sudah tidak aktif." };
  }

  const incompatibleAddOn = addOns.find((addOn) => {
    const allowedPrimaryServiceIds = addOn.allowedPrimaryForRules.map((rule) => rule.serviceId);
    return allowedPrimaryServiceIds.length > 0 && !allowedPrimaryServiceIds.includes(service.id);
  });

  if (incompatibleAddOn) {
    return { error: `${incompatibleAddOn.name} hanya tersedia untuk layanan utama tertentu.` };
  }

  const addOnDuration = addOns.reduce((sum, item) => sum + item.durationMins, 0);
  const addOnPrice = addOns.reduce((sum, item) => sum + item.price, 0);
  const totalDuration = service.durationMins + addOnDuration;
  const totalPrice = service.price + addOnPrice;
  const bookingBufferMins = business?.bookingBufferMins ?? 0;
  const scheduledAt = combineDateTime(date, time);
  const endAt = addMinutes(scheduledAt, totalDuration);

  if (scheduledAt <= new Date()) {
    return { error: "Booking harus dibuat untuk waktu yang akan datang." };
  }

  const businessHoursError = await ensureSlotWithinBusinessHours(businessId, scheduledAt, endAt);
  if (businessHoursError) {
    return { error: businessHoursError };
  }

  const conflict = await findConflictingBooking({ businessId, scheduledAt, endAt, bufferMins: bookingBufferMins });
  if (conflict) {
    return {
      error: bookingBufferMins > 0
        ? `Slot tersebut bentrok dengan booking lain atau buffer ${bookingBufferMins} menit. Pilih jam lain.`
        : "Slot tersebut sudah bentrok dengan booking lain. Pilih jam lain."
    };
  }

  const customer = await createOrUpdateCustomerForBusiness({
    businessId,
    name,
    phone,
    email,
    source,
    notes: null
  });

  await prisma.booking.create({
    data: {
      businessId,
      customerId: customer.id,
      serviceId: service.id,
      scheduledAt,
      endAt,
      notes,
      addOnSummary: addOns.map((item) => ({ id: item.id, name: item.name, price: item.price, duration: item.durationMins })),
      addOnNamesSnapshot: addOns.map((item) => item.name),
      addOnPriceSnapshot: addOnPrice,
      addOnDurationSnapshot: addOnDuration,
      totalPriceSnapshot: totalPrice,
      totalDurationSnapshot: totalDuration,
      customerNameSnapshot: customer.name,
      customerPhoneSnapshot: customer.phone,
      customerEmailSnapshot: customer.email,
      serviceNameSnapshot: service.name,
      servicePriceSnapshot: service.price,
      serviceDurationSnapshot: service.durationMins
    }
  });

  return { success: true };
}

function validateBookingInput({
  serviceId,
  name,
  phone,
  email,
  date,
  time
}: {
  serviceId: string;
  name: string;
  phone: string;
  email: string | null;
  date: string;
  time: string;
}) {
  if (!serviceId || !name || !phone || !date || !time) {
    return "Lengkapi layanan, nama customer, nomor WhatsApp, tanggal, dan jam booking.";
  }

  if (!isValidPhone(phone)) {
    return "Nomor WhatsApp harus terdiri dari 8-20 digit/karakter yang valid.";
  }

  if (!isValidEmail(email)) {
    return "Format email belum valid.";
  }

  if (!isValidDate(date) || !isValidTime(time)) {
    return "Tanggal atau jam booking belum valid.";
  }

  return null;
}

function refreshDashboardRoutes(slug?: string) {
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/services");
  revalidatePath("/bookings");
  revalidatePath("/follow-ups");
  revalidatePath("/reminders");
  revalidatePath("/customers");
  revalidatePath("/schedule");
  revalidatePath("/settings");
  revalidatePath("/onboarding");
  revalidatePath("/auth/login");
  revalidatePath("/auth/register");
  if (slug) {
    revalidatePath(`/book/${slug}`);
    revalidatePath(`/book/${slug}/success`);
  }
}

export async function registerOwner(formData: FormData) {
  const redirectTarget = getRedirectTarget(formData, "/auth/register");
  ensureDatabaseConfigured(redirectTarget);

  const name = getNormalizedName(formData, "name");
  const email = getNormalizedEmail(formData, "email");
  const businessName = getNormalizedBusinessText(formData, "businessName");
  const password = getValue(formData, "password");

  if (!name || !email || !businessName || !password) {
    redirectWithError(redirectTarget, "Isi nama owner, email, nama bisnis, dan password.");
  }

  if (!isValidEmail(email)) {
    redirectWithError(redirectTarget, "Email belum valid.");
  }

  if (!isStrongPassword(password)) {
    redirectWithError(redirectTarget, "Password minimal 10 karakter dan harus mengandung huruf serta angka.");
  }

  const requestedSlug = slugify(getValue(formData, "slug") || businessName);
  if (!requestedSlug || requestedSlug.length < 3) {
    redirectWithError(redirectTarget, "Slug bisnis minimal 3 karakter.");
  }

  if (!(await validateUniqueSlug(requestedSlug))) {
    redirectWithError(redirectTarget, "Slug bisnis sudah dipakai. Pilih slug lain.");
  }

  try {
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash: hashPassword(password)
        }
      });

      const business = await tx.business.create({
        data: {
          ownerId: user.id,
          name: businessName,
          slug: requestedSlug,
          category: defaultBusiness.category,
          city: defaultBusiness.city,
          description: defaultBusiness.description,
          reminderChannel: defaultBusiness.reminderChannel,
          bookingLink: buildBookingUrl(requestedSlug),
          onboardingCompleted: false
        }
      });

      await tx.businessHour.createMany({
        data: defaultHours.map((hour) => ({ businessId: business.id, ...hour }))
      });

      return user;
    });

    await setSession(result.id);
    refreshDashboardRoutes(requestedSlug);
    redirect(withFeedback("/onboarding", { type: "success", message: "Akun owner berhasil dibuat. Lengkapi profil bisnis untuk mulai menerima booking." }));
  } catch (error) {
    if (isPrismaKnownError(error) && error.code === "P2002") {
      redirectWithError(redirectTarget, "Email atau slug sudah dipakai.");
    }

    throw error;
  }
}

export async function loginOwner(formData: FormData) {
  const redirectTarget = getRedirectTarget(formData, "/auth/login");
  ensureDatabaseConfigured(redirectTarget);

  const email = getNormalizedEmail(formData, "email");
  const password = getValue(formData, "password");
  const next = normalizeRedirectTarget(getValue(formData, "next"), "/dashboard");

  if (!email || !password) {
    redirectWithError(redirectTarget, "Isi email dan password untuk login.");
  }

  const ip = await getRequestIp();
  const [emailLimit, ipLimit] = await Promise.all([
    consumeRateLimit({
      scope: "login-email",
      identifier: email,
      maxHits: 10,
      windowMs: LOGIN_WINDOW_MS,
      blockMs: LOGIN_BLOCK_MS
    }),
    consumeRateLimit({
      scope: "login-ip",
      identifier: ip,
      maxHits: 25,
      windowMs: LOGIN_WINDOW_MS,
      blockMs: LOGIN_BLOCK_MS
    })
  ]);

  if (!emailLimit.allowed || !ipLimit.allowed) {
    redirectWithError(redirectTarget, "Terlalu banyak percobaan login. Coba lagi beberapa menit lagi.");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
    redirectWithError(redirectTarget, "Email atau password tidak cocok.");
  }

  await Promise.all([
    clearRateLimit("login-email", email),
    clearRateLimit("login-ip", ip)
  ]);
  await setSession(user.id, user.sessionVersion);
  await ensureBusinessForOwner(user.id);
  refreshDashboardRoutes();
  redirect(next);
}

export async function requestPasswordReset(formData: FormData) {
  const redirectTarget = getRedirectTarget(formData, "/auth/forgot-password");
  ensureDatabaseConfigured(redirectTarget);

  const email = getNormalizedEmail(formData, "email");
  if (!email || !isValidEmail(email)) {
    redirectWithError(redirectTarget, "Masukkan email akun yang valid.");
  }

  const ip = await getRequestIp();
  const [emailLimit, ipLimit] = await Promise.all([
    consumeRateLimit({
      scope: "password-reset-email",
      identifier: email,
      maxHits: 3,
      windowMs: PASSWORD_RESET_WINDOW_MS,
      blockMs: PASSWORD_RESET_BLOCK_MS
    }),
    consumeRateLimit({
      scope: "password-reset-ip",
      identifier: ip,
      maxHits: 10,
      windowMs: PASSWORD_RESET_WINDOW_MS,
      blockMs: PASSWORD_RESET_BLOCK_MS
    })
  ]);

  if (!emailLimit.allowed || !ipLimit.allowed) {
    redirectWithSuccess(redirectTarget, "Jika email terdaftar, link reset password akan tersedia lagi setelah jeda singkat.");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    redirectWithSuccess(redirectTarget, "Jika email terdaftar, link reset password sudah disiapkan.");
  }

  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() }
  });

  const { rawToken, tokenHash } = createPasswordResetToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30)
    }
  });

  const resetUrl = `/auth/reset-password?token=${rawToken}`;
  redirect(
    withFeedback(
      `${redirectTarget}?resetLink=${encodeURIComponent(resetUrl)}&resetId=${encodeURIComponent(randomUUID().slice(0, 8))}`,
      {
        type: "success",
        message: "Link reset password berhasil dibuat. Untuk MVP ini, copy link yang tampil di halaman lalu buka untuk mengganti password."
      }
    )
  );
}

export async function resetPassword(formData: FormData) {
  const redirectTarget = getRedirectTarget(formData, "/auth/reset-password");
  ensureDatabaseConfigured(redirectTarget);

  const token = getValue(formData, "token");
  const password = getValue(formData, "password");
  const confirmPassword = getValue(formData, "confirmPassword");

  if (!token) {
    redirectWithError("/auth/forgot-password", "Token reset password tidak ditemukan. Minta link baru.");
  }

  if (!isStrongPassword(password)) {
    redirectWithError(`${redirectTarget}?token=${encodeURIComponent(token)}`, "Password minimal 10 karakter dan harus mengandung huruf serta angka.");
  }

  if (password !== confirmPassword) {
    redirectWithError(`${redirectTarget}?token=${encodeURIComponent(token)}`, "Konfirmasi password belum sama.");
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashPasswordResetToken(token) },
    include: { user: true }
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date()) {
    redirectWithError("/auth/forgot-password", "Link reset password sudah tidak valid atau kedaluwarsa. Minta link baru.");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash: hashPassword(password),
        sessionVersion: { increment: 1 }
      }
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() }
    }),
    prisma.passwordResetToken.updateMany({
      where: { userId: resetToken.userId, usedAt: null, id: { not: resetToken.id } },
      data: { usedAt: new Date() }
    })
  ]);

  refreshDashboardRoutes();
  redirect(withFeedback("/auth/login", { type: "success", message: "Password berhasil diperbarui. Silakan login dengan password baru." }));
}

export async function logoutOwner() {
  const sessionUser = await requireSessionUser();
  await prisma.user.update({
    where: { id: sessionUser.id },
    data: {
      sessionVersion: { increment: 1 }
    }
  });
  await clearSession();
  refreshDashboardRoutes();
  redirect("/");
}

export async function saveBusinessProfile(formData: FormData) {
  const redirectTarget = getRedirectTarget(formData, "/settings");
  ensureDatabaseConfigured(redirectTarget);

  const business = await requireAuthenticatedBusiness();
  const name = getNormalizedBusinessText(formData, "name");
  const rawSlug = getValue(formData, "slug");
  const slug = slugify(rawSlug);
  const category = getNormalizedBusinessText(formData, "category");
  const city = getNormalizedBusinessText(formData, "city");
  const description = normalizeText(getValue(formData, "description"), MAX_DESCRIPTION_LENGTH);
  const email = getNormalizedOptionalEmail(formData, "email");
  const rawPhone = getValue(formData, "phone");
  const phone = rawPhone ? normalizePhoneValue(rawPhone) : null;
  const reminderChannel =
    getNormalizedBusinessText(formData, "reminderChannel") || defaultBusiness.reminderChannel;
  const bookingSlotInterval = parseBookingSlotInterval(getValue(formData, "bookingSlotInterval") || "15");
  const bookingBufferMins = parseBookingBuffer(getValue(formData, "bookingBufferMins") || "0");

  if (!name || !slug || !category || !city || !description) {
    redirectWithError(redirectTarget, "Nama bisnis, slug, kategori, kota, dan deskripsi wajib diisi.");
  }

  if (!(await validateUniqueSlug(slug, business.id))) {
    redirectWithError(redirectTarget, "Slug booking sudah digunakan bisnis lain.");
  }

  if (!Number.isFinite(bookingSlotInterval) || bookingSlotInterval < 5 || bookingSlotInterval % 5 !== 0) {
    redirectWithError(redirectTarget, "Interval slot harus minimal 5 menit dan kelipatan 5 menit.");
  }

  if (!Number.isFinite(bookingBufferMins) || bookingBufferMins < 0 || bookingBufferMins % 5 !== 0) {
    redirectWithError(redirectTarget, "Buffer booking harus 0 atau kelipatan 5 menit.");
  }

  if (email && !isValidEmail(email)) {
    redirectWithError(redirectTarget, "Email bisnis belum valid.");
  }

  if (phone && !isValidPhone(phone)) {
    redirectWithError(redirectTarget, "Nomor WhatsApp bisnis belum valid.");
  }

  const businessHoursError = await validateBusinessHours(formData);
  if (businessHoursError) {
    redirectWithError(redirectTarget, businessHoursError);
  }

  await prisma.business.update({
    where: { id: business.id },
    data: {
      name,
      slug,
      category,
      city,
      description,
      bookingLink: buildBookingUrl(slug),
      reminderChannel,
      bookingSlotInterval,
      bookingBufferMins,
      phone,
      email,
      onboardingCompleted: true
    }
  });

  for (const hour of defaultHours) {
    await prisma.businessHour.upsert({
      where: {
        businessId_dayOfWeek: {
          businessId: business.id,
          dayOfWeek: hour.dayOfWeek
        }
      },
      update: {
        openTime: getValue(formData, `open-${hour.dayOfWeek}`) || hour.openTime,
        closeTime: getValue(formData, `close-${hour.dayOfWeek}`) || hour.closeTime,
        isActive: getBoolean(formData, `active-${hour.dayOfWeek}`)
      },
      create: {
        businessId: business.id,
        dayOfWeek: hour.dayOfWeek,
        openTime: getValue(formData, `open-${hour.dayOfWeek}`) || hour.openTime,
        closeTime: getValue(formData, `close-${hour.dayOfWeek}`) || hour.closeTime,
        isActive: getBoolean(formData, `active-${hour.dayOfWeek}`)
      }
    });
  }

  refreshDashboardRoutes(slug);
  redirectWithSuccess(redirectTarget, "Profil bisnis berhasil disimpan.");
}

export async function createService(formData: FormData) {
  const redirectTarget = getRedirectTarget(formData, "/services");
  ensureDatabaseConfigured(redirectTarget);
  const business = await requireAuthenticatedBusiness();

  const name = getNormalizedBusinessText(formData, "name");
  const description = normalizeText(getValue(formData, "description"), MAX_DESCRIPTION_LENGTH);
  const duration = Number(getValue(formData, "duration"));
  const price = Number(getValue(formData, "price"));
  const isAddon = getBoolean(formData, "isAddon");
  const allowedPrimaryServiceIds = getSelectedValues(formData, "allowedPrimaryServiceIds");

  if (!name || !description || !Number.isFinite(duration) || !Number.isFinite(price)) {
    redirectWithError(redirectTarget, "Lengkapi nama layanan, deskripsi, durasi, dan harga.");
  }

  if (duration < 15 || duration % 15 !== 0) {
    redirectWithError(redirectTarget, "Durasi layanan minimal 15 menit dan kelipatan 15 menit.");
  }

  if (price < 0) {
    redirectWithError(redirectTarget, "Harga layanan tidak boleh negatif.");
  }

  if (isAddon && allowedPrimaryServiceIds.length > 0) {
    const primaryServices = await prisma.service.findMany({
      where: {
        id: { in: allowedPrimaryServiceIds },
        businessId: business.id,
        isAddon: false
      },
      select: { id: true }
    });

    if (primaryServices.length !== allowedPrimaryServiceIds.length) {
      redirectWithError(redirectTarget, "Aturan add-on hanya boleh diarahkan ke layanan utama yang valid.");
    }
  }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const service = await tx.service.create({
      data: {
        businessId: business.id,
        name,
        description,
        durationMins: duration,
        price,
        isActive: true,
        isPopular: getBoolean(formData, "popular"),
        isAddon
      }
    });

    if (isAddon && allowedPrimaryServiceIds.length > 0) {
      await tx.serviceAddonRule.createMany({
        data: allowedPrimaryServiceIds.map((primaryServiceId) => ({
          serviceId: primaryServiceId,
          addOnServiceId: service.id
        })),
        skipDuplicates: true
      });
    }
  });

  refreshDashboardRoutes(business.slug);
  redirectWithSuccess(redirectTarget, "Layanan baru berhasil ditambahkan.");
}

export async function updateService(formData: FormData) {
  const redirectTarget = getRedirectTarget(formData, "/services");
  ensureDatabaseConfigured(redirectTarget);
  const business = await requireAuthenticatedBusiness();
  const serviceId = getValue(formData, "serviceId");
  const name = getNormalizedBusinessText(formData, "name");
  const description = normalizeText(getValue(formData, "description"), MAX_DESCRIPTION_LENGTH);
  const duration = Number(getValue(formData, "duration"));
  const price = Number(getValue(formData, "price"));
  const isAddon = getBoolean(formData, "isAddon");
  const allowedPrimaryServiceIds = getSelectedValues(formData, "allowedPrimaryServiceIds");

  if (!serviceId || !name || !description || !Number.isFinite(duration) || !Number.isFinite(price)) {
    redirectWithError(redirectTarget, "Data layanan belum lengkap.");
  }

  if (duration < 15 || duration % 15 !== 0) {
    redirectWithError(redirectTarget, "Durasi layanan minimal 15 menit dan kelipatan 15 menit.");
  }

  const existingService = await prisma.service.findFirst({
    where: { id: serviceId, businessId: business.id },
    select: { id: true, isAddon: true }
  });

  if (!existingService) {
    redirectWithError(redirectTarget, "Layanan tidak ditemukan.");
  }

  if (isAddon && allowedPrimaryServiceIds.length > 0) {
    const primaryServices = await prisma.service.findMany({
      where: {
        businessId: business.id,
        isAddon: false,
        id: { in: allowedPrimaryServiceIds, not: serviceId }
      },
      select: { id: true }
    });

    if (primaryServices.length !== allowedPrimaryServiceIds.length) {
      redirectWithError(redirectTarget, "Aturan add-on hanya boleh diarahkan ke layanan utama yang valid.");
    }
  }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.service.update({
      where: { id: serviceId },
      data: {
        name,
        description,
        durationMins: duration,
        price,
        isActive: getBoolean(formData, "active"),
        isPopular: getBoolean(formData, "popular"),
        isAddon
      }
    });

    if (existingService.isAddon || isAddon) {
      await tx.serviceAddonRule.deleteMany({
        where: { addOnServiceId: serviceId }
      });
    }

    if (!existingService.isAddon && isAddon) {
      await tx.serviceAddonRule.deleteMany({
        where: { serviceId }
      });
    }

    if (isAddon && allowedPrimaryServiceIds.length > 0) {
      await tx.serviceAddonRule.createMany({
        data: allowedPrimaryServiceIds.map((primaryServiceId) => ({
          serviceId: primaryServiceId,
          addOnServiceId: serviceId
        })),
        skipDuplicates: true
      });
    }
  });

  refreshDashboardRoutes(business.slug);
  redirectWithSuccess(redirectTarget, "Layanan berhasil diperbarui.");
}

export async function deleteService(formData: FormData) {
  const redirectTarget = getRedirectTarget(formData, "/services");
  ensureDatabaseConfigured(redirectTarget);
  const business = await requireAuthenticatedBusiness();
  const serviceId = getValue(formData, "serviceId");

  if (!serviceId) {
    redirectWithError(redirectTarget, "Service ID tidak ditemukan.");
  }

  const bookingCount = await prisma.booking.count({ where: { serviceId, businessId: business.id } });

  if (bookingCount > 0) {
    await prisma.service.updateMany({
      where: { id: serviceId, businessId: business.id },
      data: { isActive: false }
    });
    refreshDashboardRoutes(business.slug);
    redirectWithSuccess(redirectTarget, "Layanan punya histori booking, jadi dinonaktifkan alih-alih dihapus.");
  }

  await prisma.service.deleteMany({ where: { id: serviceId, businessId: business.id } });
  refreshDashboardRoutes(business.slug);
  redirectWithSuccess(redirectTarget, "Layanan berhasil dihapus.");
}

export async function createCustomer(formData: FormData) {
  const redirectTarget = getRedirectTarget(formData, "/customers");
  ensureDatabaseConfigured(redirectTarget);
  const business = await requireAuthenticatedBusiness();

  const name = getNormalizedName(formData, "name");
  const phone = getNormalizedPhone(formData, "phone");
  const email = getNormalizedOptionalEmail(formData, "email");
  const source = getNormalizedOptionalText(formData, "source", MAX_SOURCE_LENGTH);
  const notes = getNormalizedOptionalText(formData, "notes", MAX_NOTES_LENGTH);

  if (!name || !phone) {
    redirectWithError(redirectTarget, "Nama dan nomor WhatsApp customer wajib diisi.");
  }

  if (!isValidPhone(phone)) {
    redirectWithError(redirectTarget, "Nomor WhatsApp customer belum valid.");
  }

  if (!isValidEmail(email)) {
    redirectWithError(redirectTarget, "Email customer belum valid.");
  }

  await createOrUpdateCustomerForBusiness({
    businessId: business.id,
    name,
    phone,
    email,
    source,
    notes
  });

  refreshDashboardRoutes(business.slug);
  redirectWithSuccess(redirectTarget, "Customer berhasil disimpan.");
}

export async function updateCustomer(formData: FormData) {
  const redirectTarget = getRedirectTarget(formData, "/customers");
  ensureDatabaseConfigured(redirectTarget);
  const business = await requireAuthenticatedBusiness();

  const customerId = getValue(formData, "customerId");
  const name = getNormalizedName(formData, "name");
  const phone = getNormalizedPhone(formData, "phone");
  const email = getNormalizedOptionalEmail(formData, "email");
  const source = getNormalizedOptionalText(formData, "source", MAX_SOURCE_LENGTH);
  const notes = getNormalizedOptionalText(formData, "notes", MAX_NOTES_LENGTH);

  if (!customerId || !name || !phone) {
    redirectWithError(redirectTarget, "Data customer belum lengkap.");
  }

  if (!isValidPhone(phone)) {
    redirectWithError(redirectTarget, "Nomor WhatsApp customer belum valid.");
  }

  if (!isValidEmail(email)) {
    redirectWithError(redirectTarget, "Email customer belum valid.");
  }

  try {
    const updated = await prisma.customer.updateMany({
      where: { id: customerId, businessId: business.id },
      data: {
        name,
        phone,
        email,
        source,
        notes
      }
    });

    if (updated.count === 0) {
      redirectWithError(redirectTarget, "Customer tidak ditemukan.");
    }
  } catch (error) {
    if (isPrismaKnownError(error) && error.code === "P2002") {
      redirectWithError(redirectTarget, "Nomor WhatsApp itu sudah dipakai customer lain.");
    }

    throw error;
  }

  refreshDashboardRoutes(business.slug);
  redirectWithSuccess(redirectTarget, "Customer berhasil diperbarui.");
}

export async function deleteCustomer(formData: FormData) {
  const redirectTarget = getRedirectTarget(formData, "/customers");
  ensureDatabaseConfigured(redirectTarget);
  const business = await requireAuthenticatedBusiness();
  const customerId = getValue(formData, "customerId");

  if (!customerId) {
    redirectWithError(redirectTarget, "Customer ID tidak ditemukan.");
  }

  const bookingCount = await prisma.booking.count({ where: { customerId, businessId: business.id } });
  if (bookingCount > 0) {
    redirectWithError(redirectTarget, "Customer tidak bisa dihapus karena masih punya booking.");
  }

  const deleted = await prisma.customer.deleteMany({ where: { id: customerId, businessId: business.id } });
  if (deleted.count === 0) {
    redirectWithError(redirectTarget, "Customer tidak ditemukan.");
  }

  refreshDashboardRoutes(business.slug);
  redirectWithSuccess(redirectTarget, "Customer berhasil dihapus.");
}

export async function createBooking(formData: FormData) {
  const redirectTarget = getRedirectTarget(formData, "/bookings");
  ensureDatabaseConfigured(redirectTarget);
  const business = await requireAuthenticatedBusiness();

  const serviceId = getValue(formData, "serviceId");
  const name = getNormalizedName(formData, "customerName");
  const phone = getNormalizedPhone(formData, "phone");
  const email = getNormalizedOptionalEmail(formData, "email");
  const source = getNormalizedOptionalText(formData, "source", MAX_SOURCE_LENGTH);
  const date = getValue(formData, "date");
  const time = getValue(formData, "time");
  const notes = getNormalizedOptionalText(formData, "notes", MAX_NOTES_LENGTH);
  const addOnIds = getSelectedValues(formData, "addOnIds");

  const validationError = validateBookingInput({ serviceId, name, phone, email, date, time });
  if (validationError) {
    redirectWithError(redirectTarget, validationError);
  }

  const result = await createBookingRecord({
    businessId: business.id,
    serviceId,
    addOnIds,
    name,
    phone,
    email,
    source,
    date,
    time,
    notes
  });

  if (result.error) {
    redirectWithError(redirectTarget, result.error);
  }

  refreshDashboardRoutes(business.slug);
  redirectWithSuccess(redirectTarget, "Booking baru berhasil dibuat.");
}

export async function updateBookingStatus(formData: FormData) {
  const redirectTarget = getRedirectTarget(formData, "/bookings");
  ensureDatabaseConfigured(redirectTarget);
  const business = await requireAuthenticatedBusiness();
  const bookingId = getValue(formData, "bookingId");
  const status = parseStatus(getValue(formData, "status"));
  const date = getValue(formData, "date");
  const time = getValue(formData, "time");
  const notes = getNormalizedOptionalText(formData, "notes", MAX_NOTES_LENGTH);
  const followUpStatus = parseFollowUpStatus(getValue(formData, "followUpStatus"));
  const followUpNote = getNormalizedOptionalText(formData, "followUpNote", MAX_NOTES_LENGTH);
  const followUpNextActionAt = normalizeFollowUpDateTime(getValue(formData, "followUpNextActionAt"));

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, businessId: business.id },
    include: { service: true, business: true }
  });

  if (!booking) {
    redirectWithError(redirectTarget, "Booking tidak ditemukan.");
  }

  if (!isValidDate(date) || !isValidTime(time)) {
    redirectWithError(redirectTarget, "Tanggal atau jam booking belum valid.");
  }

  const scheduledAt = combineDateTime(date, time);
  const endAt = addMinutes(scheduledAt, booking.totalDurationSnapshot || booking.service.durationMins);

  if (scheduledAt <= new Date()) {
    redirectWithError(redirectTarget, "Waktu booking harus berada di masa depan.");
  }

  const businessHoursError = await ensureSlotWithinBusinessHours(business.id, scheduledAt, endAt);
  if (businessHoursError) {
    redirectWithError(redirectTarget, businessHoursError);
  }

  const conflict = await findConflictingBooking({
    businessId: business.id,
    scheduledAt,
    endAt,
    bufferMins: booking.business.bookingBufferMins ?? 0,
    ignoredBookingId: booking.id
  });

  if (conflict) {
    redirectWithError(
      redirectTarget,
      booking.business.bookingBufferMins
        ? `Perubahan jadwal bentrok dengan booking lain atau buffer ${booking.business.bookingBufferMins} menit.`
        : "Perubahan jadwal bentrok dengan booking lain."
    );
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status,
      notes,
      followUpStatus,
      followUpNote,
      followUpNextActionAt,
      scheduledAt,
      endAt
    }
  });

  refreshDashboardRoutes(booking.business.slug);
  redirectWithSuccess(redirectTarget, "Booking berhasil diperbarui.");
}

export async function updateBookingFollowUp(formData: FormData) {
  const redirectTarget = getRedirectTarget(formData, "/follow-ups");
  ensureDatabaseConfigured(redirectTarget);
  const business = await requireAuthenticatedBusiness();
  const bookingId = getValue(formData, "bookingId");
  const followUpStatus = parseFollowUpStatus(getValue(formData, "followUpStatus"));
  const followUpNote = getNormalizedOptionalText(formData, "followUpNote", MAX_NOTES_LENGTH);
  const followUpNextActionAt = normalizeFollowUpDateTime(getValue(formData, "followUpNextActionAt"));

  if (!bookingId) {
    redirectWithError(redirectTarget, "Booking ID tidak ditemukan.");
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, businessId: business.id },
    include: { business: true }
  });

  if (!booking) {
    redirectWithError(redirectTarget, "Booking tidak ditemukan.");
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      followUpStatus,
      followUpNote,
      followUpNextActionAt
    }
  });

  refreshDashboardRoutes(booking.business.slug);
  revalidatePath(`/bookings/${booking.id}`);
  redirectWithSuccess(redirectTarget, "Follow up booking berhasil diperbarui.");
}

export async function deleteBooking(formData: FormData) {
  const redirectTarget = getRedirectTarget(formData, "/bookings");
  ensureDatabaseConfigured(redirectTarget);
  const business = await requireAuthenticatedBusiness();
  const bookingId = getValue(formData, "bookingId");

  if (!bookingId) {
    redirectWithError(redirectTarget, "Booking ID tidak ditemukan.");
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, businessId: business.id },
    include: { business: true }
  });

  if (!booking) {
    redirectWithError(redirectTarget, "Booking tidak ditemukan.");
  }

  await prisma.booking.delete({ where: { id: bookingId } });
  refreshDashboardRoutes(booking.business.slug);
  redirectWithSuccess(redirectTarget, "Booking berhasil dihapus.");
}

export async function createPublicBooking(formData: FormData) {
  const slug = getValue(formData, "slug") || "temujanji-studio";
  const redirectTarget = `/book/${slug}`;
  ensureDatabaseConfigured(redirectTarget);

  const serviceId = getValue(formData, "serviceId");
  const name = getNormalizedName(formData, "customerName");
  const phone = getNormalizedPhone(formData, "phone");
  const email = getNormalizedOptionalEmail(formData, "email");
  const source = getNormalizedOptionalText(formData, "source", MAX_SOURCE_LENGTH);
  const date = getValue(formData, "date");
  const time = getValue(formData, "time");
  const notes = getNormalizedOptionalText(formData, "notes", MAX_NOTES_LENGTH);
  const addOnIds = (getValue(formData, "addOnIds") || "").split(",").map((item) => item.trim()).filter(Boolean);
  const formValues = { serviceId, addOnIds: addOnIds.join(","), customerName: name, phone, email, source, date, time, notes };

  const validationError = validateBookingInput({ serviceId, name, phone, email, date, time });
  if (validationError) {
    redirectPublicBookingWithError(redirectTarget, validationError, formValues);
  }

  const business = await prisma.business.findUnique({ where: { slug } });
  if (!business) {
    redirectPublicBookingWithError(redirectTarget, "Bisnis untuk link booking ini tidak ditemukan.", formValues);
  }

  const result = await createBookingRecord({
    businessId: business.id,
    serviceId,
    addOnIds,
    name,
    phone,
    email,
    source,
    date,
    time,
    notes
  });

  if (result.error) {
    redirectPublicBookingWithError(redirectTarget, result.error, formValues);
  }

  refreshDashboardRoutes(business.slug);
  redirect(`/book/${slug}/success`);
}
