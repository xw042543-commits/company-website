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

  return <main id="main" className="container page-main article-detail-page">
    <Link className="back-link" href={sectionPath}>
      <span aria-hidden="true">←</span> {words(locale, `返回${sectionTitle}`, `Back to ${sectionTitle}`)}
    </Link>
    <article className="article-detail">
      <header className="article-detail-header">
        <p className="section-label">{sectionTitle}</p>
        <h1 lang={localized.title.lang}>{localized.title.text}</h1>
        {localized.summary.text && <p className="article-lead" lang={localized.summary.lang}>{localized.summary.text}</p>}
        <p className="article-byline">
          {article.authorName && <span>{article.authorName}</span>}
          <time dateTime={article.publishedAt}>{formatPublishedDate(article.publishedAt, locale)}</time>
        </p>
      </header>

      <div className="article-markdown" lang={localized.bodyMarkdown.lang}>
        <ReactMarkdown components={{ h1: ({ children }) => <h2>{children}</h2> }}>
          {localized.bodyMarkdown.text}
        </ReactMarkdown>
      </div>

      {(article.sourceName || article.sourceUrl) && <footer className="article-source">
        <strong>{words(locale, "资料来源", "Source")}</strong>
        {article.sourceUrl
          ? <a href={article.sourceUrl} target="_blank" rel="noreferrer">
            {article.sourceName || article.sourceUrl}
          </a>
          : <span>{article.sourceName}</span>}
      </footer>}
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
