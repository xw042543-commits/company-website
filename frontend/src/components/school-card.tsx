import Link from "next/link";
import type { SchoolSummary } from "@/lib/universities";
import { Locale, words } from "@/lib/site";

export function SchoolCard({ locale, school }: { locale: Locale; school?: SchoolSummary }) {
  const missing = words(locale, "请咨询", "Please enquire");
  const courses = school?.matchedCourses?.slice(0, 3) ?? [];

  return <article className="school-card">
    <div className="school-image" aria-hidden="true"><span>{words(locale, "院校", "University")}</span></div>
    <div className="school-content">
      {!school && <p className="section-label">{words(locale, "展示格式，不代表真实院校资料", "Example format, not a university record")}</p>}
      <h3>{school?.name ?? words(locale, "院校名称", "University name")}</h3>
      <p className="muted">{school?.country || words(locale, "国家", "Country")} · {school?.city || (school ? missing : words(locale, "城市", "City"))}</p>
      <h4>{words(locale, "匹配课程", "Matching courses")}</h4>
      {courses.length ? <ul className="course-list">{courses.map(course => <li key={course.id}><strong>{course.name}</strong><span>{words(locale, "学历层次", "Qualification")}: {course.level || missing}<br />{words(locale, "授课语言", "Teaching language")}: {course.language || missing}</span></li>)}</ul> : school ? <p className="muted">{words(locale, "课程资料请咨询顾问。", "Please enquire for course information.")}</p> : <ul className="course-list"><li><strong>{words(locale, "课程资料", "Course information")}</strong><span>{words(locale, "资料接入后将在此显示。", "Information will appear here when connected.")}</span></li></ul>}
      <Link className="button secondary" href={`/${locale}/universities/${school ? encodeURIComponent(school.slug) : "preview"}`}>{words(locale, "查看详情", "View details")} <span aria-hidden="true">→</span></Link>
    </div>
  </article>;
}
