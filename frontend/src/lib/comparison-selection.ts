export const COMPARISON_STORAGE_KEY = "udajo:comparison";
export const COMPARISON_EVENT = "udajo:comparison-changed";

export function readComparisonSelection() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(COMPARISON_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string").slice(0, 3) : [];
  } catch {
    return [];
  }
}

export function writeComparisonSelection(selection: string[]) {
  const next = Array.from(new Set(selection)).slice(0, 3);
  window.localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent<string[]>(COMPARISON_EVENT, { detail: next }));
  return next;
}
