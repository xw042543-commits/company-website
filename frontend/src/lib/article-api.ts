import type { Locale } from "./site.ts";

export const articleSections = ["language", "scholarships", "programmes", "news"] as const;
export type ArticleSection = typeof articleSections[number];

export type ArticleSummary = {
  section: ArticleSection;
  slug: string;
  titleZh: string | null;
  titleEn: string | null;
  summaryZh: string | null;
  summaryEn: string | null;
  coverPath: string | null;
  publishedAt: string;
};

export type ArticleDetail = ArticleSummary & {
  bodyMarkdownZh: string | null;
  bodyMarkdownEn: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  authorName: string | null;
};

export type ArticlePage = {
  items: ArticleSummary[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type ArticlesResult =
  | { status: "ready"; page: ArticlePage }
  | { status: "error" };

export type ArticleResult =
  | { status: "ready"; article: ArticleDetail }
  | { status: "not-found" }
  | { status: "error" };

export type LocalizedArticleText = {
  text: string;
  lang: "zh-CN" | "en";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isNonBlank(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasText(...values: unknown[]): boolean {
  return values.some(isNonBlank);
}

export function isArticleSection(value: string): value is ArticleSection {
  return articleSections.includes(value as ArticleSection);
}

function isArticleSummary(value: unknown): value is ArticleSummary {
  if (!isRecord(value)) return false;
  return typeof value.section === "string"
    && isArticleSection(value.section)
    && isNonBlank(value.slug)
    && isNullableString(value.titleZh)
    && isNullableString(value.titleEn)
    && hasText(value.titleZh, value.titleEn)
    && isNullableString(value.summaryZh)
    && isNullableString(value.summaryEn)
    && isNullableString(value.coverPath)
    && isNonBlank(value.publishedAt)
    && !Number.isNaN(Date.parse(value.publishedAt));
}

export function parseArticlePage(payload: unknown): ArticlePage | null {
  if (!isRecord(payload)
    || !Array.isArray(payload.items)
    || !payload.items.every(isArticleSummary)
    || !Number.isSafeInteger(payload.page) || Number(payload.page) < 1
    || !Number.isSafeInteger(payload.pageSize) || Number(payload.pageSize) < 1
    || !Number.isSafeInteger(payload.totalItems) || Number(payload.totalItems) < 0
    || !Number.isSafeInteger(payload.totalPages) || Number(payload.totalPages) < 0) {
    return null;
  }
  const pageSize = Number(payload.pageSize);
  const page = Number(payload.page);
  const totalItems = Number(payload.totalItems);
  const expectedTotalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);
  const offset = (page - 1) * pageSize;
  if (!Number.isSafeInteger(offset)) return null;

  const expectedItemCount = Math.min(pageSize, Math.max(0, totalItems - offset));
  if (payload.items.length !== expectedItemCount || payload.totalPages !== expectedTotalPages) {
    return null;
  }
  return payload as ArticlePage;
}

export function parseArticleDetail(payload: unknown): ArticleDetail | null {
  if (!isRecord(payload) || !isArticleSummary(payload)) return null;
  const detail = payload as Record<string, unknown>;
  if (!isNullableString(detail.bodyMarkdownZh)
    || !isNullableString(detail.bodyMarkdownEn)
    || !hasText(detail.bodyMarkdownZh, detail.bodyMarkdownEn)
    || !isNullableString(detail.sourceName)
    || !isNullableString(detail.sourceUrl)
    || !isSafeHttpsUrl(detail.sourceUrl)
    || !isNullableString(detail.authorName)) {
    return null;
  }
  return payload as ArticleDetail;
}

function isSafeHttpsUrl(value: string | null): boolean {
  if (value === null) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

const maximumArticlePage = Math.floor(2_147_483_647 / 12) + 1;

export function normalizeArticlePage(page: number): number {
  return Number.isSafeInteger(page) && page > 0 && page <= maximumArticlePage ? page : 1;
}

export async function getArticles(
  baseUrl: string | undefined,
  section: ArticleSection,
  page: number,
  request: typeof fetch = fetch,
): Promise<ArticlesResult> {
  if (!baseUrl || !isArticleSection(section)) return { status: "error" };

  try {
    const url = new URL(`/api/v1/articles/${section}`, baseUrl);
    url.searchParams.set("page", String(normalizeArticlePage(page)));
    url.searchParams.set("size", "12");
    const response = await request(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return { status: "error" };

    const parsed = parseArticlePage(await response.json());
    const expectedPage = normalizeArticlePage(page);
    const matchesRequest = parsed
      && parsed.page === expectedPage
      && parsed.pageSize === 12
      && parsed.items.every((article) => article.section === section);
    return matchesRequest ? { status: "ready", page: parsed } : { status: "error" };
  } catch {
    return { status: "error" };
  }
}

export async function getArticle(
  baseUrl: string | undefined,
  section: ArticleSection,
  slug: string,
  request: typeof fetch = fetch,
): Promise<ArticleResult> {
  if (!baseUrl || !isArticleSection(section) || !slug.trim()) return { status: "error" };

  try {
    const path = `/api/v1/articles/${section}/${encodeURIComponent(slug.trim())}`;
    const response = await request(new URL(path, baseUrl), {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (response.status === 404) return { status: "not-found" };
    if (!response.ok) return { status: "error" };

    const parsed = parseArticleDetail(await response.json());
    const matchesRequest = parsed && parsed.section === section && parsed.slug === slug.trim();
    return matchesRequest ? { status: "ready", article: parsed } : { status: "error" };
  } catch {
    return { status: "error" };
  }
}

function preferredText(locale: Locale, zh: string | null, en: string | null): LocalizedArticleText {
  const primary = locale === "zh" ? zh : en;
  const fallback = locale === "zh" ? en : zh;
  if (primary?.trim()) {
    return { text: primary.trim(), lang: locale === "zh" ? "zh-CN" : "en" };
  }
  if (fallback?.trim()) {
    return { text: fallback.trim(), lang: locale === "zh" ? "en" : "zh-CN" };
  }
  return { text: "", lang: locale === "zh" ? "zh-CN" : "en" };
}

export function localizeArticle(article: ArticleDetail, locale: Locale) {
  return {
    title: preferredText(locale, article.titleZh, article.titleEn),
    summary: preferredText(locale, article.summaryZh, article.summaryEn),
    bodyMarkdown: preferredText(locale, article.bodyMarkdownZh, article.bodyMarkdownEn),
  };
}

export function localizeArticleSummary(article: ArticleSummary, locale: Locale) {
  return {
    title: preferredText(locale, article.titleZh, article.titleEn),
    summary: preferredText(locale, article.summaryZh, article.summaryEn),
  };
}
