import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getWritePassword } from "@/lib/supabase/config";

const COOKIE_NAME = "menu_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export async function isMenuSessionValid() {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;

  if (!value) {
    return false;
  }

  const [expiresAtText, signature] = value.split(".");
  const expiresAt = Number(expiresAtText);

  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  return signaturesMatch(signature, sign(expiresAtText));
}

export async function setMenuSession() {
  const cookieStore = await cookies();
  const expiresAt = String(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  cookieStore.set(COOKIE_NAME, `${expiresAt}.${sign(expiresAt)}`, {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearMenuSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function isLoginPasswordValid(value: string) {
  const password = getWritePassword();

  if (!password) {
    return false;
  }

  return signaturesMatch(value, password);
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function getSessionSecret() {
  return process.env.MENU_SESSION_SECRET?.trim() || getWritePassword() || "menu-session";
}

function signaturesMatch(left = "", right = "") {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
