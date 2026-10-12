export const CONSULTATION_HISTORY_KEY = "udajo:consultation-history";
export const CONSULTATION_HISTORY_EVENT = "udajo:consultation-history-changed";

export type ConsultationHistoryItem = {
  referenceCode: string;
  submittedAt: string;
  intendedSchool?: string;
  intendedCourse?: string;
};

export function readConsultationHistory(): ConsultationHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(CONSULTATION_HISTORY_KEY) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is ConsultationHistoryItem => Boolean(
      item && typeof item === "object"
      && typeof item.referenceCode === "string"
      && typeof item.submittedAt === "string"
      && !Number.isNaN(Date.parse(item.submittedAt)),
    )).slice(0, 8);
  } catch {
    return [];
  }
}

export function recordConsultation(item: ConsultationHistoryItem) {
  const items = [item, ...readConsultationHistory().filter((entry) => entry.referenceCode !== item.referenceCode)].slice(0, 8);
  window.localStorage.setItem(CONSULTATION_HISTORY_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent<ConsultationHistoryItem[]>(CONSULTATION_HISTORY_EVENT, { detail: items }));
  return items;
}
