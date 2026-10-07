export type ConsultationStatus = "NEW" | "IN_PROGRESS" | "COMPLETED";
export type ConsultationQualification = "foundation" | "bachelor" | "master" | "doctorate";
export type AdviserConsultationSummary = {
  referenceCode: string;
  name: string;
  contact: string;
  intendedSchool: string | null;
  intendedCourse: string | null;
  qualification: ConsultationQualification | null;
  status: ConsultationStatus;
  createdAt: string;
  statusUpdatedAt: string;
  version: number;
};
export type AdviserConsultationDetail = AdviserConsultationSummary & {
  notes: string | null;
  locale: "zh" | "en";
  privacyNoticeVersion: string;
  statusUpdatedByUserId: number | null;
};
export type ConsultationStatusCounts = { newCount: number; inProgressCount: number; completedCount: number };
export type AdviserConsultationPage = {
  items: AdviserConsultationSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  counts: ConsultationStatusCounts;
};
export type ConsultationStatusUpdateResponse = {
  referenceCode: string;
  status: ConsultationStatus;
  statusUpdatedAt: string;
  statusUpdatedByUserId: number;
  version: number;
};
export type AdviserConsultationFilters = {
  page?: number | string | string[];
  size?: number | string | string[];
  status?: string | string[];
  query?: string | string[];
};
export type AdviserFailure = { status: "unauthorized" | "forbidden" | "not-found" | "conflict"
  | "validation-error" | "rate-limited" | "unavailable" | "error" };
export type AdviserListResult = { status: "ready"; page: AdviserConsultationPage } | AdviserFailure;
export type AdviserDetailResult = { status: "ready"; consultation: AdviserConsultationDetail } | AdviserFailure;
export type AdviserUpdateResult = { status: "ready"; update: ConsultationStatusUpdateResponse } | AdviserFailure;

const ROOT = "/api/v1/adviser/consultations";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const summaryKeys = ["referenceCode", "name", "contact", "intendedSchool", "intendedCourse", "qualification",
  "status", "createdAt", "statusUpdatedAt", "version"];

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function exact(value: Record<string, unknown>, keys: string[]) {
  return Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}
function integer(value: unknown, min = 0): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= min;
}
function text(value: unknown, max: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}
function optionalText(value: unknown, max: number) { return value === null || text(value, max); }
function status(value: unknown): value is ConsultationStatus {
  return value === "NEW" || value === "IN_PROGRESS" || value === "COMPLETED";
}
function uuid(value: unknown): value is string { return typeof value === "string" && UUID.test(value); }
function timestamp(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match || Number.isNaN(Date.parse(value))) return false;
  const [, y, m, d, h, minute, second, zone] = match;
  const year = Number(y), month = Number(m), day = Number(d);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1]
    && Number(h) < 24 && Number(minute) < 60 && Number(second) < 60
    && (zone === "Z" || (Number(zone.slice(1, 3)) <= 18 && Number(zone.slice(4)) < 60
      && (Number(zone.slice(1, 3)) !== 18 || Number(zone.slice(4)) === 0)));
}
function summaryFields(value: Record<string, unknown>) {
  return uuid(value.referenceCode) && text(value.name, 100) && text(value.contact, 100)
    && optionalText(value.intendedSchool, 200) && optionalText(value.intendedCourse, 200)
    && (value.qualification === null || (typeof value.qualification === "string"
      && ["foundation", "bachelor", "master", "doctorate"].includes(value.qualification)))
    && status(value.status) && timestamp(value.createdAt) && timestamp(value.statusUpdatedAt) && integer(value.version);
}
function parseSummary(value: unknown): AdviserConsultationSummary | null {
  return record(value) && exact(value, summaryKeys) && summaryFields(value) ? value as AdviserConsultationSummary : null;
}
function parsePage(value: unknown): AdviserConsultationPage | null {
  if (!record(value) || !exact(value, ["items", "page", "size", "totalElements", "totalPages", "counts"])
    || !integer(value.page) || value.page > 2147483647 || !integer(value.size, 1) || value.size > 100
    || value.page * value.size > 2147483647 || !integer(value.totalElements) || !integer(value.totalPages) || value.totalPages > 2147483647
    || value.totalPages !== Math.ceil(value.totalElements / value.size)
    || !Array.isArray(value.items) || value.items.length !== Math.min(value.size, Math.max(0, value.totalElements - value.page * value.size))
    || !value.items.every((item) => parseSummary(item) !== null)
    || !record(value.counts) || !exact(value.counts, ["newCount", "inProgressCount", "completedCount"])
    || !Object.values(value.counts).every((count) => integer(count))) return null;
  return value as AdviserConsultationPage;
}
function parseDetail(value: unknown): AdviserConsultationDetail | null {
  if (!record(value) || !exact(value, [...summaryKeys, "notes", "locale", "privacyNoticeVersion", "statusUpdatedByUserId"])
    || !summaryFields(value) || !optionalText(value.notes, 2000) || (value.locale !== "zh" && value.locale !== "en")
    || !text(value.privacyNoticeVersion, 50) || !(value.statusUpdatedByUserId === null || integer(value.statusUpdatedByUserId, 1))) return null;
  return value as AdviserConsultationDetail;
}
function parseUpdate(value: unknown): ConsultationStatusUpdateResponse | null {
  return record(value) && exact(value, ["referenceCode", "status", "statusUpdatedAt", "statusUpdatedByUserId", "version"])
    && uuid(value.referenceCode) && status(value.status) && timestamp(value.statusUpdatedAt)
    && integer(value.statusUpdatedByUserId, 1) && integer(value.version, 1) ? value as ConsultationStatusUpdateResponse : null;
}
function endpoint(baseUrl: string | undefined, path: string): URL | null {
  if (!baseUrl) return null;
  try {
    const base = new URL(baseUrl);
    if ((base.protocol !== "http:" && base.protocol !== "https:") || base.username || base.password || base.search || base.hash) return null;
    return new URL(path, base.origin);
  } catch { return null; }
}
function filtersQuery(filters: AdviserConsultationFilters | URLSearchParams): URLSearchParams | null {
  if (!(filters instanceof URLSearchParams) && !record(filters)) return null;
  const raw: Record<string, unknown> = {};
  for (const key of ["page", "size", "status", "query"]) {
    if (filters instanceof URLSearchParams) {
      const values = filters.getAll(key);
      if (values.length > 1) return null;
      raw[key] = values[0];
    } else raw[key] = filters[key as keyof AdviserConsultationFilters];
  }
  const numeric = (value: unknown, fallback: number) => value === undefined ? fallback
    : typeof value === "number" ? value
      : typeof value === "string" && /^(0|[1-9]\d*)$/.test(value) ? Number(value) : NaN;
  const page = numeric(raw.page, 0), size = numeric(raw.size, 20);
  if (!integer(page) || !integer(size, 1) || size > 100 || page * size > 2147483647
    || (raw.status !== undefined && raw.status !== "" && !status(raw.status))
    || (raw.query !== undefined && (typeof raw.query !== "string" || raw.query.trim().length > 100))) return null;
  const query = new URLSearchParams({ page: String(page), size: String(size) });
  if (status(raw.status)) query.set("status", raw.status);
  if (typeof raw.query === "string" && raw.query.trim()) query.set("query", raw.query.trim());
  return query;
}
function failure(code: number): AdviserFailure {
  const statuses: Record<number, AdviserFailure["status"]> = { 400: "validation-error", 401: "unauthorized", 403: "forbidden",
    404: "not-found", 409: "conflict", 429: "rate-limited", 502: "unavailable", 503: "unavailable", 504: "unavailable" };
  return { status: statuses[code] ?? "error" };
}
async function readJson<T>(response: Response, parse: (value: unknown) => T | null): Promise<T | null> {
  try { return parse(await response.json()); } catch { return null; }
}
async function read<T>(url: URL, parse: (value: unknown) => T | null, request: typeof fetch): Promise<{ status: "ready"; value: T } | AdviserFailure> {
  try {
    const response = await request(url, { method: "GET", cache: "no-store", credentials: "include", signal: AbortSignal.timeout(5_000) });
    if (response.status !== 200) return failure(response.status);
    const value = await readJson(response, parse);
    return value ? { status: "ready", value } : { status: "error" };
  } catch { return { status: "unavailable" }; }
}

