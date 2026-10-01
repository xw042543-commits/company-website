export const SAVED_ITEMS_KEY = "udajo:saved-items";
export const SAVED_ITEMS_EVENT = "udajo:saved-items-changed";

export type SavedItem = {
  key: string;
  kind: "university" | "programme";
  name: string;
  secondaryName?: string;
  context?: string;
  path: string;
  facts?: { label: string; value: string }[];
};

export function readSavedItems(): SavedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SAVED_ITEMS_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is SavedItem => Boolean(
      item && typeof item === "object" && typeof item.key === "string"
      && (item.kind === "university" || item.kind === "programme")
      && typeof item.name === "string" && typeof item.path === "string",
    ));
  } catch {
    return [];
  }
}

export function writeSavedItems(items: SavedItem[]) {
  const unique = Array.from(new Map(items.map((item) => [item.key, item])).values());
  window.localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(unique));
  window.dispatchEvent(new CustomEvent<SavedItem[]>(SAVED_ITEMS_EVENT, { detail: unique }));
  return unique;
}

export function toggleSavedItem(item: SavedItem) {
  const current = readSavedItems();
  return writeSavedItems(current.some((saved) => saved.key === item.key)
    ? current.filter((saved) => saved.key !== item.key)
    : [item, ...current]);
}
