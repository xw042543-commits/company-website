import { requestInternalApi } from "./internal-api-request.ts";

export type SessionAccess = { authenticated: boolean; adviser: boolean; admin?: boolean };

export async function loadSessionAccess(
  apiBaseUrl: string | undefined, cookieHeader: string | null | undefined,
  request: typeof fetch = fetch, clientAddress?: string | null,
): Promise<SessionAccess> {
  const payload = await sessionPayload(apiBaseUrl, cookieHeader, request, clientAddress);
  // Authorization requires every known capability field, while allowing future
  // backend releases to add fields without breaking an already-open frontend.
  if (!payload
    || !["admin", "adviser", "authenticated", "fullName", "userId"]
      .every((key) => Object.prototype.hasOwnProperty.call(payload, key))
    || typeof payload.authenticated !== "boolean" || typeof payload.adviser !== "boolean" || typeof payload.admin !== "boolean"
    || payload.authenticated !== true
    || typeof payload.userId !== "number" || !Number.isSafeInteger(payload.userId) || payload.userId <= 0
    || typeof payload.fullName !== "string" || !payload.fullName.trim()) {
    return { authenticated: false, adviser: false, admin: false };
  }
  return { authenticated: true, adviser: payload.adviser, admin: payload.admin };
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
