"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { UNIVERSITY_CATALOG } from "@/data/university-catalog";
import { COMPARISON_EVENT, readComparisonSelection, writeComparisonSelection } from "@/lib/comparison-selection";
import { Locale, words } from "@/lib/site";

export function ComparisonTray({ locale, onDirectory = false }: { locale: Locale; onDirectory?: boolean }) {
  const [selection, setSelection] = useState<string[]>([]);
  useEffect(() => {
    const sync = (event?: Event) => setSelection(event instanceof CustomEvent ? event.detail : readComparisonSelection());
    sync();
    window.addEventListener(COMPARISON_EVENT, sync);
    return () => window.removeEventListener(COMPARISON_EVENT, sync);
  }, []);
  if (!selection.length) return null;

  const selected = selection.map((id) => UNIVERSITY_CATALOG.find((item) => item.id === id)).filter(Boolean);
  const remove = (id: string) => setSelection(writeComparisonSelection(selection.filter((item) => item !== id)));
  return createPortal(<aside className="comparison-tray" aria-label={words(locale, "待比较院校", "Universities selected for comparison")}>
    <div className="comparison-tray-copy"><strong>{words(locale, `已选择 ${selected.length} 所`, `${selected.length} selected`)}</strong><span>{words(locale, "最多选择三所院校", "Choose up to three universities")}</span></div>
    <div className="comparison-tray-schools">{selected.map((item) => item && <span key={item.id}>{locale === "zh" ? item.nameZh : item.nameEn}<button type="button" onClick={() => remove(item.id)} aria-label={words(locale, `移除${item.nameZh}`, `Remove ${item.nameEn}`)}>×</button></span>)}</div>
    <Link className="button" href={selected.length < 2 ? `/${locale}/universities` : onDirectory ? "#comparison-heading" : `/${locale}/universities#comparison-heading`}>{selected.length < 2 ? words(locale, "再选择一所", "Select one more") : words(locale, "开始比较", "Compare now")}</Link>
    <button type="button" className="comparison-tray-clear" onClick={() => setSelection(writeComparisonSelection([]))}>{words(locale, "清除", "Clear")}</button>
  </aside>, document.body);
}
