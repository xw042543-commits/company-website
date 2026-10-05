import Image from "next/image";
import Link from "next/link";

import type { SchoolSummary } from "@/lib/universities";
import { LocationLabel } from "@/components/location-label";
import { SchoolComparisonToggle } from "@/components/school-comparison-toggle";
import { SaveToggle } from "@/components/save-toggle";
import { findUniversityBySlug } from "@/data/university-catalog";
import { programmeDetailPath } from "@/lib/programme-routes";
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
  const matchedProgrammeCount = school?.matchedProgrammeCount ?? courses.length;
  const courseCountLabel = locale === "zh"
    ? `${matchedProgrammeCount} 个匹配课程`
    : `${matchedProgrammeCount} matching programme${matchedProgrammeCount === 1 ? "" : "s"}`;

  const detailHref = `/${locale}/universities/${school ? encodeURIComponent(school.slug) : "preview"}`;
  const comparisonId = school ? findUniversityBySlug(school.slug)?.id ?? school.id : "";

  return <article className="school-card">
    <div className="school-logo-block">
      <div className="school-image">
        {school?.logoSrc
          ? <Image src={school.logoSrc} width={320} height={180} sizes="(max-width: 520px) 100vw, 150px" alt={words(locale, `${name} 标志`, `${name} logo`)} />
          : <span className="school-initials" aria-hidden="true">{initials(name)}</span>}
      </div>
      {school?.logoSrc && <span className="school-logo-caption" aria-hidden="true">{name}</span>}
    </div>
    <div className="school-content">
      {!school && <p className="section-label">{words(locale, "展示格式，不代表真实院校资料", "Example format, not a university record")}</p>}
      <h3>{name}</h3>
      {secondaryName && secondaryName !== name && <p className="school-secondary-name">{secondaryName}</p>}
      <p className="muted"><LocationLabel city={city || (school ? missing : words(locale, "城市", "City"))} country={country} locale={locale} /></p>
      {courses.length ? <details className="school-programme-disclosure">
        <summary><span>{courseCountLabel}</span><span className="school-programme-chevron" aria-hidden="true" /></summary>
        <ul className="course-list">{courses.map(course => <li key={course.id}><Link className="course-list-link" href={programmeDetailPath(locale, school?.slug ?? "preview", course.id)}><strong>{course.name}<span className="course-link-arrow" aria-hidden="true">→</span></strong><span>{words(locale, "学历层次", "Qualification")}: {course.level || missing}<br />{words(locale, "授课语言", "Language of instruction")}: {course.language || missing}</span></Link></li>)}</ul>
      </details> : school ? <p className="programme-status"><strong>{words(locale, "课程资料正在完善", "Programme information coming soon")}</strong> {words(locale, "你可以先向顾问了解课程与申请安排。", "In the meantime, ask an adviser about programmes and applications.")}</p> : <ul className="course-list"><li><strong>{words(locale, "课程资料", "Programme information")}</strong><span>{words(locale, "完成审核后，课程资料将在这里显示。", "Reviewed programme information will appear here.")}</span></li></ul>}
      <div className="school-card-actions"><Link className="school-card-action" href={detailHref}>{words(locale, "查看院校详情", "View university details")}</Link>{school && <div className="school-card-secondary-actions"><SaveToggle compact locale={locale} item={{ key: `university:${school.slug}`, kind: "university", name, secondaryName, context: [city, country].filter(Boolean).join(", "), path: detailHref }} /><SchoolComparisonToggle id={comparisonId} locale={locale} /></div>}</div>
    </div>
  </article>;
}
