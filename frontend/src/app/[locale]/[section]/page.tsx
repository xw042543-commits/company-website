import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, navigation, words } from "@/lib/site";

const descriptions = {
  language: ["语言考试与准备资料确认后将在此发布。", "Approved language-test and preparation information will be published here."],
  scholarships: ["奖学金资格与申请资料确认后将在此发布。", "Approved scholarship eligibility and application information will be published here."],
  programmes: ["留学项目内容与报名安排确认后将在此发布。", "Approved study-abroad programme and enrolment information will be published here."],
  news: ["已审核的留学资讯将在此发布。", "Reviewed study-abroad updates will be published here."],
  about: ["公司介绍与联系资料确认后将在此发布。", "Approved company and contact information will be published here."],
} as const;

export default async function ContentSection({ params }: { params: Promise<{ locale: string; section: string }> }) {
  const { locale, section } = await params;
  if (!isLocale(locale)) notFound();
  const item = navigation.find(([path]) => path === section);
  if (!item || !(section in descriptions)) notFound();
  const description = descriptions[section as keyof typeof descriptions];

  return <main id="main" className="container page-main">
    <p className="section-label">{words(locale, "UDAJO 资讯", "UDAJO information")}</p>
    <h1>{words(locale, item[1], item[2])}</h1>
    <div className="content-state"><h2>{words(locale, "内容正在准备", "Content is being prepared")}</h2><p>{words(locale, description[0], description[1])}</p><Link className="button secondary" href={`/${locale}`}>{words(locale, "返回首页", "Return home")}</Link></div>
  </main>;
}
