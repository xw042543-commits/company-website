import "server-only";

import { cookies } from "next/headers";
import { hasAuthenticatedSession } from "./auth-session-core";
import { DEMO_SESSION_COOKIE } from "./demo-session";
import { serverApiBaseUrl } from "./runtime-config";

export async function isRequestAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  if (process.env.NODE_ENV !== "production" && cookieStore.get(DEMO_SESSION_COOKIE)?.value === "1") return true;
  const cookieHeader = cookieStore.toString();
  return hasAuthenticatedSession(serverApiBaseUrl(), cookieHeader);
}
