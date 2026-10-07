import type { ConsultationStatus } from "./adviser-consultation-api.ts";

export type ConsultationFilters = { query: string; status: ConsultationStatus | ""; page: number };
export function readConsultationFilters(params: URLSearchParams): ConsultationFilters {
  const rawPage = params.get("page") ?? "1";
  const page = /^[1-9]\d*$/.test(rawPage) ? Number(rawPage) : 1;
  const rawStatus = params.get("status");
  return {
    query: (params.get("query") ?? "").trim().slice(0, 100),
    status: rawStatus === "NEW" || rawStatus === "IN_PROGRESS" || rawStatus === "COMPLETED" ? rawStatus : "",
    page: Number.isSafeInteger(page) && (page - 1) * 20 <= 2147483647 ? page : 1,
  };
}
export function consultationQuery(filters: ConsultationFilters, change: Partial<ConsultationFilters>): string {
  const next = { ...filters, ...change };
  if (change.query !== undefined || change.status !== undefined) next.page = 1;
  const params = new URLSearchParams();
  if (next.query.trim()) params.set("query", next.query.trim());
  if (next.status) params.set("status", next.status);
  params.set("page", String(next.page));
  return params.toString();
}
export function createLatestRequest() {
  let controller: AbortController | null = null;
  return {
    start() {
      controller?.abort();
      const current = new AbortController();
      controller = current;
      return { signal: current.signal, isCurrent: () => controller === current && !current.signal.aborted };
    },
    cancel() { controller?.abort(); controller = null; },
  };
}
export function abortableRequest(signal: AbortSignal, request: typeof fetch = fetch): typeof fetch {
  return (url, options) => request(url, {
    ...options,
    signal: options?.signal ? AbortSignal.any([signal, options.signal]) : signal,
  });
}
