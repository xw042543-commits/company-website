import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FeaturedUniversityCarousel } from "@/components/featured-university-carousel";
import { PublicHome } from "@/components/public-home";
import { SearchAutocomplete } from "@/components/search-autocomplete";
import { courseSuggestions } from "@/data/search-suggestions";
import { UNIVERSITY_CATALOG } from "@/data/university-catalog";
import { chineseBrandMetadata } from "@/lib/brand-metadata";
import { resolvePublicIndexing } from "@/lib/public-indexing";
import { isRequestAuthenticated } from "@/lib/server-auth";
import { isLocale, words } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const { origin } = resolvePublicIndexing(process.env);
  const isChinese = locale === "zh";
  const canonical = isChinese ? origin : `${origin}/en`;
  const title = isChinese
    ? chineseBrandMetadata.title
    : "UDAJO | Find Universities and Plan Your Studies Abroad";
  const description = isChinese
    ? chineseBrandMetadata.description
    : "Compare universities and programmes, plan your application and speak with a UDAJO adviser about studying abroad.";

  return {
    title,
    keywords: isChinese ? chineseBrandMetadata.keywords : undefined,
    description,
    alternates: {
      canonical: canonical,
      languages: {
        "zh-CN": origin,
        en: `${origin}/en`,
        "x-default": origin,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "洋豆角留学",
      title,
      description,
      locale: isChinese ? "zh_CN" : "en_GB",
    },
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const signedIn = await isRequestAuthenticated();
  if (!signedIn) return <PublicHome locale={locale} />;
  const memberHref = (path: string) => signedIn
    ? `/${locale}/${path}`
    : `/${locale}/login?returnTo=${encodeURIComponent(`/${locale}/${path}`)}`;

  const benefits = [
    ["reviewed", "留学信息真实全面", "Reviewed information", "提供真实、全面的留学信息，帮助你安心作出选择。", "Compare reviewed university and programme information before you decide."],
    ["visible", "服务流程透明可视", "Progress you can follow", "服务进度清晰可查，每一步做到哪里都心中有数。", "See what has been completed and what needs to happen next."],
    ["fair", "零中介服务费", "No agency service fee", "你只需支付必要的第三方费用，洋豆角不收取中介服务费。", "Pay only necessary third-party costs. UDAJO does not charge an agency service fee."],
    ["support", "留学全周期服务", "Support from planning to arrival", "从语言培训、规划申请到抵达与学习支持，全程都有专业团队陪伴。", "Get help with language preparation, applications, arrival and study support."],
  ] as const;
  const pathways = [
    ["01", "明确留学方向", "Define your study goals", "结合目标学历与专业兴趣，逐步缩小适合你的选择范围。", "Use your intended qualification and academic interests to narrow your options.", memberHref("planning"), "开始规划", "Start planning"],
    ["02", "比较院校选择", "Compare universities", "查看经过审核的院校资料，比较地点、课程方向与入学安排。", "Compare reviewed information on location, programmes, and intake periods.", memberHref("universities"), "浏览院校", "Browse universities"],
    ["03", "咨询留学顾问", "Speak with an adviser", "与顾问确认申请步骤、材料要求和时间安排。", "Confirm application steps, document requirements, and timelines with an adviser.", `/${locale}/about#enquiry`, "联系顾问", "Contact an adviser"],
  ] as const;
  const steps = [
    ["explore", "查询院校与专业", "Explore universities and programmes", "从感兴趣的专业和目标学历开始筛选。", "Begin with your preferred subject and intended qualification."],
    ["advise", "咨询留学顾问", "Speak with an adviser", "确认入学要求、申请时间和后续步骤。", "Confirm entry requirements, timelines, and next steps."],
    ["apply", "准备并提交申请", "Prepare and apply", "整理并提交申请所需的材料。", "Prepare and submit the documents required for your application."],
    ["offer", "获取录取通知", "Receive an offer", "查看录取条件与后续安排。", "Review the offer conditions and follow-up arrangements."],
    ["arrive", "入学上课", "Start your studies", "完成入学准备并开启学习。", "Complete enrolment preparation and begin your studies."],
  ] as const;
  const faqs = [
    ["我应该从哪里开始？", "Where should I begin?", "可以先按专业关键词或学历层级进行查询，再比较院校资料。需要协助时，也可以直接联系顾问。", "Start by searching with a course keyword or study level, then compare university information. You can also contact an adviser whenever you need guidance."],
    ["网站上的院校资料经过审核吗？", "Is the university information reviewed?", "网站只展示已审核并收录的院校资料。院校展示不代表合作关系。", "The website displays reviewed directory records only. A university appearing in the directory does not imply a partnership."],
    ["专业资料尚未上线时，可以先咨询吗？", "Can I enquire before programme details are published?", "可以。顾问可协助了解现阶段的院校、专业与申请安排。", "Yes. An adviser can help with current university, course, and application information."],
    ["提交咨询后多久会收到回复？", "How soon will I receive a reply?", "顾问通常会在一个工作日内回复。", "An adviser will usually reply within one business day."],
  ] as const;

  return <main id="main">
    <section className="member-home-hero"><div className="container member-home-hero-grid">
      <div className={`member-home-copy member-home-copy-${locale}`}>
        <p className="section-label">{words(locale, "科学规划｜科学定位", "Explore · Compare · Decide")}</p>
        <h1>{words(locale, "全球第一家留学生综合服务平台", "Find the right university and programme")}</h1>
        <div className="member-home-positioning">
          <p>{words(locale, "科学规划留学院校专业", "Compare universities, programmes and entry requirements.")}</p>
          <p>{words(locale, "科学定位留学人生发展", "Plan your next steps with support from an adviser.")}</p>
        </div>
        <div className="member-home-actions">
          <Link className="button" href={`/${locale}/planning`}>{words(locale, "开始规划", "Start planning")}</Link>
          <Link className="member-home-secondary-action" href={`/${locale}/universities`}>{words(locale, "浏览院校", "Browse universities")} <span aria-hidden="true">→</span></Link>
        </div>
      </div>
      <div className="member-home-visual">
        <Image src="/universities/campuses/apu-campus.webp" fill sizes="(max-width: 980px) 92vw, 52vw" priority alt={words(locale, "马来西亚大学校园", "A university campus in Malaysia")} />
        <div className="member-home-visual-overlay">
          <strong>{words(locale, `${UNIVERSITY_CATALOG.length} 所已收录院校`, `${UNIVERSITY_CATALOG.length} universities listed`)}</strong>
          <span>{words(locale, "本科 · 硕士 · 博士", "Bachelor's · Master's · Doctorate")}</span>
          <span>{words(locale, "顾问支持贯穿申请全程", "Adviser support throughout your application")}</span>
        </div>
      </div>
    </div></section>
    <section className="member-search-band" aria-label={words(locale, "院校和专业查询", "University and programme search")}><div className="member-search-panel container">
      <form action={`/${locale}/planning`} className="home-search">
        <label htmlFor="home-keyword">{words(locale, "查找适合你的专业", "Find the right programme for you")}</label>
        <div className="search-row"><SearchAutocomplete id="home-keyword" name="q" locale={locale} suggestions={courseSuggestions(locale)} placeholder={words(locale, "输入专业名称或关键词", "Enter a subject or keyword")} /><button type="submit">{words(locale, "查询专业", "Search programmes")}</button></div>
      </form>
      <div className="member-search-support">
        <Link className="text-link" href={`/${locale}/about#enquiry`}>{words(locale, "需要协助？联系顾问", "Need guidance? Contact an adviser")} <span aria-hidden="true">→</span></Link>
        <div className="shortcuts" aria-label={words(locale, "按学历或方向查询", "Search by study level or subject")}>
          {[["foundation", "预科", "Foundation"], ["bachelor", "本科", "Bachelor's"], ["master", "硕士", "Master's"], ["doctorate", "博士", "Doctorate"], ["mba", "MBA", "MBA"], ["medicine", "医学", "Medicine"]].map(([key, zh, en]) => <Link key={key} href={`/${locale}/planning?${key === "mba" || key === "medicine" ? "q" : "level"}=${encodeURIComponent(key === "mba" ? "MBA" : key === "medicine" ? words(locale, "医学", "Medicine") : key)}`}>{words(locale, zh, en)}</Link>)}
        </div>
      </div>
    </div></section>
    {signedIn ? <section className="university-directory-strip" aria-labelledby="reviewed-universities-heading"><div className="container">
      <div className="directory-strip-heading"><div><p className="section-label">{words(locale, "热门", "Popular")}</p><h2 id="reviewed-universities-heading">{words(locale, "留学热门院校", "Popular universities")}</h2><p>{words(locale, "热门专业、费用与录取信息一目了然。", "Compare popular subjects, fees, and admission information at a glance.")}</p></div><Link className="directory-view-all" href={`/${locale}/universities`}>{words(locale, "查看并比较全部院校", "View and compare all universities")} <span aria-hidden="true">→</span></Link></div>
      <FeaturedUniversityCarousel locale={locale} />
    </div></section> : <section className="member-preview" aria-labelledby="member-preview-heading"><div className="container section member-preview-layout">
      <div className="member-preview-copy"><p className="section-label">{words(locale, "登录后可使用", "Inside your account")}</p><h2 id="member-preview-heading">{words(locale, "把留学选择整理成清晰的下一步", "Turn study choices into clear next steps")}</h2><p>{words(locale, "注册后即可查询已审核院校与专业、比较选择，并保存你的规划方向。", "Create an account to explore reviewed universities and programmes, compare choices, and organise your study direction.")}</p><Link className="text-link" href={`/${locale}/login?mode=register&returnTo=${encodeURIComponent(`/${locale}/universities`)}`}>{words(locale, "查看会员工具", "Explore member tools")} <span aria-hidden="true">→</span></Link></div>
      <div className="member-preview-list">
        {[["01", "院校与专业资料", "University and programme data"], ["02", "院校比较", "University comparison"], ["03", "个人规划工具", "Personal planning tools"]].map(([number, zh, en]) => <article key={number}><span>{number}</span><h3>{words(locale, zh, en)}</h3></article>)}
      </div>
    </div></section>}
    <section className="pathway-section" aria-labelledby="pathway-heading"><div className="container section">
      <div className="section-heading"><p className="section-label">{words(locale, "定制方案", "Your study plan")}</p><h2 id="pathway-heading">{words(locale, "根据你的情况定制留学方案", "Plan around your goals and qualifications")}</h2><p>{words(locale, "先定专业，再选院校，最后联系顾问确认适合你的申请方案。", "Choose a subject, compare universities and ask an adviser to check your application plan.")}</p></div>
      <div className="pathway-grid">{pathways.map(([number, zh, en, bodyZh, bodyEn, href, actionZh, actionEn]) => <Link className="pathway-card" href={href} key={number}>
        <span className="pathway-number" aria-hidden="true">{number}</span>
        <h3>{words(locale, zh, en)}</h3>
        <p>{words(locale, bodyZh, bodyEn)}</p>
        <span className="pathway-action">{words(locale, actionZh, actionEn)} <span aria-hidden="true">→</span></span>
      </Link>)}</div>
    </div></section>
    <section className="benefits-section"><div className="container section">
      <div className="section-heading"><p className="section-label">{words(locale, "选择更清晰", "Why UDAJO")}</p><h2>{words(locale, "为什么选择洋豆角", "Why students choose UDAJO")}</h2></div>
      <div className="benefits">{benefits.map(([kind, zh, en, bodyZh, bodyEn]) => <article className={`benefit-${kind}`} key={kind}>
        <BenefitSymbol kind={kind} />
        <h3>{words(locale, zh, en)}</h3>
        <p>{words(locale, bodyZh, bodyEn)}</p>
      </article>)}</div>
    </div></section>
    <section className="process-section"><div className="container section">
      <div className="section-heading"><p className="section-label">{words(locale, "从查找到入学", "From search to study")}</p><h2>{words(locale, "申请流程", "Application process")}</h2></div>
      <ol className="process">{steps.map(([kind, zh, en, bodyZh, bodyEn], i) => <li className={`process-step process-step-${kind}`} key={kind}><span className="step-number">{String(i + 1).padStart(2, "0")}</span><h3>{words(locale, zh, en)}</h3><p>{words(locale, bodyZh, bodyEn)}</p></li>)}</ol>
      <Link className="button" href={`/${locale}/about#enquiry`}>{words(locale, "联系顾问", "Contact an adviser")}</Link>
    </div></section>
    <section className="faq-section" aria-labelledby="faq-heading"><div className="container section faq-layout">
      <div className="faq-heading"><p className="section-label">{words(locale, "常见问题", "Frequently asked questions")}</p><h2 id="faq-heading">{words(locale, "留学常见问题解答", "Questions about studying abroad")}</h2><p>{words(locale, "联系顾问，更快获得适合你的方案。", "Speak with an adviser if you need an answer about your own situation.")}</p><Link className="text-link" href={`/${locale}/about#enquiry`}>{words(locale, "联系顾问", "Contact an adviser")} <span aria-hidden="true">→</span></Link></div>
      <div className="faq-list">{faqs.map(([questionZh, questionEn, answerZh, answerEn], index) => <details key={questionZh} open={index === 0}>
        <summary>{words(locale, questionZh, questionEn)}<span className="faq-toggle" aria-hidden="true" /></summary>
        <p>{words(locale, answerZh, answerEn)}</p>
      </details>)}</div>
    </div></section>
  </main>;
}

function BenefitSymbol({ kind }: { kind: "reviewed" | "visible" | "fair" | "support" }) {
  return <span className="benefit-symbol" aria-hidden="true">
    {kind === "reviewed" && <svg viewBox="0 0 48 48"><circle cx="21" cy="21" r="13" /><path d="m15.5 21.5 4 4 8.5-9" /><path d="M31 31.5 39 39" /></svg>}
    {kind === "visible" && <svg viewBox="0 0 48 48"><path d="M8 34 18 24l7 6 15-16" /><circle cx="8" cy="34" r="3" /><circle cx="18" cy="24" r="3" /><circle cx="25" cy="30" r="3" /><circle cx="40" cy="14" r="3" /></svg>}
    {kind === "fair" && <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="15" /><path d="M29.5 17.5h-7a4 4 0 0 0 0 8h3a4 4 0 0 1 0 8h-7M24 13v5M24 34v4" /></svg>}
    {kind === "support" && <svg viewBox="0 0 48 48"><path d="M24 38S9 30 9 19.5A8.5 8.5 0 0 1 24 14a8.5 8.5 0 0 1 15 5.5C39 30 24 38 24 38Z" /><path d="M18 24h4l2-5 3 10 2-5h4" /></svg>}
  </span>;
}
