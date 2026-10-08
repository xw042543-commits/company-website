import type { ConsultationStatus } from "./adviser-consultation-api.ts";
import { words, type Locale } from "./site.ts";

export function consultationConflictMessage(locale: Locale, pending: boolean, failed: boolean): string {
  const conflict = words(locale, "其他顾问已更新此记录，当前修改未保存。", "This record was updated by another adviser. Your change was not saved. ");
  if (pending) return conflict + words(locale, "正在重新载入最新记录，请核对后再次更新。", "Reloading the latest record; review it before updating again.");
  if (failed) return conflict + words(locale, "未能载入最新记录，请重试载入详情后再更新。", "Could not reload the latest record. Retry loading the details before updating.");
  return conflict + words(locale, "已载入最新记录，请核对后再次更新。", "The latest record is loaded. Review it before updating again.");
}

export function contactAction(contact: string): { kind: "email" | "phone"; href: string } | null {
  const value = contact.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return { kind: "email", href: `mailto:${value}` };
  if (/^\+?[0-9][0-9 ()-]{6,20}$/.test(value)) {
    const number = `${value.startsWith("+") ? "+" : ""}${value.replace(/\D/g, "")}`;
    return { kind: "phone", href: `tel:${number}` };
  }
  return null;
}

export function consultationCollectionState(locale: Locale, enabled: boolean) {
  return enabled ? {
    tone: "active" as const,
    title: words(locale, "咨询收集已启用", "Consultation collection is active"),
    description: words(locale, "网站访客可以提交新的咨询资料。", "Website visitors can submit new enquiries."),
  } : {
    tone: "paused" as const,
    title: words(locale, "咨询收集已暂停", "Consultation collection is paused"),
    description: words(locale, "当前不会收到新咨询；已有记录仍可查看和跟进。", "New submissions are paused; existing records remain available."),
  };
}

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
