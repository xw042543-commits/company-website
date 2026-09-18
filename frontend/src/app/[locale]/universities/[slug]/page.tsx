import Image from "next/image";
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

  const name = school ? (locale === "zh" ? school.nameZh ?? school.name : school.nameEn ?? school.name) : words(locale, "院校资料正在接入", "University information is being connected");
  const secondaryName = school ? (locale === "zh" ? school.nameEn : school.nameZh) : undefined;
  const country = school ? (locale === "zh" ? school.countryZh ?? school.country : school.countryEn ?? school.country) : undefined;
  const city = school ? (locale === "zh" ? school.cityZh ?? school.city : school.cityEn ?? school.city) : undefined;

  return <main id="main" className="container page-main">
    <Link className="back-link" href={`/${locale}/universities`}><span aria-hidden="true">←</span> {words(locale, "返回院校一览", "Back to universities")}</Link>
    <p className="section-label">{words(locale, "院校资料", "University information")}</p>
    <h1>{name}</h1>
    {secondaryName && secondaryName !== name && <p className="detail-secondary-name">{secondaryName}</p>}
    <p className="page-intro">{school ? `${country} · ${city || words(locale, "城市资料请咨询", "Please enquire for city information")}` : words(locale, "当前不会显示未经审核的院校或课程资料。", "Unreviewed university or course information is not displayed.")}</p>
    {!preview && data?.status !== "ready" && <ResultsState locale={locale} state={data?.status ?? "error"} />}
    <div className="detail-layout"><div>
      <section className="detail-section"><h2>{words(locale, "院校资料", "University profile")}</h2><div className="detail-image university-logo-panel">{school?.logoSrc ? <Image src={school.logoSrc} width={640} height={320} sizes="(max-width: 760px) 100vw, 640px" alt={words(locale, `${name} 标志`, `${name} logo`)} priority /> : <span>{words(locale, "院校标志资料待补充", "University logo pending")}</span>}</div><p>{words(locale, "院校介绍正在审核整理中。如需了解校区与申请信息，请咨询顾问。", "The reviewed university introduction is being prepared. Please ask an adviser about campuses and applications.")}</p></section>
      <section className="detail-section programme-pending-section"><p className="section-label">{words(locale, "资料状态", "Information status")}</p><h2>{words(locale, "专业资料即将上线", "Programme information coming soon")}</h2><p>{words(locale, "课程名称、入学月份、学制与学费将在完成审核后发布。现阶段可联系顾问获取最新资料。", "Course names, intakes, duration, and tuition will be published after review. Contact an adviser for the latest information in the meantime.")}</p></section>
    </div><aside className="detail-aside"><h2>{words(locale, "咨询此院校", "Enquire about this university")}</h2><p>{words(locale, "向顾问了解院校、专业与申请安排。", "Ask an adviser about the university, courses, and application process.")}</p><Link className="button full-width" href={`/${locale}/consultation`}>{words(locale, "开始咨询", "Start an enquiry")} <span aria-hidden="true">→</span></Link><div className="qr-placeholder">{words(locale, "咨询二维码确认后将在此发布", "The enquiry QR code will appear after approval")}</div></aside></div>
  </main>;
}
