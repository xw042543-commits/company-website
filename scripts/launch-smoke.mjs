import { pathToFileURL } from "node:url";

const PATHS = [
  "/zh",
  "/en",
  "/zh/universities",
  "/en/universities",
  "/zh/login",
  "/robots.txt",
  "/sitemap.xml",
  "/api/v1/catalog/filter-options",
  "/api/v1/universities/search?page=1&size=1",
  "/api/v1/auth/providers",
];

export async function runLaunchSmoke(rawOrigin, fetcher = fetch, expectations = {}) {
  const origin = deploymentOrigin(rawOrigin);
  const expected = {
    indexing: expectations.indexing === true,
    wechat: expectations.wechat === true,
  };
  const bodies = new Map();
  for (const path of PATHS) {
    const url = `${origin}${path}`;
    let response;
    try {
      response = await fetcher(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(10_000),
        headers: { "user-agent": "udajo-launch-smoke/1" },
      });
    } catch (error) {
      throw new Error(`${path} request failed: ${safeMessage(error)}`);
    }
    if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}`);
    if (["/zh", "/robots.txt", "/sitemap.xml", "/api/v1/auth/providers"].includes(path)) {
      bodies.set(path, await response.text());
    }
  }
  assertLaunchGates(origin, bodies, expected);
  return { checked: PATHS.length, failed: 0 };
}

function assertLaunchGates(origin, bodies, expected) {
  const page = bodies.get("/zh") ?? "";
  const robots = bodies.get("/robots.txt") ?? "";
  const sitemap = bodies.get("/sitemap.xml") ?? "";
  let providers;
  try {
    providers = JSON.parse(bodies.get("/api/v1/auth/providers") ?? "");
  } catch {
    throw new Error("/api/v1/auth/providers returned malformed JSON");
  }
  if (providers === null || typeof providers !== "object" || providers.wechat !== expected.wechat) {
    throw new Error(`/api/v1/auth/providers expected wechat=${expected.wechat}`);
  }

  if (!expected.indexing) {
    if (!/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(page)) {
      throw new Error("/zh must contain noindex metadata in private-preview mode");
    }
    if (!/^Disallow:\s*\/$/im.test(robots)) {
      throw new Error("/robots.txt must disallow all crawling in private-preview mode");
    }
    if (/<url>/i.test(sitemap)) {
      throw new Error("/sitemap.xml must be empty in private-preview mode");
    }
    return;
  }

  if (!/name=["']robots["'][^>]*content=["'][^"']*\bindex\b/i.test(page)
      || /name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(page)) {
    throw new Error("/zh must contain indexable robots metadata in public mode");
  }
  if (!/^Allow:\s*\/$/im.test(robots) || !robots.includes(`Sitemap: ${origin}/sitemap.xml`)) {
    throw new Error("/robots.txt must allow crawling and reference the canonical sitemap in public mode");
  }
  if (!/<url>/i.test(sitemap) || !sitemap.includes(`<loc>${origin}/</loc>`)) {
    throw new Error("/sitemap.xml must contain the canonical Chinese homepage in public mode");
  }
}

function deploymentOrigin(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Launch smoke requires a valid HTTPS origin.");
  }
  if (url.protocol !== "https:") throw new Error("Launch smoke requires HTTPS.");
  if (url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("Launch smoke requires an origin without credentials, path, query, or fragment.");
  }
  return url.origin;
}

function safeMessage(error) {
  return error instanceof Error ? error.message.replace(/[\r\n]/g, " ") : "unknown error";
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const origin = process.argv[2] ?? process.env.PUBLIC_SITE_URL;
  const expectations = {
    indexing: process.argv.includes("--public"),
    wechat: process.argv.includes("--wechat"),
  };
  runLaunchSmoke(origin, fetch, expectations).then(({ checked }) => {
    console.log(`Launch smoke passed: ${checked} endpoints checked.`);
  }).catch((error) => {
    console.error(`Launch smoke failed: ${safeMessage(error)}`);
    process.exitCode = 1;
  });
}
