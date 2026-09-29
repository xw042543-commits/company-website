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

export async function runLaunchSmoke(rawOrigin, fetcher = fetch) {
  const origin = deploymentOrigin(rawOrigin);
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
  }
  return { checked: PATHS.length, failed: 0 };
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
  runLaunchSmoke(origin).then(({ checked }) => {
    console.log(`Launch smoke passed: ${checked} endpoints checked.`);
  }).catch((error) => {
    console.error(`Launch smoke failed: ${safeMessage(error)}`);
    process.exitCode = 1;
  });
}
