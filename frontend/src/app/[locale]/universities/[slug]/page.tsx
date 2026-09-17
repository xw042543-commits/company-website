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
    <Link className="back-link" href={`/${locale}/universities`}><span aria-hidden="true">←</span> {words(locale, "返回院校一览", "Back to universities")}</Link>
    <p className="section-label">{words(locale, "院校资料", "University information")}</p>
    <h1>{school?.name ?? words(locale, "院校资料正在接入", "University information is being connected")}</h1>
    <p className="page-intro">{school ? `${school.country} · ${school.city || words(locale, "城市资料请咨询", "Please enquire for city information")}` : words(locale, "当前不会显示未经审核的院校或课程资料。", "Unreviewed university or course information is not displayed.")}</p>
    {!preview && data?.status !== "ready" && <ResultsState locale={locale} state={data?.status ?? "unconfigured"} />}
    <div className="detail-layout"><div>
      <section className="detail-section"><h2>{words(locale, "院校介绍", "About the university")}</h2><div className="detail-image">{words(locale, "经授权的院校图片将在此显示", "Authorised university photography will appear here")}</div><p>{words(locale, "院校介绍审核后将在此发布。如需了解详情，请咨询顾问。", "Reviewed university information will be published here. Please enquire for details.")}</p></section>
      <section className="detail-section"><h2>{words(locale, "专业与课程", "Courses and programmes")}</h2><p>{words(locale, "课程资料确认后将按以下项目提供。", "Confirmed course information will be organised under the following fields.")}</p><dl className="course-details">{[["专业名称", "Course name"], ["专业分类", "Subject category"], ["学历层次", "Qualification"], ["授课语言", "Teaching language"], ["课程模式", "Course mode"], ["学制", "Duration"], ["入学年月", "Intake month"], ["学费与原币种", "Tuition and original currency"], ["人民币参考学费与汇率日期", "CNY reference tuition and exchange-rate date"]].map(([zh, en]) => <div key={zh}><dt>{words(locale, zh, en)}</dt><dd>{words(locale, "请咨询", "Please enquire")}</dd></div>)}</dl></section>
    </div><aside className="detail-aside"><h2>{words(locale, "咨询此院校", "Enquire about this university")}</h2><p>{words(locale, "向顾问了解院校、专业与申请安排。", "Ask an adviser about the university, courses, and application process.")}</p><Link className="button full-width" href={`/${locale}/consultation`}>{words(locale, "开始咨询", "Start an enquiry")} <span aria-hidden="true">→</span></Link><div className="qr-placeholder">{words(locale, "咨询二维码确认后将在此发布", "The enquiry QR code will appear after approval")}</div></aside></div>
  </main>;
}
