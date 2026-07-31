import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "eleve_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

type SessionPayload = { expiresAt: number };

export async function isAdminAuthenticated() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? verifySessionToken(token) : false;
}

export async function requireAdminSession() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
}

export async function setAdminSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const payload = Buffer.from(JSON.stringify({ expiresAt } satisfies SessionPayload)).toString("base64url");
  const token = `${payload}.${sign(payload)}`;
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearAdminSession() {
  (await cookies()).set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 0,
  });
}

export function verifyAdminPassword(candidate: string) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || !candidate) return false;
  return safeEqual(candidate, password);
}

function verifySessionToken(token: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return false;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<SessionPayload>;
    return typeof session.expiresAt === "number" && session.expiresAt > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function sign(payload: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET não está configurada.");
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
