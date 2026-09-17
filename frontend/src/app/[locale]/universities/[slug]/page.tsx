import Link from "next/link";
import { notFound } from "next/navigation";
import { getSchools } from "@/lib/universities";
import { ResultsState } from "@/components/results-state";
import { isLocale, words } from "@/lib/site";
export default async function Detail({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const preview = slug === "preview";
  const data = preview ? null : await getSchools();
  const school = data?.status === "ready" ? data.schools.find(item => item.slug === slug) : undefined;
  if (data?.status === "ready" && !school) notFound();
  return <main id="main" className="container page-main">
    <Link className="back-link" href={`/${locale}/universities`}>← {words(locale, "院校一览", "Universities")}</Link>
    <p className="eyebrow">{words(locale, "院校详情结构预览", "UNIVERSITY DETAIL STRUCTURE")}</p>
    <h1>{school?.name ?? words(locale, "学校名称", "University name")}</h1>
    <p className="page-intro">{school?.country || words(locale, "国家", "Country")} · {words(locale, "城市信息待提供", "City information to be supplied")}</p>
    {!preview && data?.status !== "ready" && <ResultsState locale={locale} state={data?.status ?? "unconfigured"} />}
    <div className="detail-layout"><div>
      <section className="detail-section"><h2>{words(locale, "学校介绍", "About the university")}</h2><div className="detail-image">{words(locale, "院校图片区域 · 使用已授权素材", "University image area · Authorised assets only")}</div><p>{words(locale, "学校介绍待提供。请咨询。", "University information is awaiting approval. Please enquire.")}</p></section>
      <section className="detail-section"><h2>{words(locale, "专业与课程", "Courses and programmes")}</h2><p>{words(locale, "以下展示字段结构，非正式课程数据。", "The following shows the field structure, not actual course data.")}</p><dl className="course-details">{[["专业名称", "Course name"], ["专业分类", "Subject category"], ["学历层次", "Qualification"], ["授课语言", "Teaching language"], ["课程模式", "Course mode"], ["学制", "Duration"], ["入学年月", "Intake month"], ["学费与原币种", "Tuition and original currency"], ["人民币参考学费与汇率日期", "CNY reference tuition and exchange-rate date"]].map(([zh, en]) => <div key={zh}><dt>{words(locale, zh, en)}</dt><dd>{words(locale, "请咨询", "Please enquire")}</dd></div>)}</dl></section>
    </div><aside className="detail-aside"><h2>{words(locale, "咨询此院校", "Enquire about this university")}</h2><p>{words(locale, "向老师咨询学校、专业与申请安排。", "Ask an adviser about the university, courses and application process.")}</p><Link className="button full-width" href={`/${locale}/consultation`}>{words(locale, "咨询", "Enquire")} →</Link><div className="qr-placeholder">{words(locale, "咨询二维码待提供", "Enquiry QR code to be supplied")}</div></aside></div>
  </main>;
}
