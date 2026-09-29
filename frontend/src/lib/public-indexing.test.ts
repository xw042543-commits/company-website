import assert from "node:assert/strict";
import test from "node:test";

import { isProtectedPath } from "./access-policy.ts";
import {
  buildRobotsText,
  buildSitemapXml,
  PUBLIC_INDEX_ROUTES,
  resolvePublicIndexing,
} from "./public-indexing.ts";

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
  assert.deepEqual(PUBLIC_INDEX_ROUTES, ["/zh", "/en", "/zh/about", "/en/about"]);
  assert.equal(PUBLIC_INDEX_ROUTES.some(isProtectedPath), false);
  for (const route of PUBLIC_INDEX_ROUTES) {
    assert.match(sitemap, new RegExp(`<loc>https://yangdoujiao\\.com${route}</loc>`));
  }
  assert.doesNotMatch(sitemap, /universities|language|scholarships|news|programmes|login|account/);
});
