import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "stemora_admin_session";

function getAdminUsername() {
  return process.env.ADMIN_USERNAME || "admin";
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || process.env.ADMIN_EXPORT_TOKEN;
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || getAdminPassword();
}

function safeEqual(a: string, b: string) {
  const first = Buffer.from(a);
  const second = Buffer.from(b);

  if (first.length !== second.length) {
    return false;
  }

  return timingSafeEqual(first, second);
}

function sign(value: string) {
  const secret = getSessionSecret();

  if (!secret) {
    throw new Error("Admin password is missing.");
  }

  return createHmac("sha256", secret).update(value).digest("hex");
}

export function verifyAdminCredentials(username: string, password: string) {
  const expectedPassword = getAdminPassword();

  if (!expectedPassword) {
    throw new Error("Admin password is missing.");
  }

  return safeEqual(username, getAdminUsername()) && safeEqual(password, expectedPassword);
}

export function createAdminSession() {
  const issuedAt = Date.now().toString();
  return `${issuedAt}.${sign(issuedAt)}`;
}

export function isValidAdminSession(value?: string) {
  if (!value) {
    return false;
  }

  const [issuedAt, signature] = value.split(".");

  if (!issuedAt || !signature) {
    return false;
  }

  const maxAgeMs = 1000 * 60 * 60 * 12;
  const sessionAge = Date.now() - Number(issuedAt);

  if (!Number.isFinite(sessionAge) || sessionAge < 0 || sessionAge > maxAgeMs) {
    return false;
  }

  return safeEqual(signature, sign(issuedAt));
}

export function isAdminRequest(request: Request) {
  const token = process.env.ADMIN_EXPORT_TOKEN || process.env.ADMIN_PASSWORD;
  const providedToken = request.headers.get("x-admin-token");
  const cookieSession = cookies().get(cookieName)?.value;

  return Boolean(
    (token && providedToken && safeEqual(providedToken, token)) || isValidAdminSession(cookieSession)
  );
}

export function setAdminSessionCookie(session: string) {
  cookies().set(cookieName, session, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/"
  });
}

export function clearAdminSessionCookie() {
  cookies().set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
}
