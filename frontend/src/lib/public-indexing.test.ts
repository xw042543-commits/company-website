import assert from "node:assert/strict";
import test from "node:test";

import { buildRobotsText, buildSitemapXml, resolvePublicIndexing } from "./public-indexing.ts";

test("keeps indexing disabled unless the launch flag is exactly true", () => {
  assert.deepEqual(resolvePublicIndexing({}), {
    enabled: false,
    origin: "https://yangdoujiao.com",
  });
  assert.equal(resolvePublicIndexing({ PUBLIC_INDEXING_ENABLED: "TRUE" }).enabled, false);
});

test("accepts an approved HTTPS UDAJO origin when indexing is enabled", () => {
  assert.deepEqual(resolvePublicIndexing({
    PUBLIC_INDEXING_ENABLED: "true",
    PUBLIC_SITE_URL: "https://www.yangdoujiao.com/",
  }), {
    enabled: true,
    origin: "https://www.yangdoujiao.com",
  });
  assert.equal(resolvePublicIndexing({
    PUBLIC_INDEXING_ENABLED: "true",
    PUBLIC_SITE_URL: "https://evil.example",
  }).enabled, false);
});

test("robots and sitemap stay closed in preview and expose canonical public routes after launch", () => {
  const preview = resolvePublicIndexing({});
  assert.match(buildRobotsText(preview), /Disallow: \//);
  assert.doesNotMatch(buildRobotsText(preview), /Sitemap:/);

  const live = resolvePublicIndexing({
    PUBLIC_INDEXING_ENABLED: "true",
    PUBLIC_SITE_URL: "https://yangdoujiao.com",
  });
  assert.match(buildRobotsText(live), /Allow: \//);
  assert.match(buildRobotsText(live), /Sitemap: https:\/\/yangdoujiao\.com\/sitemap\.xml/);
  const sitemap = buildSitemapXml(live);
  assert.match(sitemap, /<loc>https:\/\/yangdoujiao\.com\/zh<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/yangdoujiao\.com\/en\/universities<\/loc>/);
  assert.doesNotMatch(sitemap, /\/login|\/account/);
});
