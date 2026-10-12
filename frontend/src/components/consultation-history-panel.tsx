"use client";

import { useEffect, useState } from "react";

import {
  CONSULTATION_HISTORY_EVENT,
  readConsultationHistory,
  type ConsultationHistoryItem,
} from "@/lib/consultation-history";
import { type Locale, words } from "@/lib/site";

export function ConsultationHistoryPanel({ locale }: { locale: Locale }) {
  const [items, setItems] = useState<ConsultationHistoryItem[]>([]);

  useEffect(() => {
    const sync = (event?: Event) => setItems(event instanceof CustomEvent ? event.detail : readConsultationHistory());
    sync();
    window.addEventListener(CONSULTATION_HISTORY_EVENT, sync);
    return () => window.removeEventListener(CONSULTATION_HISTORY_EVENT, sync);
  }, []);

  if (!items.length) return null;

  return <section className="account-section consultation-history" aria-labelledby="consultation-history-title">
    <div className="account-section-heading">
      <div><p className="section-label">{words(locale, "咨询记录", "Enquiry history")}</p><h2 id="consultation-history-title">{words(locale, "最近提交的咨询", "Recent enquiries")}</h2></div>
      <span>{items.length}</span>
    </div>
    <p>{words(locale, "这些查询编号只保存在当前浏览器中。需要跟进时，请向顾问提供查询编号。", "These reference numbers are stored only in this browser. Share the reference with an adviser when following up.")}</p>
    <ol>{items.map((item) => <li key={item.referenceCode}>
      <div><strong>{item.intendedCourse || item.intendedSchool || words(locale, "留学咨询", "Study enquiry")}</strong>{item.intendedCourse && item.intendedSchool ? <span>{item.intendedSchool}</span> : null}</div>
      <div><code>{item.referenceCode}</code><time dateTime={item.submittedAt}>{new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-GB", { dateStyle: "medium" }).format(new Date(item.submittedAt))}</time></div>
    </li>)}</ol>
  </section>;
}
