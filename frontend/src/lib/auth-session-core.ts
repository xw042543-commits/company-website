import { requestInternalApi } from "./internal-api-request.ts";

export async function hasAuthenticatedSession(
  apiBaseUrl: string | undefined,
  cookieHeader: string | null | undefined,
  request: typeof fetch = fetch,
  clientAddress?: string | null,
): Promise<boolean> {
  if (!apiBaseUrl || !cookieHeader || typeof request !== "function") return false;

  try {
    const response = await requestInternalApi(request, `${apiBaseUrl.replace(/\/$/, "")}/api/v1/auth/session`, {
      cache: "no-store",
      headers: { Cookie: cookieHeader },
      signal: AbortSignal.timeout(5_000),
    }, clientAddress);
    if (!response.ok) return false;
    const payload: unknown = await response.json();
    return typeof payload === "object"
      && payload !== null
      && !Array.isArray(payload)
      && (payload as Record<string, unknown>).authenticated === true;
  } catch {
    return false;
  }
}
