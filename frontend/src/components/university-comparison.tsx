"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { UNIVERSITY_CATALOG } from "@/data/university-catalog";
import { universityProfile } from "@/data/university-profiles";
import { Locale, words } from "@/lib/site";
import { COMPARISON_EVENT, readComparisonSelection } from "@/lib/comparison-selection";

const initialSelection = ["um", "taylors", ""];

export function UniversityComparison({ locale }: { locale: Locale }) {
  const [selection, setSelection] = useState(initialSelection);
  useEffect(() => {
    const applyStored = (event?: Event) => {
      const stored = event instanceof CustomEvent ? event.detail : readComparisonSelection();
      if (stored.length >= 2) setSelection([...stored, "", ""].slice(0, 3));
    };
    applyStored();
    window.addEventListener(COMPARISON_EVENT, applyStored);
    return () => window.removeEventListener(COMPARISON_EVENT, applyStored);
  }, []);
  const selected = useMemo(() => selection.map((id) => UNIVERSITY_CATALOG.find((item) => item.id === id)).filter(Boolean), [selection]);

  const update = (index: number, value: string) => setSelection((current) => current.map((item, itemIndex) => itemIndex === index ? value : item));
  const available = (index: number, id: string) => !id || selection[index] === id || !selection.includes(id);

  const rows = [
    [words(locale, "资料状态", "Data coverage"), (id: string) => profileCoverage(id, locale)],
    [words(locale, "地点", "Location"), (id: string) => { const item = UNIVERSITY_CATALOG.find((university) => university.id === id)!; return `${locale === "zh" ? item.cityZh : item.cityEn}, ${locale === "zh" ? item.countryZh : item.countryEn}`; }],
    [words(locale, "参考学费", "Tuition guidance"), (id: string) => locale === "zh" ? universityProfile(id).tuitionZh : universityProfile(id).tuitionEn],
    [words(locale, "参考排名", "Ranking information"), (id: string) => locale === "zh" ? universityProfile(id).rankingZh : universityProfile(id).rankingEn],
    [words(locale, "学术要求", "Academic requirements"), (id: string) => locale === "zh" ? universityProfile(id).academicRequirementsZh : universityProfile(id).academicRequirementsEn],
    [words(locale, "语言要求", "Language requirements"), (id: string) => locale === "zh" ? universityProfile(id).languageRequirementsZh : universityProfile(id).languageRequirementsEn],
    [words(locale, "热门课程方向", "Popular programmes"), (id: string) => (locale === "zh" ? universityProfile(id).subjectsZh : universityProfile(id).subjectsEn).join(" · ")],
    [words(locale, "入学时间", "Intake periods"), (id: string) => locale === "zh" ? universityProfile(id).intakesZh : universityProfile(id).intakesEn],
  ] as const;

  return <section className="comparison-panel" aria-labelledby="comparison-heading">
    <div className="comparison-heading">
      <div><p className="section-label">{words(locale, "并排查看重点资料", "Compare key information")}</p><h2 id="comparison-heading">{words(locale, "比较两至三所院校", "Compare two or three universities")}</h2></div>
      <p>{words(locale, "先比较重点资料。学费、学术要求、语言要求和入学时间会按课程逐项补充，申请前请向顾问确认。", "Compare the essentials first. Programme-specific fees, academic requirements, language requirements, and intake dates will be added as they are verified.")}</p>
    </div>
    <div className="comparison-selectors">
      {selection.map((value, index) => <label key={index}><span>{words(locale, `院校 ${index + 1}${index === 2 ? "（可选）" : ""}`, `University ${index + 1}${index === 2 ? " (optional)" : ""}`)}</span><select value={value} onChange={(event) => update(index, event.target.value)}>
        {index === 2 && <option value="">{words(locale, "不选择第三所院校", "No third university")}</option>}
        {index < 2 && <option value="" disabled>{words(locale, "选择院校", "Select a university")}</option>}
        {UNIVERSITY_CATALOG.filter((item) => available(index, item.id)).map((item) => <option value={item.id} key={item.id}>{locale === "zh" ? item.nameZh : item.nameEn}</option>)}
      </select></label>)}
    </div>
    {selected.length >= 2 && <div className="comparison-table-wrap"><table className="comparison-table">
      <thead><tr><th scope="col">{words(locale, "比较项目", "Compare")}</th>{selected.map((item) => item && <th scope="col" key={item.id}>{locale === "zh" ? item.nameZh : item.nameEn}<Link href={`/${locale}/universities/${item.slug}`}>{words(locale, "查看院校", "View university")} <span aria-hidden="true">→</span></Link></th>)}</tr></thead>
      <tbody>{rows.map(([label, value]) => <tr key={label}><th scope="row">{label}</th>{selected.map((item) => item && <td key={item.id}>{value(item.id)}</td>)}</tr>)}</tbody>
    </table></div>}
    <div className="comparison-note"><span aria-hidden="true">i</span><p>{words(locale, "排名为页面所示版本的参考资料。标注“正在整理”的内容会在核实后逐项更新；申请前请以院校最新正式资料为准。", "Rankings reflect the edition shown. Information marked as being compiled will be updated after verification; check the university's latest official information before applying.")} <a href="https://www.topuniversities.com/where-to-study/asia/malaysia/top-universities-malaysia" target="_blank" rel="noreferrer">{words(locale, "排名资料来源", "Ranking source")}</a></p></div>
  </section>;
}

function profileCoverage(id: string, locale: Locale) {
  const profile = universityProfile(id);
  const fields = [
    profile.tuitionEn,
    profile.rankingEn,
    profile.academicRequirementsEn,
    profile.languageRequirementsEn,
    profile.intakesEn,
    profile.subjectsEn.join(" "),
  ];
  const pending = /under review|being compiled|vary by programme|request the current|refer to/i;
  const covered = fields.filter((value) => value.trim() && !pending.test(value)).length;
  return words(locale, `已整理 ${covered}/${fields.length} 项，申请前仍需确认`, `${covered} of ${fields.length} fields reviewed; confirm before applying`);
}
