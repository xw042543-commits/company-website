import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, words } from "@/lib/site";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const benefits = [
    ["快速查找", "Focused search", "按学习方向快速缩小选择范围。", "Narrow your options by study direction."],
    ["清晰资料", "Clear information", "在一个地方比较院校与课程重点。", "Compare key university and course information in one place."],
    ["真实来源", "Reliable sources", "重要资料以已审核内容为准。", "Important information is presented from reviewed sources."],
    ["专业协助", "Practical guidance", "需要时可联系顾问了解申请步骤。", "Contact an adviser when you need help with application steps."],
  ] as const;
  const steps = [["在线查询专业", "Search for a course"], ["扫码联系老师", "Contact an adviser"], ["准备及申请", "Prepare and apply"], ["获取录取通知", "Receive an offer"], ["入学上课", "Start your studies"]] as const;

  return <main id="main">
    <section className="hero"><div className="container hero-grid">
      <div className="hero-copy">
        <p className="section-label">{words(locale, "留学规划与院校查询", "Study planning and university search")}</p>
        <h1>{words(locale, "找到适合你的院校，规划下一步留学之路。", "Find the right university and plan your next step abroad.")}</h1>
        <p className="hero-intro">{words(locale, "从专业方向开始筛选院校，在需要时获得清晰的申请协助。", "Start with your study interests, compare universities, and get clear application guidance when you need it.")}</p>
        <form action={`/${locale}/planning`} className="home-search">
          <label htmlFor="home-keyword">{words(locale, "专业关键词", "Course keyword")}</label>
          <div className="search-row"><input id="home-keyword" name="q" type="search" maxLength={100} placeholder={words(locale, "输入想学习的专业", "What would you like to study?")} /><button type="submit">{words(locale, "查询专业", "Find a course")}</button></div>
        </form>
        <Link className="text-link hero-enquiry" href={`/${locale}/consultation`}>{words(locale, "需要协助？咨询顾问", "Need guidance? Enquire with an adviser")} <span aria-hidden="true">→</span></Link>
        <div className="shortcuts" aria-label={words(locale, "学习方向", "Study options")}>
          {[["foundation", "预科", "Foundation"], ["bachelor", "本科", "Bachelor’s"], ["master", "硕士", "Master’s"], ["doctorate", "博士", "Doctorate"], ["mba", "MBA", "MBA"], ["medicine", "医学", "Medicine"]].map(([key, zh, en]) => <Link key={key} href={`/${locale}/planning?${key === "mba" || key === "medicine" ? "q" : "level"}=${encodeURIComponent(key === "mba" ? "MBA" : key === "medicine" ? words(locale, "医学", "Medicine") : key)}`}>{words(locale, zh, en)} <span aria-hidden="true">↗</span></Link>)}
        </div>
      </div>
      <div className="hero-media" aria-label={words(locale, "未来品牌照片区域", "Reserved area for future brand photography")}>
        <Image src="/brand/udajo-logo.jpg" width={480} height={480} alt="" aria-hidden="true" />
      </div>
    </div></section>
    <section className="container section">
      <div className="section-heading"><p className="section-label">{words(locale, "选择更清晰", "A clearer way to choose")}</p><h2>{words(locale, "为什么选择 UDAJO", "Why choose UDAJO")}</h2></div>
      <div className="benefits">{benefits.map(([zh, en, bodyZh, bodyEn]) => <article key={zh}><h3>{words(locale, zh, en)}</h3><p>{words(locale, bodyZh, bodyEn)}</p></article>)}</div>
    </section>
    <section className="process-section"><div className="container section">
      <div className="section-heading"><p className="section-label">{words(locale, "从查找到入学", "From search to study")}</p><h2>{words(locale, "申请流程", "Application process")}</h2></div>
      <ol className="process">{steps.map(([zh, en], i) => <li key={zh}><span className="step-number">{String(i + 1).padStart(2, "0")}</span><h3>{words(locale, zh, en)}</h3></li>)}</ol>
      <Link className="button" href={`/${locale}/consultation`}>{words(locale, "咨询申请安排", "Discuss your application")} <span aria-hidden="true">→</span></Link>
    </div></section>
  </main>;
}
