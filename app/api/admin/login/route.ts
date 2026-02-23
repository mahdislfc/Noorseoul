import { NextResponse } from "next/server";
import {
  ADMIN_EMAIL_ENV,
  ADMIN_PASSWORD_ENV,
  createAdminSessionToken,
  isAdminEnvConfigured,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAdminEnvConfigured()) {
    return NextResponse.json(
      { error: `Missing ${ADMIN_EMAIL_ENV} or ${ADMIN_PASSWORD_ENV}` },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const expectedEmail = process.env[ADMIN_EMAIL_ENV] || "";
  const expectedPassword = process.env[ADMIN_PASSWORD_ENV] || "";

  if (email !== expectedEmail || password !== expectedPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = createAdminSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}
