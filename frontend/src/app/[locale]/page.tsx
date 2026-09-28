import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FeaturedUniversityCarousel } from "@/components/featured-university-carousel";
import { SearchAutocomplete } from "@/components/search-autocomplete";
import { courseSuggestions } from "@/data/search-suggestions";
import { isLocale, words } from "@/lib/site";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const benefits = [
    ["留学真信息", "Reliable information", "提供全面、经过审核的留学信息，帮助你判断每个选择。", "Use comprehensive, reviewed information to assess each option."],
    ["流程透明", "Visible progress", "服务与申请进度清晰可见，随时了解下一步。", "Follow each service and application stage, with the next step clearly shown."],
    ["0 中介费", "No agency fee", "只支付必要的第三方费用，不收取留学中介费。", "Pay only necessary third-party costs, with no study-abroad agency fee."],
    ["全周期服务", "Full-journey support", "从规划、申请到海外落地与学习支持，全程有人协助。", "Get support from planning and applications through arrival and ongoing study."],
  ] as const;
  const pathways = [
    ["01", "规划学习方向", "Plan your study path", "从学历层级与专业兴趣开始，整理适合自己的选择。", "Start with your study level and interests to organise suitable options.", `/${locale}/planning`, "开始规划", "Start planning"],
    ["02", "比较院校资料", "Compare universities", "浏览已审核的院校记录，并进一步查看重点资料。", "Browse reviewed university records and explore the key details.", `/${locale}/universities`, "浏览院校", "Browse universities"],
    ["03", "联系教育顾问", "Speak with an adviser", "需要协助时，向顾问了解申请步骤与资料准备。", "Ask an adviser about application steps and document preparation when needed.", `/${locale}/about#enquiry`, "联系顾问", "Contact an adviser"],
  ] as const;
  const steps = [
    ["在线查询专业", "Search for a course", "从感兴趣的专业和学历层级开始。", "Begin with your preferred subject and study level."],
    ["扫码联系老师", "Contact an adviser", "确认要求、时间安排与下一步。", "Confirm requirements, timing, and next steps."],
    ["准备及申请", "Prepare and apply", "整理申请所需的资料。", "Organise the documents needed for your application."],
    ["获取录取通知", "Receive an offer", "查看录取条件与后续安排。", "Review the offer conditions and follow-up arrangements."],
    ["入学上课", "Start your studies", "完成入学准备并开启学习。", "Complete enrolment preparation and begin your studies."],
  ] as const;
  const faqs = [
    ["我应该从哪里开始？", "Where should I begin?", "可以先按专业关键词或学历层级进行查询，再比较院校资料。需要协助时，也可以直接联系顾问。", "Start by searching with a course keyword or study level, then compare university information. You can also contact an adviser whenever you need guidance."],
    ["网站上的院校资料经过审核吗？", "Is the university information reviewed?", "网站只展示已审核并收录的院校资料。院校展示不代表合作关系。", "The website displays reviewed directory records only. A university appearing in the directory does not imply a partnership."],
    ["专业资料尚未上线时，可以先咨询吗？", "Can I enquire before programme details are published?", "可以。顾问可协助了解现阶段的院校、专业与申请安排。", "Yes. An adviser can help with current university, course, and application information."],
    ["提交咨询后多久会收到回复？", "How soon will I receive a reply?", "顾问通常会在一个工作日内回复。", "An adviser will usually reply within one business day."],
  ] as const;

  return <main id="main">
    <section className="hero"><div className="container hero-grid">
      <div className="hero-copy">
        <p className="section-label">{words(locale, "科学规划 · 科学定位", "Plan with evidence · Choose with purpose")}</p>
        <h1>{words(locale, "全球第一家留学生综合服务平台", "A comprehensive service platform for international students")}</h1>
        <p className="hero-intro">{words(locale, "科学规划留学院校与专业，科学定位留学人生发展。洋豆角提供留学生全周期陪跑。", "Plan universities, courses, and long-term development with full-journey support from UDAJO.")}</p>
        <form action={`/${locale}/planning`} className="home-search">
          <label htmlFor="home-keyword">{words(locale, "院校查询系统", "University search")}</label>
          <div className="search-row"><SearchAutocomplete id="home-keyword" name="q" locale={locale} suggestions={courseSuggestions(locale)} placeholder={words(locale, "输入想学习的专业", "What would you like to study?")} /><button type="submit">{words(locale, "查询专业", "Find a course")}</button></div>
        </form>
        <Link className="text-link hero-enquiry" href={`/${locale}/about#enquiry`}>{words(locale, "需要协助？联系顾问", "Need guidance? Contact an adviser")}</Link>
        <div className="shortcuts" aria-label={words(locale, "学习方向", "Study options")}>
          {[["foundation", "预科", "Foundation"], ["bachelor", "本科", "Bachelor’s"], ["master", "硕士", "Master’s"], ["doctorate", "博士", "Doctorate"], ["mba", "MBA", "MBA"], ["medicine", "医学", "Medicine"]].map(([key, zh, en]) => <Link key={key} href={`/${locale}/planning?${key === "mba" || key === "medicine" ? "q" : "level"}=${encodeURIComponent(key === "mba" ? "MBA" : key === "medicine" ? words(locale, "医学", "Medicine") : key)}`}>{words(locale, zh, en)}</Link>)}
        </div>
      </div>
      <div className="hero-media" aria-label={words(locale, "洋豆角留学规划指南针", "UDAJO study planning compass")}>
        <Image src="/brand/udajo-logo.jpg" width={480} height={480} sizes="(max-width: 760px) 42vw, 195px" alt="" aria-hidden="true" />
      </div>
    </div></section>
    <section className="university-directory-strip" aria-labelledby="reviewed-universities-heading"><div className="container">
      <div className="directory-strip-heading"><div><p className="section-label">{words(locale, "热门", "Popular")}</p><h2 id="reviewed-universities-heading">{words(locale, "留学热门院校", "Popular universities")}</h2><p>{words(locale, "热门专业、费用与录取信息一目了然。", "Compare popular subjects, fees, and admission information at a glance.")}</p></div><Link className="text-link" href={`/${locale}/universities`}>{words(locale, "查看并比较全部院校", "View and compare all universities")}</Link></div>
      <FeaturedUniversityCarousel locale={locale} />
    </div></section>
    <section className="pathway-section" aria-labelledby="pathway-heading"><div className="container section">
      <div className="section-heading"><p className="section-label">{words(locale, "定制方案", "Tailored planning")}</p><h2 id="pathway-heading">{words(locale, "根据你的情况定制留学方案", "Build a plan around your situation")}</h2><p>{words(locale, "先定专业，再选院校，最后联系顾问。", "Choose a direction, compare universities, then speak with an adviser.")}</p></div>
      <div className="pathway-grid">{pathways.map(([number, zh, en, bodyZh, bodyEn, href, actionZh, actionEn]) => <Link className="pathway-card" href={href} key={number}>
        <span className="pathway-number" aria-hidden="true">{number}</span>
        <h3>{words(locale, zh, en)}</h3>
        <p>{words(locale, bodyZh, bodyEn)}</p>
        <span className="pathway-action">{words(locale, actionZh, actionEn)} <span aria-hidden="true">→</span></span>
      </Link>)}</div>
    </div></section>
    <section className="container section">
      <div className="section-heading"><p className="section-label">{words(locale, "选择更清晰", "A clearer way to choose")}</p><h2>{words(locale, "为什么选择洋豆角", "Why choose UDAJO")}</h2></div>
      <div className="benefits">{benefits.map(([zh, en, bodyZh, bodyEn]) => <article key={zh}><h3>{words(locale, zh, en)}</h3><p>{words(locale, bodyZh, bodyEn)}</p></article>)}</div>
    </section>
    <section className="process-section"><div className="container section">
      <div className="section-heading"><p className="section-label">{words(locale, "从查找到入学", "From search to study")}</p><h2>{words(locale, "申请流程", "Application process")}</h2></div>
      <ol className="process">{steps.map(([zh, en, bodyZh, bodyEn], i) => <li key={zh}><span className="step-number">{String(i + 1).padStart(2, "0")}</span><h3>{words(locale, zh, en)}</h3><p>{words(locale, bodyZh, bodyEn)}</p></li>)}</ol>
      <Link className="button" href={`/${locale}/about#enquiry`}>{words(locale, "联系顾问", "Contact an adviser")}</Link>
    </div></section>
    <section className="faq-section" aria-labelledby="faq-heading"><div className="container section faq-layout">
      <div className="faq-heading"><p className="section-label">{words(locale, "常见问题", "Frequently asked questions")}</p><h2 id="faq-heading">{words(locale, "留学常见问题解答", "Common study-abroad questions")}</h2><p>{words(locale, "联系顾问，更快获得适合你的方案。", "Contact an adviser to receive guidance suited to your situation.")}</p><Link className="text-link" href={`/${locale}/about#enquiry`}>{words(locale, "联系顾问", "Contact an adviser")} <span aria-hidden="true">→</span></Link></div>
      <div className="faq-list">{faqs.map(([questionZh, questionEn, answerZh, answerEn], index) => <details key={questionZh} open={index === 0}>
        <summary>{words(locale, questionZh, questionEn)}<span className="faq-toggle" aria-hidden="true" /></summary>
        <p>{words(locale, answerZh, answerEn)}</p>
      </details>)}</div>
    </div></section>
  </main>;
}
