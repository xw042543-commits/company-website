import assert from "node:assert/strict";
import test from "node:test";

import { curatedArticle, curatedArticles } from "./curated-articles.ts";

test("reviewed fallback content has complete bilingual copy and HTTPS sources", () => {
  for (const section of ["language", "scholarships", "news"] as const) {
    const articles = curatedArticles(section);
    assert.ok(articles.length > 0);
    for (const article of articles) {
      assert.ok(article.titleZh?.trim());
      assert.ok(article.titleEn?.trim());
      assert.ok(article.summaryZh?.trim());
      assert.ok(article.summaryEn?.trim());
      assert.ok(article.bodyMarkdownZh?.trim());
      assert.ok(article.bodyMarkdownEn?.trim());
      assert.match(article.sourceUrl ?? "", /^https:\/\//);
      assert.equal(curatedArticle(section, article.slug)?.slug, article.slug);
    }
  }
});
