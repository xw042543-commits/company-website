"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { safeReturnTo } from "@/lib/access-policy";
import { DEMO_SESSION_COOKIE, DEMO_SESSION_VALUE } from "@/lib/demo-session";
import type { Locale } from "@/lib/site";

export async function startDemoSession(locale: Locale, returnTo?: string) {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_SESSION_COOKIE, DEMO_SESSION_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect(safeReturnTo(returnTo, locale));
}

export async function endDemoSession(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_SESSION_COOKIE);
  redirect(`/${locale}`);
}
