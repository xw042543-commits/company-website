"use client";

import { useEffect, useState } from "react";
import { readSavedItems, SAVED_ITEMS_EVENT, toggleSavedItem, type SavedItem } from "@/lib/saved-items";
import { type Locale, words } from "@/lib/site";

export function SaveToggle({ locale, item, compact = false }: { locale: Locale; item: SavedItem; compact?: boolean }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(readSavedItems().some((candidate) => candidate.key === item.key));
    sync();
    window.addEventListener(SAVED_ITEMS_EVENT, sync);
    return () => window.removeEventListener(SAVED_ITEMS_EVENT, sync);
  }, [item.key]);

  return <button type="button" className={`save-toggle${saved ? " saved" : ""}${compact ? " compact" : ""}`} aria-pressed={saved} onClick={() => setSaved(toggleSavedItem(item).some((candidate) => candidate.key === item.key))}>
    <span aria-hidden="true">{saved ? "★" : "☆"}</span>
    {saved ? words(locale, "已收藏", "Saved") : words(locale, "收藏", "Save")}
  </button>;
}
