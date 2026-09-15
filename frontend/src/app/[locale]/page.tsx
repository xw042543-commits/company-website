import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, words } from "@/lib/site";
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const benefits = [
    ["在线查", "Search online", "通过简单的在线查询可以快速选到自己想要的专业", "Find your preferred course with a simple online search."],
    ["内容全", "Comprehensive information", "全面、详细的院校信息，一目了然", "Explore comprehensive, detailed university information at a glance."],
    ["信息真", "Reliable information", "绝不提供虚假信息给到留学生", "We do not provide false information to students."],
    ["可信赖", "A platform you can trust", "可依赖的在线申请平台", "An online application platform you can rely on."],
  ];
  const steps = [["在线查询专业", "Search for a course"], ["扫码联系老师", "Scan to contact an adviser"], ["准备及申请", "Prepare and apply"], ["Offer获取", "Receive an offer"], ["入学上课", "Start your studies"]];
  return <main id="main">
    <section className="hero"><div className="container hero-grid"><div>
      <p className="eyebrow">{words(locale, "留学规划", "STUDY ABROAD")}</p>
      <h1>{words(locale, "洋豆角-第一家全球数字化留学平台", "Yangdoujiao — the first global digital study abroad platform")}</h1>
      <form action={`/${locale}/planning`} className="home-search">
        <label htmlFor="home-keyword">{words(locale, "专业关键词", "Course keyword")}</label>
        <div className="search-row"><input id="home-keyword" name="q" type="search" maxLength={100} placeholder={words(locale, "输入想学习的专业", "What would you like to study?")} /><button type="submit">{words(locale, "查询专业", "Find a course")}</button></div>
      </form>
      <div className="shortcuts" aria-label={words(locale, "学习方向", "Study options")}>
        {[["foundation", "预科", "Foundation"], ["bachelor", "本科", "Bachelor’s"], ["master", "硕士", "Master’s"], ["doctorate", "博士", "Doctorate"], ["mba", "MBA", "MBA"], ["medicine", "医学", "Medicine"]].map(([key, zh, en]) => <Link key={key} href={`/${locale}/planning?${key === "mba" || key === "medicine" ? "q" : "level"}=${encodeURIComponent(key === "mba" ? "MBA" : key === "medicine" ? words(locale, "医学", "Medicine") : key)}`}>{words(locale, zh, en)} ↗</Link>)}
      </div>
    </div><div className="hero-placeholder" aria-label={words(locale, "首页主视觉占位", "Homepage visual placeholder")}><span className="placeholder-mark" aria-hidden="true">＋</span><span>{words(locale, "品牌主视觉区域", "Brand visual area")}</span><small>{words(locale, "使用经批准的品牌素材", "Approved brand artwork to be supplied")}</small></div></div></section>
    <section className="container section"><p className="eyebrow">01</p><h2>{words(locale, "为什么选择洋豆角", "Why choose Yangdoujiao")}</h2><div className="benefits">{benefits.map(([zh, en, bodyZh, bodyEn], i) => <article key={zh}><span className="step-number">0{i + 1}</span><h3>{words(locale, zh, en)}</h3><p>{words(locale, bodyZh, bodyEn)}</p></article>)}</div></section>
    <section className="process-section"><div className="container section"><p className="eyebrow">02</p><h2>{words(locale, "申请流程", "Application process")}</h2><ol className="process">{steps.map(([zh, en], i) => <li key={zh}><span className="step-number">0{i + 1}</span><h3>{words(locale, zh, en)}</h3></li>)}</ol><Link className="button" href={`/${locale}/consultation`}>{words(locale, "咨询", "Enquire")} →</Link></div></section>
  </main>;
}
