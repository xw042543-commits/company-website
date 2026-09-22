import Link from "next/link";

import { CompanyContacts } from "@/components/company-contacts";
import { companyProfile, publicAdvisers } from "@/data/company-profile";
import { Locale, words } from "@/lib/site";

export function CompanyProfilePage({ locale }: { locale: Locale }) {
  return <main id="main" className="container page-main company-page">
    <p className="section-label">{words(locale, "公司资料", "Company information")}</p>
    <h1>{words(locale, "关于洋豆角", "About UDAJO")}</h1>
    <p className="page-intro">{words(
      locale,
      "洋豆角提供留学规划、语言学习与课程辅导支持。以下为已确认的公司和联系资料。",
      "UDAJO provides study planning, language learning and tutoring support. The company and contact information below has been confirmed.",
    )}</p>

    <section className="company-overview" aria-labelledby="company-overview-title">
      <div>
        <p className="company-wordmark">{companyProfile.brandNameEn}</p>
        <h2 id="company-overview-title">{companyProfile.brandNameZh}</h2>
        <p>{words(locale, "清晰规划留学选择，一步一步走向适合你的院校。", "Clear study planning, one practical step at a time.")}</p>
      </div>
      <dl className="company-facts">
        <div><dt>{words(locale, "注册名称", "Registered name")}</dt><dd>{companyProfile.legalNameZh}</dd></div>
        <div><dt>{words(locale, "统一社会信用代码", "Registration number")}</dt><dd>{companyProfile.registrationNumber}</dd></div>
        <div><dt>{words(locale, "官方域名", "Official domain")}</dt><dd><a href={`https://${companyProfile.domain}`}>{companyProfile.domain}</a></dd></div>
        <div><dt>{words(locale, "办公地址资料", "Office location information")}</dt><dd><a href={companyProfile.addressSourceUrl} target="_blank" rel="noopener noreferrer">{words(locale, "查看提供的微信公众号链接", "View the supplied WeChat article")}</a></dd></div>
      </dl>
    </section>

    <section className="service-lines" aria-labelledby="service-lines-title">
      <p className="section-label">{words(locale, "业务方向", "What we do")}</p>
      <h2 id="service-lines-title">{words(locale, "学习与申请支持", "Study and application support")}</h2>
      <ul>{companyProfile.serviceLines.map((line) => <li key={line.en}>{words(locale, line.zh, line.en)}</li>)}</ul>
    </section>

    <CompanyContacts
      locale={locale}
      advisers={publicAdvisers}
      title={words(locale, "联系我们", "Contact us")}
      introduction={words(locale, `咨询通常会在 ${companyProfile.responseTime.zh}回复。`, `Enquiries are normally answered ${companyProfile.responseTime.en}.`)}
    />

    <div className="company-page-action"><Link className="button" href={`/${locale}/consultation`}>{words(locale, "前往咨询页", "Go to enquiry page")}</Link></div>
  </main>;
}
