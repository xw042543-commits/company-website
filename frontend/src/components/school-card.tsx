import Image from "next/image";
import Link from "next/link";

import type { SchoolSummary } from "@/lib/universities";
import { Locale, words } from "@/lib/site";

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 3).map((part) => part[0]).join("").toUpperCase();
}

export function SchoolCard({ locale, school }: { locale: Locale; school?: SchoolSummary }) {
  const missing = words(locale, "请咨询", "Please enquire");
  const courses = school?.matchedCourses?.slice(0, 3) ?? [];
  const name = school ? (locale === "zh" ? school.nameZh ?? school.name : school.nameEn ?? school.name) : words(locale, "院校名称", "University name");
  const secondaryName = school ? (locale === "zh" ? school.nameEn : school.nameZh) : undefined;
  const country = school ? (locale === "zh" ? school.countryZh ?? school.country : school.countryEn ?? school.country) : words(locale, "国家", "Country");
  const city = school ? (locale === "zh" ? school.cityZh ?? school.city : school.cityEn ?? school.city) : undefined;

  const detailHref = `/${locale}/universities/${school ? encodeURIComponent(school.slug) : "preview"}`;

  return <Link className="school-card-link" href={detailHref}><article className="school-card">
    <div className="school-image">
      {school?.logoSrc
        ? <Image src={school.logoSrc} width={320} height={180} sizes="(max-width: 520px) 100vw, 150px" alt={words(locale, `${name} 标志`, `${name} logo`)} />
        : <span aria-hidden="true">{initials(name)}</span>}
    </div>
    <div className="school-content">
      {!school && <p className="section-label">{words(locale, "展示格式，不代表真实院校资料", "Example format, not a university record")}</p>}
      <h3>{name}</h3>
      {secondaryName && secondaryName !== name && <p className="school-secondary-name">{secondaryName}</p>}
      <p className="muted">{country}{city ? ` · ${city}` : school ? ` · ${missing}` : ` · ${words(locale, "城市", "City")}`}</p>
      {courses.length ? <><h4>{words(locale, "匹配课程", "Matching courses")}</h4><ul className="course-list">{courses.map(course => <li key={course.id}><strong>{course.name}</strong><span>{words(locale, "学历层次", "Qualification")}: {course.level || missing}<br />{words(locale, "授课语言", "Teaching language")}: {course.language || missing}</span></li>)}</ul></> : school ? <p className="programme-status"><strong>{words(locale, "专业资料整理中", "Programme details in review")}</strong> {words(locale, "可先向顾问了解课程与申请安排。", "Ask an adviser about courses and applications.")}</p> : <ul className="course-list"><li><strong>{words(locale, "课程资料", "Course information")}</strong><span>{words(locale, "资料接入后将在此显示。", "Information will appear here when connected.")}</span></li></ul>}
      <span className="school-card-action">{words(locale, "查看院校详情", "View university details")} <span aria-hidden="true">→</span></span>
    </div>
  </article></Link>;
}
