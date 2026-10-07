import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

import { curatedArticle } from "@/data/curated-articles";
import {
  getArticle,
  isArticleSection,
  localizeArticle,
} from "@/lib/article-api";
import { serverApiBaseUrl } from "@/lib/runtime-config";
import { isLocale, navigation, words } from "@/lib/site";

type ArticleDetailProps = {
  params: Promise<{ locale: string; section: string; slug: string }>;
};

export default async function ArticleDetailPage({ params }: ArticleDetailProps) {
  const { locale, section, slug } = await params;
  if (!isLocale(locale) || !isArticleSection(section)) notFound();

  const result = await getArticle(
    serverApiBaseUrl(),
    section,
    slug,
  );
  const localArticle = curatedArticle(section, slug);
  if (result.status === "not-found" && !localArticle) notFound();

  const item = navigation.find(([path]) => path === section);
  const sectionTitle = item ? words(locale, item[1], item[2]) : section;
  const sectionPath = `/${locale}/${section}`;

  if (result.status === "error" && !localArticle) {
    return <main id="main" className="container page-main">
      <Link className="back-link" href={sectionPath}>
        <span aria-hidden="true">←</span> {words(locale, `返回${sectionTitle}`, `Back to ${sectionTitle}`)}
      </Link>
      <div className="results-state" role="alert">
        <span className="state-symbol" aria-hidden="true">!</span>
        <h1>{words(locale, "文章暂时无法加载", "This article is temporarily unavailable")}</h1>
        <p>{words(locale, "请稍后刷新页面重试。", "Please refresh the page and try again later.")}</p>
      </div>
    </main>;
  }

  const article = result.status === "ready" ? result.article : localArticle!;
  const localized = localizeArticle(article, locale);
  const isScholarship = section === "scholarships";

  return <main id="main" className={`container page-main article-detail-page${isScholarship ? " scholarship-article-detail-page" : ""}`}>
    <Link className="back-link" href={sectionPath}>
      <span aria-hidden="true">←</span> {words(locale, `返回${sectionTitle}`, `Back to ${sectionTitle}`)}
    </Link>
    <article className={`article-detail${isScholarship ? " scholarship-article-detail" : ""}`}>
      <header className="article-detail-header">
        <p className="section-label">{sectionTitle}</p>
        {isScholarship && <div className="article-detail-meta">
          {article.sourceName && <strong>{article.sourceName}</strong>}
          <time dateTime={article.publishedAt}>{formatPublishedDate(article.publishedAt, locale)}</time>
        </div>}
        <h1 lang={localized.title.lang}>{localized.title.text}</h1>
        {localized.summary.text && <p className="article-lead" lang={localized.summary.lang}>{localized.summary.text}</p>}
        {!isScholarship && <p className="article-byline">
          {article.authorName && <span>{article.authorName}</span>}
          <time dateTime={article.publishedAt}>{formatPublishedDate(article.publishedAt, locale)}</time>
        </p>}
      </header>

      <div className={isScholarship ? "article-reading-layout" : undefined}>
        <div className="article-markdown" lang={localized.bodyMarkdown.lang}>
          <ReactMarkdown components={{ h1: ({ children }) => <h2>{children}</h2> }}>
            {localized.bodyMarkdown.text}
          </ReactMarkdown>
        </div>

        {(article.sourceName || article.sourceUrl) && (isScholarship ? <aside className="article-reference" aria-label={words(locale, "文章资料来源", "Article source")}>
          <p>{words(locale, "审核资料来源", "Reviewed source")}</p>
          <strong>{article.sourceName || words(locale, "官方资料", "Official information")}</strong>
          <time dateTime={article.publishedAt}>{formatPublishedDate(article.publishedAt, locale)}</time>
          {article.sourceUrl && <a href={article.sourceUrl} target="_blank" rel="noreferrer">{words(locale, "查看官方资料", "View official source")} <span aria-hidden="true">↗</span></a>}
          <Link href={sectionPath}>{words(locale, "浏览更多奖学金", "Browse more scholarships")} <span aria-hidden="true">→</span></Link>
        </aside> : <footer className="article-source">
          <strong>{words(locale, "资料来源", "Source")}</strong>
          {article.sourceUrl
            ? <a href={article.sourceUrl} target="_blank" rel="noreferrer">
              {article.sourceName || article.sourceUrl}
            </a>
            : <span>{article.sourceName}</span>}
        </footer>)}
      </div>
    </article>
  </main>;
}

function formatPublishedDate(value: string, locale: "zh" | "en") {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
