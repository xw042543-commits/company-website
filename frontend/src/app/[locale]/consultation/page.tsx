import { notFound } from "next/navigation";
import { CompanyContacts } from "@/components/company-contacts";
import { ConsultationForm } from "@/components/consultation-form";
import { companyProfile, publicAdvisers } from "@/data/company-profile";
import { isLocale, words } from "@/lib/site";

export default async function Consultation({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <main id="main" className="container page-main">
    <p className="section-label">{words(locale, "获得申请协助", "Get application guidance")}</p>
    <h1>{words(locale, "留学咨询", "Study abroad enquiry")}</h1>
    <p className="page-intro">{words(locale, "告诉我们你的学习方向和目标院校。线上表单正在完成隐私审核，你也可以通过下方已确认的联系方式直接咨询。", "Tell us about your study interests and intended universities. While the online form completes its privacy review, you can contact an adviser directly using the confirmed details below.")}</p>
    <div className="detail-layout"><section><h2>{words(locale, "咨询资料预览", "Enquiry details preview")}</h2><ConsultationForm locale={locale} /></section><aside className="detail-aside consultation-arrangement"><h2>{words(locale, "咨询安排", "Enquiry arrangements")}</h2><dl><div><dt>{words(locale, "预计回复", "Expected reply")}</dt><dd>{words(locale, companyProfile.responseTime.zh, companyProfile.responseTime.en)}</dd></div><div><dt>{words(locale, "联系邮箱", "Contact email")}</dt><dd><a href={`mailto:${companyProfile.publicEmail}`}>{companyProfile.publicEmail}</a></dd></div><div><dt>{words(locale, "官方域名", "Official domain")}</dt><dd>{companyProfile.domain}</dd></div></dl><p>{words(locale, "请勿在尚未开放的表单中填写真实个人资料。", "Do not enter real personal information into the form until submission opens.")}</p></aside></div>
    <CompanyContacts
      locale={locale}
      advisers={publicAdvisers}
      title={words(locale, "直接联系顾问", "Contact an adviser directly")}
      introduction={words(locale, "可根据所在地区选择联系人。", "Choose a contact based on your region.")}
    />
  </main>;
}
