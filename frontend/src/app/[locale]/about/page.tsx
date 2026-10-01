import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompanyContacts } from "@/components/company-contacts";
import { ConsultationForm } from "@/components/consultation-form";
import { companyProfile, publicAdvisers } from "@/data/company-profile";
import { isLocale, words } from "@/lib/site";

export default async function About({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <main id="main" className="company-page">
    <section className="company-hero" aria-labelledby="company-page-title">
      <div className="company-hero-media" aria-hidden="true">
        <Image className="company-hero-photo" src="/brand/udajo-office.webp" alt="" fill priority sizes="(max-width: 760px) 100vw, 900px" />
      </div>
      <div className="container company-hero-content">
        <p className="section-label">{words(locale, "关于洋豆角", "About UDAJO")}</p>
        <h1 id="company-page-title">{words(locale, "让留学变得更简单", "Making study abroad simpler")}</h1>
        <p className="page-intro">{words(locale, "洋豆角提供语言培训、留学规划与申请、抵达支持、课程辅导和海外安全指导，覆盖留学全周期。", "UDAJO supports every stage of studying abroad, from language training and applications to arrival, tutoring, and personal safety guidance.")}</p>
      </div>
    </section>

    <div className="container company-page-content">
      <section className="company-overview brand-profile" aria-labelledby="company-identity-heading">
        <div><p className="section-label">{words(locale, "品牌简介", "Brand profile")}</p><h2 id="company-identity-heading">{words(locale, "让留学变得更简单", "Making study abroad simpler")}</h2><p>{words(locale, "“洋”代表跨越海洋、走向世界，“豆角”象征绿色而充满活力的新生命。洋豆角希望每一位漂洋过海的留学生，都能在新的土壤中茁壮成长。", "Our name combines crossing oceans with the vitality of new green growth. UDAJO helps every international student settle, grow, and thrive in a new environment.")}</p></div>
        <dl className="brand-principles">
          <div><dt>{words(locale, "品牌使命", "Mission")}</dt><dd>{words(locale, "让留学变得更简单。", "Make studying abroad simpler.")}</dd></div>
          <div><dt>{words(locale, "品牌愿景", "Vision")}</dt><dd>{words(locale, "成为服务全球留学生的领先平台。", "Become a leading service platform for international students worldwide.")}</dd></div>
          <div><dt>{words(locale, "品牌价值观", "Values")}</dt><dd>{words(locale, "专业、创新、高标准、可信赖。", "Professional, innovative, committed to high standards, and trustworthy.")}</dd></div>
        </dl>
      </section>

      <section className="company-registration" aria-labelledby="company-registration-heading">
        <div><p className="section-label">{words(locale, "公司资料", "Company details")}</p><h2 id="company-registration-heading">{words(locale, "已确认的公司信息", "Verified company information")}</h2><p className="company-registration-intro">{words(locale, "公开展示清晰、可核实的公司资料，让每一次咨询更安心。", "Clear, verifiable company details help you enquire with confidence.")}</p></div>
        <dl className="company-facts"><div><dt>{words(locale, "注册名称", "Registered name")}</dt><dd>{companyProfile.legalNameZh}</dd></div><div><dt>{words(locale, "注册编号", "Registration number")}</dt><dd>{companyProfile.registrationNumber}</dd></div><div><dt>{words(locale, "办公地址", "Office locations")}</dt><dd><Link href={companyProfile.addressSourceUrl} target="_blank" rel="noreferrer">{words(locale, "查看办公地址资料", "View office location information")}</Link></dd></div></dl>
      </section>

      <div id="enquiry" className="about-enquiry" aria-labelledby="about-enquiry-heading">
        <div className="section-heading"><p className="section-label">{words(locale, "联系顾问", "Contact an adviser")}</p><h2 id="about-enquiry-heading">{words(locale, "定制你的留学方案", "Plan your study-abroad journey")}</h2><p>{words(locale, "告诉我们你的学习方向和目标院校，或直接选择下方顾问联系。", "Tell us about your study interests and intended universities, or contact one of the advisers below.")}</p></div>
        <div className="detail-layout about-enquiry-layout"><section className="about-enquiry-form"><h3>{words(locale, "咨询资料", "Enquiry details")}</h3><ConsultationForm locale={locale} /></section><aside className="detail-aside consultation-arrangement"><h3>{words(locale, "咨询安排", "Enquiry arrangements")}</h3><dl><div><dt>{words(locale, "预计回复", "Expected reply")}</dt><dd>{words(locale, companyProfile.responseTime.zh, companyProfile.responseTime.en)}</dd></div><div><dt>{words(locale, "联系邮箱", "Contact email")}</dt><dd><a href={`mailto:${companyProfile.publicEmail}`}>{companyProfile.publicEmail}</a></dd></div><div><dt>{words(locale, "官方域名", "Official domain")}</dt><dd>{companyProfile.domain}</dd></div></dl><p>{words(locale, "提交后请保存查询编号；如在线提交暂不可用，也可通过以上邮箱联系顾问。", "Keep your reference number after submitting. If online submission is temporarily unavailable, contact an adviser using the email above.")}</p></aside></div>
        <CompanyContacts locale={locale} advisers={publicAdvisers} title={words(locale, "直接联系顾问", "Contact an adviser directly")} introduction={words(locale, "可根据所在地区选择联系人。", "Choose a contact based on your region.")} />
      </div>
    </div>
  </main>;
}
