import assert from "node:assert/strict";
import test from "node:test";

import { runLaunchSmoke } from "./launch-smoke.mjs";

test("checks public pages, discovery files, and backend APIs through the frontend origin", async () => {
  const requested = [];
  const fetcher = async (url) => {
    requested.push(url);
    return new Response("ok", { status: 200, headers: { "content-type": "text/plain" } });
  };
  const result = await runLaunchSmoke("https://preview.yangdoujiao.com", fetcher);
  assert.deepEqual(result, { checked: 10, failed: 0 });
  assert.deepEqual(requested, [
    "https://preview.yangdoujiao.com/zh",
    "https://preview.yangdoujiao.com/en",
    "https://preview.yangdoujiao.com/zh/universities",
    "https://preview.yangdoujiao.com/en/universities",
    "https://preview.yangdoujiao.com/zh/login",
    "https://preview.yangdoujiao.com/robots.txt",
    "https://preview.yangdoujiao.com/sitemap.xml",
    "https://preview.yangdoujiao.com/api/v1/catalog/filter-options",
    "https://preview.yangdoujiao.com/api/v1/universities/search?page=1&size=1",
    "https://preview.yangdoujiao.com/api/v1/auth/providers",
  ]);
});

test("fails closed for an invalid origin or unsuccessful endpoint", async () => {
  await assert.rejects(() => runLaunchSmoke("http://public.example", fetch), /HTTPS/);
  await assert.rejects(() => runLaunchSmoke("https://example.com/path", fetch), /origin/);
  await assert.rejects(() => runLaunchSmoke("https://preview.yangdoujiao.com",
    async (url) => new Response("failure", { status: url.endsWith("/en") ? 503 : 200 })), /\/en.*503/);
});
