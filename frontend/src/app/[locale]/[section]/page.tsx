import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CompanyProfilePage } from "@/components/company-profile-page";
import { Pagination } from "@/components/pagination";
import { curatedArticles } from "@/data/curated-articles";
import {
  getArticles,
  isArticleSection,
  localizeArticleSummary,
  normalizeArticlePage,
} from "@/lib/article-api";
import { serverApiBaseUrl } from "@/lib/runtime-config";
import {
  boundedPage,
  first,
  isLocale,
  navigation,
  pageLink,
  pageNumber,
  type Query,
  words,
} from "@/lib/site";

const sectionCopy = {
  language: {
    label: ["洋豆角语言", "UDAJO Language"],
    title: ["语言学习", "Language learning"],
    description: ["每期 4,980 元的封闭式雅思培训，涵盖语言培训、最新规则与真实出分案例。", "Intensive IELTS training costs CNY 4,980 per session and covers language skills, current test requirements and verified student results."],
  },
  scholarships: {
    label: ["奖学金计划", "Scholarship opportunities"],
    title: ["洋豆角奖学金", "UDAJO Scholarships"],
    description: ["帮助更多学生走向世界，了解不同院校的奖学金机会、申请条件与重要时间安排。", "Find university scholarships, check eligibility requirements and keep track of application dates."],
  },
  news: {
    label: ["关注第一手信息", "First-hand updates"],
    title: ["掌握最新留学资讯", "Stay informed with the latest updates"],
    description: ["获取经过审核的留学政策、院校动态与洋豆角资讯。", "Read reviewed updates on international education policies, universities and UDAJO."],
  },
  about: {
    label: ["关于洋豆角", "About UDAJO"],
    title: ["让留学变得更简单", "Clear guidance for studying abroad"],
    description: ["了解洋豆角的品牌理念与联系方式。", "Learn about UDAJO and how to contact our team."],
  },
} as const;

const newsChannels = [
  ["留学政策", "Study abroad policies"],
  ["院校动态", "University updates"],
  ["洋豆角资讯", "UDAJO news"],
] as const;

type ContentSectionProps = {
  params: Promise<{ locale: string; section: string }>;
  searchParams: Promise<Query>;
};

export default async function ContentSection({ params, searchParams }: ContentSectionProps) {
  const { locale, section } = await params;
  if (!isLocale(locale)) notFound();
  const item = navigation.find(([path]) => path === section);
  if (!item || !(section in sectionCopy)) notFound();
  if (section === "about") return <CompanyProfilePage locale={locale} />;

  if (!isArticleSection(section)) notFound();
  const query = await searchParams;
  const requestedPage = normalizeArticlePage(pageNumber(first(query, "page")));
  const result = await getArticles(
    serverApiBaseUrl(),
    section,
    requestedPage,
  );
  const sectionPath = `/${locale}/${section}`;
  const reviewedFallback = curatedArticles(section);
  const articles = result.status === "ready" && result.page.items.length > 0
    ? result.page.items
    : reviewedFallback;
  const usingReviewedFallback = !(result.status === "ready" && result.page.items.length > 0);

  if (result.status === "ready") {
    const normalizedPage = boundedPage(result.page.page, result.page.totalPages);
    if (normalizedPage !== result.page.page) {
      redirect(pageLink(sectionPath, query, normalizedPage));
    }
  }

  return <main id="main" className="container page-main">
    <p className="section-label">{words(locale, sectionCopy[section].label[0], sectionCopy[section].label[1])}</p>
    <h1>{words(locale, sectionCopy[section].title[0], sectionCopy[section].title[1])}</h1>
    <p className="page-intro">{words(
      locale,
      sectionCopy[section].description[0],
      sectionCopy[section].description[1],
    )}</p>

    {section === "news" && <nav className="news-channel-nav" aria-label={words(locale, "留学资讯栏目", "News categories")}>
      <ul>{newsChannels.map(([zh, en]) => <li key={zh}>{words(locale, zh, en)}</li>)}</ul>
    </nav>}

    {result.status === "error" && articles.length === 0
      ? <div className="results-state" role="alert">
        <span className="state-symbol" aria-hidden="true">!</span>
        <h2>{words(locale, "资讯暂时无法加载", "We could not load this information")}</h2>
        <p>{words(locale, "请稍后刷新页面重试。", "Please refresh the page and try again later.")}</p>
      </div>
      : articles.length === 0
        ? <div className="results-state" role="status">
          <span className="state-symbol" aria-hidden="true">○</span>
          <h2>{words(locale, "暂无已发布内容", "Nothing has been published here yet")}</h2>
          <p>{words(locale, "内容审核并发布后将在这里显示。", "New articles will appear here after they have been reviewed and published.")}</p>
        </div>
        : <>
          <div className="results-heading article-results-heading">
            <h2>{words(locale, "最新内容", "Latest articles")}</h2>
            <span>{words(
              locale,
              `共 ${articles.length} 篇${usingReviewedFallback ? "已审核指南" : ""}`,
              `${articles.length} reviewed ${articles.length === 1 ? "guide" : "guides"}`,
            )}</span>
          </div>
          <div className={`article-list${section === "scholarships" ? " scholarship-article-grid" : ""}`} id={`${section}-articles`}>
            {articles.map((article) => {
              const localized = localizeArticleSummary(article, locale);
              const articlePath = `${sectionPath}/${encodeURIComponent(article.slug)}`;
              const sourceName = "sourceName" in article && typeof article.sourceName === "string"
                ? article.sourceName
                : null;
              return <article className="article-card" key={`${article.section}/${article.slug}`}>
                {section === "scholarships" && article.coverPath && <Link className="article-card-media" href={articlePath} aria-label={localized.title.text}>
                  <Image src={article.coverPath} alt="" fill sizes="(max-width: 620px) 100vw, 50vw" />
                </Link>}
                {section === "scholarships" ? <div className="article-card-meta">
                  <strong>{sourceName || words(locale, "洋豆角编辑部", "UDAJO Editorial Team")}</strong>
                  <time dateTime={article.publishedAt}>{formatPublishedDate(article.publishedAt, locale)}</time>
                </div> : <p className="article-date">
                  <time dateTime={article.publishedAt}>{formatPublishedDate(article.publishedAt, locale)}</time>
                </p>}
                <h2 lang={localized.title.lang}><Link href={articlePath}>{localized.title.text}</Link></h2>
                {localized.summary.text && <p lang={localized.summary.lang}>{localized.summary.text}</p>}
                <Link className="article-read-link" href={articlePath}>
                  {words(locale, "阅读全文", "Read article")} <span aria-hidden="true">→</span>
                </Link>
              </article>;
            })}
          </div>
          {!usingReviewedFallback && result.status === "ready" && <Pagination
            locale={locale}
            path={sectionPath}
            query={query}
            page={result.page.page}
            total={result.page.totalItems}
          />}
        </>}
  </main>;
}

function formatPublishedDate(value: string, locale: "zh" | "en") {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-GB", {
    year: "numeric",
    month: locale === "zh" ? "long" : "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
