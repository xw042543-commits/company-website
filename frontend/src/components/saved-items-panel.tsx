"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readSavedItems, SAVED_ITEMS_EVENT, updateSavedItemPlan, writeSavedItems, type SavedItem } from "@/lib/saved-items";
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
  const updatePlan = (item: SavedItem, stage: NonNullable<SavedItem["plan"]>["stage"], targetIntake = item.plan?.targetIntake ?? "") => {
    setItems(updateSavedItemPlan(item.key, { stage, ...(targetIntake.trim() ? { targetIntake: targetIntake.trim().slice(0, 80) } : {}) }));
  };
  const activePlanning = programmes.filter((item) => item.plan?.stage && item.plan.stage !== "exploring").length;

  return <section className="account-section saved-items-section" aria-labelledby="saved-items-title">
    <div className="saved-items-heading"><div><p className="section-label">{words(locale, "你的留学清单", "Your study shortlist")}</p><h2 id="saved-items-title">{words(locale, "已收藏项目", "Saved items")}</h2></div><span>{items.length}</span></div>
    <p>{words(locale, "收藏的院校和课程会保存在此浏览器中。为课程标记准备阶段和目标入学时间，回来后可以继续跟进。", "Saved universities and programmes stay in this browser. Add a planning stage and intended intake so you can continue where you left off.")}</p>
    {items.length > 0 && <dl className="shortlist-summary"><div><dt>{words(locale, "收藏项目", "Saved")}</dt><dd>{items.length}</dd></div><div><dt>{words(locale, "正在准备", "In planning")}</dt><dd>{activePlanning}</dd></div><div><dt>{words(locale, "课程", "Programmes")}</dt><dd>{programmes.length}</dd></div></dl>}
    {!items.length ? <div className="saved-items-empty"><strong>{words(locale, "你的清单还是空的", "Your shortlist is empty")}</strong><p>{words(locale, "浏览院校和课程时，点击收藏即可加入。", "Use the save button while browsing universities and programmes.")}</p><Link className="button" href={`/${locale}/universities`}>{words(locale, "浏览院校", "Browse universities")}</Link></div> : <div className="saved-items-groups">
      <SavedGroup locale={locale} title={words(locale, "院校", "Universities")} items={universities} onRemove={remove} onPlanChange={updatePlan} />
      <SavedGroup locale={locale} title={words(locale, "课程", "Programmes")} items={programmes} onRemove={remove} onPlanChange={updatePlan} />
    </div>}
  </section>;
}

function SavedGroup({ locale, title, items, onRemove, onPlanChange }: { locale: Locale; title: string; items: SavedItem[]; onRemove: (key: string) => void; onPlanChange: (item: SavedItem, stage: NonNullable<SavedItem["plan"]>["stage"], targetIntake?: string) => void }) {
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
      {item.kind === "programme" && <div className="saved-plan-fields">
        <label><span>{words(locale, "准备阶段", "Planning stage")}</span><select value={item.plan?.stage ?? "exploring"} onChange={(event) => onPlanChange(item, event.target.value as NonNullable<SavedItem["plan"]>["stage"])}>
          <option value="exploring">{words(locale, "正在了解", "Exploring")}</option>
          <option value="checking">{words(locale, "核对条件", "Checking requirements")}</option>
          <option value="ready">{words(locale, "准备材料", "Preparing documents")}</option>
          <option value="contacted">{words(locale, "已联系顾问", "Adviser contacted")}</option>
        </select></label>
        <label><span>{words(locale, "目标入学时间", "Intended intake")}</span><input type="text" maxLength={80} defaultValue={item.plan?.targetIntake ?? ""} placeholder={words(locale, "例如：2027年9月", "For example, September 2027")} onBlur={(event) => onPlanChange(item, item.plan?.stage ?? "exploring", event.target.value)} /></label>
      </div>}
      <div className="saved-item-actions"><Link href={path}>{words(locale, "查看", "View")} <span aria-hidden="true">→</span></Link><button type="button" onClick={() => onRemove(item.key)}>{words(locale, "移除", "Remove")}</button></div>
    </article>;
  })}</div></div>;
}

function containsChinese(value: string) {
  return /[\u3400-\u9fff]/.test(value);
}
