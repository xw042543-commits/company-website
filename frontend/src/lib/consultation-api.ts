import { getCsrfToken } from "./auth-api.ts";

export type ConsultationRequest = {
  name: string;
  contact: string;
  intendedSchool: string | null;
  intendedCourse: string | null;
  qualification: "foundation" | "bachelor" | "master" | "doctorate" | null;
  notes: string | null;
  locale: "zh" | "en";
  privacyConsent: true;
};

export type ConsultationResult =
  | { status: "submitted"; referenceCode: string; submittedAt: string }
  | { status: "validation-error" }
  | { status: "rate-limited" }
  | { status: "unavailable" }
  | { status: "error" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function apiUrl(baseUrl: string | undefined): URL | null {
  if (!baseUrl) return null;
  try {
    const parsed = new URL(baseUrl);
    if (!(["http:", "https:"] as string[]).includes(parsed.protocol)
      || parsed.username || parsed.password || parsed.search || parsed.hash) return null;
    return new URL("/api/v1/consultations", parsed.origin);
  } catch {
    return null;
  }
}

function parseSubmission(payload: unknown) {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) return null;
  const value = payload as Record<string, unknown>;
  if (Object.keys(value).sort().join(",") !== "referenceCode,submittedAt"
    || typeof value.referenceCode !== "string" || !UUID.test(value.referenceCode)
    || typeof value.submittedAt !== "string" || Number.isNaN(Date.parse(value.submittedAt))) return null;
  return { referenceCode: value.referenceCode, submittedAt: value.submittedAt };
}

export async function submitConsultation(
  baseUrl: string | undefined,
  body: ConsultationRequest,
  request: typeof fetch = fetch,
): Promise<ConsultationResult> {
  const url = apiUrl(baseUrl);
  if (!url || typeof request !== "function") return { status: "error" };
  const csrf = await getCsrfToken(baseUrl, request);
  if (csrf.status !== "ready") {
    return csrf.status === "rate-limited" ? { status: "rate-limited" } : { status: "unavailable" };
  }

  try {
    const response = await request(url, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: { "Content-Type": "application/json", [csrf.headerName]: csrf.token },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8_000),
    });
    if (response.status === 400) return { status: "validation-error" };
    if (response.status === 429) return { status: "rate-limited" };
    if (response.status === 502 || response.status === 503 || response.status === 504) return { status: "unavailable" };
    if (response.status !== 201) return { status: "error" };
    const parsed = parseSubmission(await response.json());
    return parsed ? { status: "submitted", ...parsed } : { status: "error" };
  } catch {
    return { status: "unavailable" };
  }
}
