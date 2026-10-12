import { requestInternalApi } from "./internal-api-request.ts";

export type SessionAccess = { authenticated: boolean; adviser: boolean };

export async function loadSessionAccess(
  apiBaseUrl: string | undefined, cookieHeader: string | null | undefined,
  request: typeof fetch = fetch, clientAddress?: string | null,
): Promise<SessionAccess> {
  const payload = await sessionPayload(apiBaseUrl, cookieHeader, request, clientAddress);
  // Adviser authorization requires the complete current backend session contract.
  if (!payload || Object.keys(payload).sort().join(",") !== "adviser,authenticated,fullName,userId"
    || typeof payload.authenticated !== "boolean" || typeof payload.adviser !== "boolean"
    || payload.authenticated !== true
    || typeof payload.userId !== "number" || !Number.isSafeInteger(payload.userId) || payload.userId <= 0
    || typeof payload.fullName !== "string" || !payload.fullName.trim()) {
    return { authenticated: false, adviser: false };
  }
  return { authenticated: true, adviser: payload.adviser };
}

async function sessionPayload(
  apiBaseUrl: string | undefined,
  cookieHeader: string | null | undefined,
  request: typeof fetch = fetch,
  clientAddress?: string | null,
): Promise<Record<string, unknown> | null> {
  if (!apiBaseUrl || !cookieHeader || typeof request !== "function") return null;

  try {
    const response = await requestInternalApi(request, `${apiBaseUrl.replace(/\/$/, "")}/api/v1/auth/session`, {
      cache: "no-store",
      headers: { Cookie: cookieHeader },
      signal: AbortSignal.timeout(5_000),
    }, clientAddress);
    if (!response.ok) return null;
    const payload: unknown = await response.json();
    return typeof payload === "object"
      && payload !== null
      && !Array.isArray(payload)
      ? payload as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

export async function hasAuthenticatedSession(
  apiBaseUrl: string | undefined, cookieHeader: string | null | undefined,
  request: typeof fetch = fetch, clientAddress?: string | null,
): Promise<boolean> {
  // Preserve the existing boolean-only behavior of ordinary protected routes.
  return (await sessionPayload(apiBaseUrl, cookieHeader, request, clientAddress))?.authenticated === true;
}