export async function loadAdviserConsultations(baseUrl: string | undefined, filters: AdviserConsultationFilters | URLSearchParams = {},
  request: typeof fetch = fetch): Promise<AdviserListResult> {
  const url = endpoint(baseUrl, ROOT);
  if (!url || typeof request !== "function") return { status: "error" };
  const query = filtersQuery(filters);
  if (!query) return { status: "validation-error" };
  url.search = query.toString();
  const result = await read(url, parsePage, request);
  if (result.status !== "ready") return result;
  if (result.value.page !== Number(query.get("page")) || result.value.size !== Number(query.get("size"))) return { status: "error" };
  return { status: "ready", page: result.value };
}
export async function loadAdviserConsultation(baseUrl: string | undefined, referenceCode: string,
  request: typeof fetch = fetch): Promise<AdviserDetailResult> {
  const url = endpoint(baseUrl, ROOT);
  if (!url || typeof request !== "function") return { status: "error" };
  if (!uuid(referenceCode)) return { status: "validation-error" };
  url.pathname += `/${referenceCode}`;
  const result = await read(url, parseDetail, request);
  if (result.status !== "ready") return result;
  return result.value.referenceCode.toLowerCase() === referenceCode.toLowerCase()
    ? { status: "ready", consultation: result.value } : { status: "error" };
}
export async function updateAdviserConsultationStatus(baseUrl: string | undefined, referenceCode: string, nextStatus: ConsultationStatus,
  version: number, request: typeof fetch = fetch): Promise<AdviserUpdateResult> {
  const url = endpoint(baseUrl, ROOT), csrfUrl = endpoint(baseUrl, "/api/v1/auth/csrf");
  if (!url || !csrfUrl || typeof request !== "function") return { status: "error" };
  if (!uuid(referenceCode) || !status(nextStatus) || !integer(version) || version === Number.MAX_SAFE_INTEGER) return { status: "validation-error" };
  // Keep CSRF failures distinct (the generic auth client combines 401 and 403).
  const csrf = await read(csrfUrl, (value) => record(value) && exact(value, ["headerName", "token"])
    && value.headerName === "X-XSRF-TOKEN" && typeof value.token === "string" && value.token.trim()
    && !/[\x00-\x20\x7f]/.test(value.token) ? { headerName: value.headerName, token: value.token } : null, request);
  if (csrf.status !== "ready") return csrf;
  url.pathname += `/${referenceCode}/status`;
  try {
    const response = await request(url, { method: "PATCH", cache: "no-store", credentials: "include",
      headers: { "Content-Type": "application/json", [csrf.value.headerName]: csrf.value.token },
      body: JSON.stringify({ status: nextStatus, version }), signal: AbortSignal.timeout(5_000) });
    if (response.status !== 200) return failure(response.status);
    const update = await readJson(response, parseUpdate);
    if (!update || update.referenceCode.toLowerCase() !== referenceCode.toLowerCase()
      || update.status !== nextStatus || update.version !== version + 1) return { status: "error" };
    return { status: "ready", update };
  } catch { return { status: "unavailable" }; }
}
