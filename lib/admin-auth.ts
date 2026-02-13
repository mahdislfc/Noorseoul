import { createHmac } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_EMAIL_ENV = "ADMIN_EMAIL";
export const ADMIN_PASSWORD_ENV = "ADMIN_PASSWORD";

function getAdminEmail() {
  return process.env[ADMIN_EMAIL_ENV] || "";
}

function getAdminPassword() {
  return process.env[ADMIN_PASSWORD_ENV] || "";
}

export function isAdminEnvConfigured() {
  return Boolean(getAdminEmail() && getAdminPassword());
}

export function getAdminSessionToken() {
  const email = getAdminEmail();
  const password = getAdminPassword();
  if (!email || !password) return "";
  return createHmac("sha256", password).update(email).digest("hex");
}

export async function getAdminSessionCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value || "";
}

export function isAdminSessionValid(cookieValue?: string) {
  const token = getAdminSessionToken();
  if (!token) return false;
  return (cookieValue || "") === token;
}
