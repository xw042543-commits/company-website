import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { companyProfile, contactTelephoneHref, publicAdvisers } from "@/data/company-profile";
import { isLocale, words } from "@/lib/site";

export default async function About({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const services = companyProfile.serviceLines.map((service) => words(locale, service.zh, service.en));
  const malaysiaContact = publicAdvisers.find((adviser) => adviser.region === "MY");

  return <main id="main" className="company-page">
    <section className="company-hero" aria-labelledby="company-page-title">
      <div className="company-hero-media" aria-hidden="true">
        <Image className="company-hero-photo" src="/brand/udajo-office.png" alt="" fill priority unoptimized sizes="(max-width: 760px) 100vw, 900px" />
      </div>
      <div className="container company-hero-content">
        <p className="section-label">{words(locale, "公司资料", "Company information")}</p>
        <h1 id="company-page-title">{words(locale, "关于洋豆角", "About UDAJO")}</h1>
        <p className="page-intro">{words(locale, "洋豆角旗下设有留学、语言与课程辅导板块，为学生提供清晰、务实的学习规划与申请协助。", "UDAJO provides practical study planning and application guidance through its study abroad, language learning, and academic tutoring services.")}</p>
      </div>
    </section>

    <div className="container company-page-content">
      <section className="company-overview" aria-labelledby="company-identity-heading">
      <div><h2 id="company-identity-heading">{words(locale, "公司信息", "Company identity")}</h2><p>{words(locale, "网站品牌名称为洋豆角，英文名称为 UDAJO。", "The public brand name is UDAJO, with the Chinese name 洋豆角.")}</p></div>
      <dl className="company-facts">
        <div><dt>{words(locale, "注册名称", "Registered name")}</dt><dd>{companyProfile.legalNameZh}</dd></div>
        <div><dt>{words(locale, "注册编号", "Registration number")}</dt><dd>{companyProfile.registrationNumber}</dd></div>
      </dl>
      </section>

      <section className="company-services" aria-labelledby="services-heading">
      <h2 id="services-heading">{words(locale, "服务板块", "Service areas")}</h2>
      <ul>{services.map((service) => <li key={service}>{service}</li>)}</ul>
      </section>

      <section className="company-contact" aria-labelledby="company-contact-heading">
      <div><p className="section-label">{words(locale, "联系与地址", "Contact and locations")}</p><h2 id="company-contact-heading">{words(locale, "联系国际项目负责人", "Contact the International Projects Lead")}</h2></div>
      {malaysiaContact && <div className="company-contact-details"><p><strong>{malaysiaContact.name}</strong><br />{words(locale, malaysiaContact.role.zh, malaysiaContact.role.en)}</p><p><a href={contactTelephoneHref(malaysiaContact)}>{malaysiaContact.phone}</a><br />{malaysiaContact.email && <a href={`mailto:${malaysiaContact.email}`}>{malaysiaContact.email}</a>}</p><Link className="text-link" href={companyProfile.addressSourceUrl} target="_blank" rel="noreferrer">{words(locale, "查看办公地址", "View office locations")} <span aria-hidden="true">↗</span></Link></div>}
      </section>
    </div>
  </main>;
}
