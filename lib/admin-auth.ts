import { createHmac } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_EMAIL_ENV = "ADMIN_EMAIL";
export const ADMIN_PASSWORD_ENV = "ADMIN_PASSWORD";
const ADMIN_SESSION_VERSION = "v2";
const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 12;

function getAdminEmail() {
  return process.env[ADMIN_EMAIL_ENV] || "";
}

function getAdminPassword() {
  return process.env[ADMIN_PASSWORD_ENV] || "";
}

export function isAdminEnvConfigured() {
  return Boolean(getAdminEmail() && getAdminPassword());
}

function signAdminSession(expiresAt: number) {
  const email = getAdminEmail();
  const password = getAdminPassword();
  if (!email || !password) return "";
  const payload = `${email}:${expiresAt}:${ADMIN_SESSION_VERSION}`;
  return createHmac("sha256", password).update(payload).digest("hex");
}

export function createAdminSessionToken() {
  const expiresAt = Date.now() + ADMIN_SESSION_TTL_MS;
  const signature = signAdminSession(expiresAt);
  if (!signature) return "";
  return `${ADMIN_SESSION_VERSION}.${expiresAt}.${signature}`;
}

export async function getAdminSessionCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value || "";
}

export function isAdminSessionValid(cookieValue?: string) {
  const raw = (cookieValue || "").trim();
  if (!raw) return false;
  const [version, expiresAtRaw, signature] = raw.split(".");
  if (version !== ADMIN_SESSION_VERSION) return false;
  if (!expiresAtRaw || !signature) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt)) return false;
  if (Date.now() >= expiresAt) return false;

  const expected = signAdminSession(expiresAt);
  if (!expected) return false;
  return signature === expected;
}
