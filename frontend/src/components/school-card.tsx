import Link from "next/link";
import type { SchoolSummary } from "@/lib/universities";
import { Locale, words } from "@/lib/site";

export function SchoolCard({ locale, school }: { locale: Locale; school?: SchoolSummary }) {
  const missing = words(locale, "请咨询", "Please enquire");
  const courses = school?.matchedCourses?.slice(0, 3) ?? [];
  return <article className="school-card">
    <div className="school-image" aria-hidden="true"><span>＋</span></div>
    <div className="school-content">
      {!school && <p className="eyebrow">{words(locale, "卡片结构示例 · 非院校资料", "CARD STRUCTURE · NOT A SCHOOL RECORD")}</p>}
      <h3>{school?.name ?? words(locale, "学校名称", "University name")}</h3>
      <p className="muted">{school?.country || words(locale, "国家", "Country")} · {school?.city || (school ? missing : words(locale, "城市", "City"))}</p>
      <h4>{words(locale, "匹配专业", "Matching courses")}</h4>
      {courses.length ? <ul className="course-list">{courses.map(course => <li key={course.id}><strong>{course.name}</strong><span>{words(locale, "学历层次", "Qualification")}: {course.level || missing} · {words(locale, "授课语言", "Teaching language")}: {course.language || missing}</span></li>)}</ul> : school ? <p>{missing}</p> : <ul className="course-list">{[1, 2, 3].map(i => <li key={i}><strong>{words(locale, "匹配专业", "Matching course")} {i}</strong><span>{words(locale, "学历层次 · 授课语言", "Qualification · Teaching language")}</span></li>)}</ul>}
      <Link className="button secondary" href={`/${locale}/universities/${school ? encodeURIComponent(school.slug) : "preview"}`}>{words(locale, "查看详情", "View details")} →</Link>
    </div>
  </article>;
}
