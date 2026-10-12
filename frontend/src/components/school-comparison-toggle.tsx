"use client";

import { useEffect, useState } from "react";
import { COMPARISON_EVENT, readComparisonSelection, writeComparisonSelection } from "@/lib/comparison-selection";
import { Locale, words } from "@/lib/site";

export function SchoolComparisonToggle({ id, locale }: { id: string; locale: Locale }) {
  const [selection, setSelection] = useState<string[]>([]);

  useEffect(() => {
    const sync = (event?: Event) => setSelection(event instanceof CustomEvent ? event.detail : readComparisonSelection());
    sync();
    window.addEventListener(COMPARISON_EVENT, sync);
    return () => window.removeEventListener(COMPARISON_EVENT, sync);
  }, []);

  const selected = selection.includes(id);
  const full = selection.length >= 3 && !selected;
  const toggle = () => setSelection(writeComparisonSelection(selected ? selection.filter((item) => item !== id) : [...selection, id]));

  return <button type="button" className={`school-compare-toggle${selected ? " selected" : ""}`} aria-pressed={selected} disabled={full} onClick={toggle}>
    {selected ? words(locale, "已加入比较", "Added to compare") : full ? words(locale, "最多比较三所", "Maximum three") : words(locale, "加入比较", "Add to compare")}
  </button>;
}
