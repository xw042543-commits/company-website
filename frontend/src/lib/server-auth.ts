import "server-only";

import { cookies } from "next/headers";
import { hasAuthenticatedSession } from "./auth-session-core";
import { serverApiBaseUrl } from "./runtime-config";

export async function isRequestAuthenticated(): Promise<boolean> {
  const cookieHeader = (await cookies()).toString();
  return hasAuthenticatedSession(serverApiBaseUrl(), cookieHeader);
}
