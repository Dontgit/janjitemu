import { randomBytes, createHash, createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  businessId?: string;
  businessSlug?: string;
  onboardingCompleted?: boolean;
};

function getAuthSecret() {
  if (process.env.AUTH_SECRET) {
    return process.env.AUTH_SECRET;
  }

  if (process.env.NODE_ENV !== "production") {
    return "temujanji-dev-secret-change-me";
  }

  throw new Error("AUTH_SECRET is required in production.");
}

function signValue(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("hex");
}

function getSessionCookieName() {
  return process.env.NODE_ENV === "production" ? "__Host-temujanji_session" : "temujanji_session";
}

function createSessionToken(userId: string, sessionVersion: number) {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `${userId}.${sessionVersion}.${expiresAt}`;
  return `${payload}.${signValue(payload)}`;
}

function parseSessionToken(token: string) {
  const [userId, sessionVersionRaw, expiresAtRaw, signature] = token.split(".");
  if (!userId || !sessionVersionRaw || !expiresAtRaw || !signature) {
    return null;
  }

  const payload = `${userId}.${sessionVersionRaw}.${expiresAtRaw}`;
  const expected = signValue(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  const expiresAt = Number(expiresAtRaw);
  const sessionVersion = Number(sessionVersionRaw);
  if (!Number.isFinite(expiresAt) || !Number.isInteger(sessionVersion) || expiresAt <= Date.now()) {
    return null;
  }

  return { userId, sessionVersion };
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) {
    return false;
  }

  const derived = scryptSync(password, salt, 64);
  const hashBuffer = Buffer.from(hash, "hex");

  return derived.length === hashBuffer.length && timingSafeEqual(derived, hashBuffer);
}

export function createPasswordResetToken() {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
}

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function setSession(userId: string, sessionVersion?: number) {
  const user =
    typeof sessionVersion === "number"
      ? { sessionVersion }
      : await prisma.user.findUnique({
          where: { id: userId },
          select: { sessionVersion: true }
        });
  if (!user) {
    throw new Error("Cannot set session for unknown user.");
  }

  const cookieStore = await cookies();
  cookieStore.set(getSessionCookieName(), createSessionToken(userId, user.sessionVersion), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
    expires: new Date(Date.now() + SESSION_MAX_AGE * 1000),
    priority: "high"
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(getSessionCookieName());
}

const getCachedSessionUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;

  if (!token) {
    return null;
  }

  const parsed = parseSessionToken(token);
  if (!parsed) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: parsed.userId }
  });

  if (!user) {
    return null;
  }

  if (user.sessionVersion !== parsed.sessionVersion) {
    return null;
  }

  const business = await prisma.business.findFirst({
    where: { ownerId: user.id },
    orderBy: { createdAt: "asc" }
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    businessId: business?.id,
    businessSlug: business?.slug,
    onboardingCompleted: business?.onboardingCompleted
  };
});

export async function getOptionalSessionUser() {
  return getCachedSessionUser();
}

export async function requireSessionUser(next = "/dashboard") {
  const user = await getCachedSessionUser();
  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(next)}`);
  }

  return user;
}
