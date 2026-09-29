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
        <Image className="company-hero-photo" src="/brand/udajo-office.png" alt="" fill priority unoptimized sizes="(max-width: 760px) 100vw, 900px" />
      </div>
      <div className="container company-hero-content">
        <p className="section-label">{words(locale, "关于洋豆角", "About UDAJO")}</p>
        <h1 id="company-page-title">{words(locale, "让留学变得更简单", "Making study abroad simpler")}</h1>
        <p className="page-intro">{words(locale, "洋豆角提供语言培训、留学规划与申请、海外落地、课程辅导与安全保障，覆盖留学全周期。", "UDAJO supports the full study-abroad journey through language training, planning and applications, arrival support, tutoring, and practical safeguards.")}</p>
      </div>
    </section>

    <div className="container company-page-content">
      <section className="company-overview brand-profile" aria-labelledby="company-identity-heading">
        <div><p className="section-label">{words(locale, "品牌简介", "Brand profile")}</p><h2 id="company-identity-heading">{words(locale, "一颗漂洋过海的新生命", "A new life growing across borders")}</h2><p>{words(locale, "“洋”代表海洋与留洋，“豆角”象征绿色的新生命。洋豆角希望每一位留学生都能在新的土壤中茁壮成长。", "The name joins the idea of crossing oceans with the image of new green life. UDAJO hopes every international student can grow with confidence in new surroundings.")}</p></div>
        <dl className="brand-principles">
          <div><dt>{words(locale, "品牌使命", "Mission")}</dt><dd>{words(locale, "让留学变得更简单。", "Make studying abroad simpler.")}</dd></div>
          <div><dt>{words(locale, "品牌愿景", "Vision")}</dt><dd>{words(locale, "成为服务全球留学生的第一平台。", "Become a leading platform serving international students worldwide.")}</dd></div>
          <div><dt>{words(locale, "品牌价值观", "Values")}</dt><dd>{words(locale, "专业、创新、高标准、可信赖。", "Professional, innovative, exacting, and trustworthy.")}</dd></div>
        </dl>
      </section>

      <section className="company-registration" aria-labelledby="company-registration-heading">
        <div><p className="section-label">{words(locale, "公司资料", "Company details")}</p><h2 id="company-registration-heading">{words(locale, "已确认的公司信息", "Verified company information")}</h2></div>
        <dl className="company-facts"><div><dt>{words(locale, "注册名称", "Registered name")}</dt><dd>{companyProfile.legalNameZh}</dd></div><div><dt>{words(locale, "注册编号", "Registration number")}</dt><dd>{companyProfile.registrationNumber}</dd></div><div><dt>{words(locale, "办公地址", "Office locations")}</dt><dd><Link href={companyProfile.addressSourceUrl} target="_blank" rel="noreferrer">{words(locale, "查看已提供的地址资料", "View the supplied location information")}</Link></dd></div></dl>
      </section>

      <div id="enquiry" className="about-enquiry" aria-labelledby="about-enquiry-heading">
        <div className="section-heading"><p className="section-label">{words(locale, "联系顾问", "Contact an adviser")}</p><h2 id="about-enquiry-heading">{words(locale, "定制你的留学方案", "Plan your study-abroad journey")}</h2><p>{words(locale, "告诉我们你的学习方向和目标院校，或直接选择下方顾问联系。", "Tell us about your study interests and intended universities, or contact one of the advisers below.")}</p></div>
        <div className="detail-layout about-enquiry-layout"><section className="about-enquiry-form"><h3>{words(locale, "咨询资料", "Enquiry details")}</h3><ConsultationForm locale={locale} /></section><aside className="detail-aside consultation-arrangement"><h3>{words(locale, "咨询安排", "Enquiry arrangements")}</h3><dl><div><dt>{words(locale, "预计回复", "Expected reply")}</dt><dd>{words(locale, companyProfile.responseTime.zh, companyProfile.responseTime.en)}</dd></div><div><dt>{words(locale, "联系邮箱", "Contact email")}</dt><dd><a href={`mailto:${companyProfile.publicEmail}`}>{companyProfile.publicEmail}</a></dd></div><div><dt>{words(locale, "官方域名", "Official domain")}</dt><dd>{companyProfile.domain}</dd></div></dl><p>{words(locale, "在线提交开放前，请通过已确认的联系方式咨询。", "Until online submission opens, please use the confirmed contact details.")}</p></aside></div>
        <CompanyContacts locale={locale} advisers={publicAdvisers} title={words(locale, "直接联系顾问", "Contact an adviser directly")} introduction={words(locale, "可根据所在地区选择联系人。", "Choose a contact based on your region.")} />
      </div>
    </div>
  </main>;
}
