import assert from "node:assert/strict";
import test from "node:test";

let articleApi: Record<string, unknown> = {};
try {
  articleApi = await import("./article-api.ts");
} catch {
  // The first TDD run intentionally executes before the implementation exists.
}

type UnknownFunction = (...args: never[]) => unknown;

function exported(name: string): UnknownFunction | undefined {
  const candidate = Reflect.get(articleApi, name);
  return typeof candidate === "function" ? candidate as UnknownFunction : undefined;
}

const summary = {
  section: "news",
  slug: "malaysia-study-update",
  titleZh: "马来西亚留学资讯",
  titleEn: "Malaysia study update",
  summaryZh: "中文摘要",
  summaryEn: "English summary",
  coverPath: "/content/news/update.jpg",
  publishedAt: "2026-09-22T08:00:00Z",
};

const page = {
  items: [summary],
  page: 1,
  pageSize: 12,
  totalItems: 1,
  totalPages: 1,
};

const detail = {
  ...summary,
  bodyMarkdownZh: "# 中文正文\n\n- 第一项",
  bodyMarkdownEn: "# English body\n\n- First item",
  sourceName: "UDAJO",
  sourceUrl: "https://yangdoujiao.com/news/malaysia-study-update",
  authorName: "UDAJO Team",
};

test("accepts complete article pages and rejects malformed page metadata", () => {
  const parse = exported("parseArticlePage");

  assert.deepEqual(parse?.(page as never), page);
  assert.equal(parse?.({ ...page, page: 0 } as never), null);
  assert.equal(parse?.({ ...page, pageSize: 6, totalPages: 99 } as never), null);
  assert.equal(parse?.({ ...page, page: Number.MAX_SAFE_INTEGER + 1 } as never), null);
  assert.equal(parse?.({ ...page, pageSize: 1, items: [summary, summary] } as never), null);
  assert.equal(parse?.({ ...page, items: [] } as never), null);
  assert.equal(parse?.({ ...page, totalItems: 0, totalPages: 0 } as never), null);
  assert.equal(parse?.({ ...page, items: [{ ...summary, slug: "" }] } as never), null);
});

test("normalizes article pages that exceed the backend offset range", () => {
  const normalizePage = exported("normalizeArticlePage");

  assert.equal(normalizePage?.(2 as never), 2);
  assert.equal(normalizePage?.(Number.MAX_SAFE_INTEGER as never), 1);
  assert.equal(normalizePage?.(0 as never), 1);
});

test("accepts a complete article detail and rejects missing Markdown", () => {
  const parse = exported("parseArticleDetail");

  assert.deepEqual(parse?.(detail as never), detail);
  assert.equal(parse?.({ ...detail, bodyMarkdownZh: null, bodyMarkdownEn: null } as never), null);
  assert.equal(parse?.({ ...detail, sourceUrl: "data:text/html,<script>alert(1)</script>" } as never), null);
  assert.equal(parse?.({ ...detail, sourceUrl: "javascript:alert(1)" } as never), null);
  assert.equal(parse?.({ ...detail, sourceUrl: "file:///tmp/article" } as never), null);
});

test("requests a published article page from the V1 endpoint", async () => {
  const requestArticles = exported("getArticles");
  let requestedUrl = "";
  const request = (async (input: string | URL | Request) => {
    requestedUrl = String(input);
    return new Response(JSON.stringify(page), { status: 200 });
  }) as typeof fetch;

  assert.deepEqual(
    await requestArticles?.("http://localhost:8080" as never, "news" as never, 1 as never, request as never),
    { status: "ready", page },
  );
  assert.equal(requestedUrl, "http://localhost:8080/api/v1/articles/news?page=1&size=12");
});

test("rejects list responses that do not match the requested page or section", async () => {
  const requestArticles = exported("getArticles");
  const wrongPage = (async () => new Response(JSON.stringify(page), { status: 200 })) as typeof fetch;
  const wrongSection = (async () => new Response(JSON.stringify({
    ...page,
    items: [{ ...summary, section: "language" }],
  }), { status: 200 })) as typeof fetch;

  assert.deepEqual(
    await requestArticles?.("http://localhost:8080" as never, "news" as never, 2 as never, wrongPage as never),
    { status: "error" },
  );
  assert.deepEqual(
    await requestArticles?.("http://localhost:8080" as never, "news" as never, 1 as never, wrongSection as never),
    { status: "error" },
  );
});

test("requests one published article detail and distinguishes missing content", async () => {
  const requestArticle = exported("getArticle");
  const ready = (async () => new Response(JSON.stringify(detail), { status: 200 })) as typeof fetch;
  const missing = (async () => new Response(null, { status: 404 })) as typeof fetch;

  assert.deepEqual(
    await requestArticle?.("http://localhost:8080" as never, "news" as never, summary.slug as never, ready as never),
    { status: "ready", article: detail },
  );
  assert.deepEqual(
    await requestArticle?.("http://localhost:8080" as never, "news" as never, summary.slug as never, missing as never),
    { status: "not-found" },
  );
});

test("rejects article details that do not match the requested identity", async () => {
  const requestArticle = exported("getArticle");
  const wrongSlug = (async () => new Response(JSON.stringify({
    ...detail,
    slug: "different-article",
  }), { status: 200 })) as typeof fetch;

  assert.deepEqual(
    await requestArticle?.("http://localhost:8080" as never, "news" as never, summary.slug as never, wrongSlug as never),
    { status: "error" },
  );
});

test("returns an error state for unavailable or malformed article responses", async () => {
  const requestArticles = exported("getArticles");
  const requestArticle = exported("getArticle");
  const unavailable = (async () => new Response(null, { status: 503 })) as typeof fetch;
  const malformed = (async () => new Response(JSON.stringify({}), { status: 200 })) as typeof fetch;

  assert.deepEqual(
    await requestArticles?.("http://localhost:8080" as never, "news" as never, 1 as never, unavailable as never),
    { status: "error" },
  );
  assert.deepEqual(
    await requestArticle?.("http://localhost:8080" as never, "news" as never, summary.slug as never, malformed as never),
    { status: "error" },
  );
});

test("uses the requested language and falls back to the available translation", () => {
  const localize = exported("localizeArticle");

  assert.deepEqual(
    localize?.({ ...detail, titleZh: null, bodyMarkdownZh: null } as never, "zh" as never),
    {
      title: { text: detail.titleEn, lang: "en" },
      summary: { text: detail.summaryZh, lang: "zh-CN" },
      bodyMarkdown: { text: detail.bodyMarkdownEn, lang: "en" },
    },
  );
  assert.deepEqual(
    localize?.(detail as never, "en" as never),
    {
      title: { text: detail.titleEn, lang: "en" },
      summary: { text: detail.summaryEn, lang: "en" },
      bodyMarkdown: { text: detail.bodyMarkdownEn, lang: "en" },
    },
  );
});
