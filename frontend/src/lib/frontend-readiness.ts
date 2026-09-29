import { requestInternalApi } from "./internal-api-request.ts";

export async function checkBackendReadiness(
  apiBaseUrl: string | undefined,
  request: typeof fetch = fetch,
): Promise<boolean> {
  if (!apiBaseUrl || typeof request !== "function") return false;

  try {
    const response = await requestInternalApi(
      request,
      `${apiBaseUrl.replace(/\/$/, "")}/actuator/health/readiness`,
      { cache: "no-store", signal: AbortSignal.timeout(5_000) },
    );
    if (!response.ok) return false;
    const payload: unknown = await response.json();
    return typeof payload === "object"
      && payload !== null
      && !Array.isArray(payload)
      && (payload as Record<string, unknown>).status === "UP";
  } catch {
    return false;
  }
}
