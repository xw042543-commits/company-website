import Image from "next/image";
import { notFound } from "next/navigation";
import { ConsultationForm } from "@/components/consultation-form";
import { CHINA_ADVISERS, COMPANY_PROFILE } from "@/data/company-profile";
import { isLocale, words } from "@/lib/site";

export default async function Consultation({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <main id="main" className="container page-main consultation-page">
    <p className="section-label">{words(locale, "获得申请协助", "Get application guidance")}</p>
    <h1>{words(locale, "留学咨询", "Study abroad enquiry")}</h1>
    <p className="page-intro">{words(locale, "告诉我们你的学习方向和目标院校，或直接联系顾问了解申请步骤。", "Tell us about your study interests and intended universities, or contact an adviser directly about your next steps.")}</p>
    <div className="detail-layout consultation-layout">
      <section><h2>{words(locale, "咨询资料", "Enquiry details")}</h2><ConsultationForm locale={locale} /></section>
      <aside className="detail-aside contact-lead">
        <p className="section-label">{words(locale, "马来西亚联系", "Malaysia contact")}</p>
        <h2>{locale === "zh" ? COMPANY_PROFILE.malaysia.nameZh : COMPANY_PROFILE.malaysia.nameEn}</h2>
        <p className="contact-role">{locale === "zh" ? COMPANY_PROFILE.malaysia.roleZh : COMPANY_PROFILE.malaysia.roleEn}</p>
        <dl className="contact-details">
          <div><dt>{words(locale, "电话", "Phone")}</dt><dd><a href={`tel:${COMPANY_PROFILE.malaysia.phoneHref}`}>{COMPANY_PROFILE.malaysia.phoneDisplay}</a></dd></div>
          <div><dt>{words(locale, "邮箱", "Email")}</dt><dd><a href={`mailto:${COMPANY_PROFILE.malaysia.email}`}>{COMPANY_PROFILE.malaysia.email}</a></dd></div>
          <div><dt>{words(locale, "预计回复", "Expected reply")}</dt><dd>{locale === "zh" ? COMPANY_PROFILE.responseTimeZh : COMPANY_PROFILE.responseTimeEn}</dd></div>
        </dl>
      </aside>
    </div>
    <section className="adviser-section" aria-labelledby="china-advisers-heading">
      <div className="adviser-heading"><div><p className="section-label">{words(locale, "微信咨询", "WeChat enquiries")}</p><h2 id="china-advisers-heading">{words(locale, "中国顾问老师", "China-based advisers")}</h2></div><p>{words(locale, "扫描二维码添加顾问，或使用下方微信号与电话联系。", "Scan a QR code to add an adviser, or use the WeChat ID and phone number below.")}</p></div>
      <div className="adviser-list">{CHINA_ADVISERS.map((adviser) => <article key={adviser.id} className="adviser-contact">
        <Image src={adviser.qrSrc} width={420} height={520} sizes="(max-width: 520px) 124px, (max-width: 760px) 180px, (max-width: 980px) 29vw, 260px" alt={words(locale, `${adviser.nameZh}微信二维码`, `${adviser.nameEn} WeChat QR code`)} />
        <div><h3>{locale === "zh" ? adviser.nameZh : adviser.nameEn}</h3><p>{locale === "zh" ? adviser.roleZh : adviser.roleEn}</p><dl className="contact-details compact"><div><dt>{words(locale, "微信", "WeChat")}</dt><dd>{adviser.wechat}</dd></div><div><dt>{words(locale, "电话", "Phone")}</dt><dd><a href={`tel:${adviser.phoneHref}`}>{adviser.phoneDisplay}</a></dd></div></dl></div>
      </article>)}</div>
    </section>
  </main>;
}
