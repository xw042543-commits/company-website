"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readSavedItems, SAVED_ITEMS_EVENT, writeSavedItems, type SavedItem } from "@/lib/saved-items";
import { type Locale, words } from "@/lib/site";

export function SavedItemsPanel({ locale }: { locale: Locale }) {
  const [items, setItems] = useState<SavedItem[]>([]);
  useEffect(() => {
    const sync = (event?: Event) => setItems(event instanceof CustomEvent ? event.detail : readSavedItems());
    sync();
    window.addEventListener(SAVED_ITEMS_EVENT, sync);
    return () => window.removeEventListener(SAVED_ITEMS_EVENT, sync);
  }, []);

  const universities = items.filter((item) => item.kind === "university");
  const programmes = items.filter((item) => item.kind === "programme");
  const remove = (key: string) => setItems(writeSavedItems(items.filter((item) => item.key !== key)));

  return <section className="account-section saved-items-section" aria-labelledby="saved-items-title">
    <div className="saved-items-heading"><div><p className="section-label">{words(locale, "你的留学清单", "Your study shortlist")}</p><h2 id="saved-items-title">{words(locale, "已收藏项目", "Saved items")}</h2></div><span>{items.length}</span></div>
    <p>{words(locale, "收藏的院校和课程会保存在此浏览器中，方便你回来继续比较。", "Saved universities and programmes stay in this browser so you can return and continue comparing.")}</p>
    {!items.length ? <div className="saved-items-empty"><strong>{words(locale, "你的清单还是空的", "Your shortlist is empty")}</strong><p>{words(locale, "浏览院校和课程时，点击收藏即可加入。", "Use the save button while browsing universities and programmes.")}</p><Link className="button" href={`/${locale}/universities`}>{words(locale, "浏览院校", "Browse universities")}</Link></div> : <div className="saved-items-groups">
      <SavedGroup locale={locale} title={words(locale, "院校", "Universities")} items={universities} onRemove={remove} />
      <SavedGroup locale={locale} title={words(locale, "课程", "Programmes")} items={programmes} onRemove={remove} />
    </div>}
  </section>;
}

function SavedGroup({ locale, title, items, onRemove }: { locale: Locale; title: string; items: SavedItem[]; onRemove: (key: string) => void }) {
  if (!items.length) return null;
  return <div className="saved-items-group"><h3>{title}<span>{items.length}</span></h3><div className="saved-items-list">{items.map((item) => {
    const englishName = locale === "en" && item.secondaryName && !containsChinese(item.secondaryName)
      ? item.secondaryName
      : item.name;
    const secondaryName = locale === "zh" ? item.secondaryName : undefined;
    const context = locale === "en" && item.context && containsChinese(item.context) ? undefined : item.context;
    const facts = locale === "en"
      ? item.facts?.filter((fact) => !containsChinese(fact.label) && !containsChinese(fact.value))
      : item.facts;
    const path = item.path.replace(/^\/(?:zh|en)(?=\/|$)/, `/${locale}`);

    return <article key={item.key}>
      <div><Link href={path}><strong>{englishName}</strong></Link>{secondaryName && <span>{secondaryName}</span>}{context && <p>{context}</p>}</div>
      {facts?.length ? <dl>{facts.slice(0, 3).map((fact) => <div key={`${fact.label}:${fact.value}`}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl> : null}
      <div className="saved-item-actions"><Link href={path}>{words(locale, "查看", "View")} <span aria-hidden="true">→</span></Link><button type="button" onClick={() => onRemove(item.key)}>{words(locale, "移除", "Remove")}</button></div>
    </article>;
  })}</div></div>;
}

function containsChinese(value: string) {
  return /[\u3400-\u9fff]/.test(value);
}
