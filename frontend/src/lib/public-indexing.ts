export type PublicIndexingConfig = {
  enabled: boolean;
  origin: string;
};

const DEFAULT_ORIGIN = "https://yangdoujiao.com";
const PUBLIC_ROUTES = [
  "/zh",
  "/en",
  "/zh/universities",
  "/en/universities",
  "/zh/about",
  "/en/about",
  "/zh/language",
  "/en/language",
  "/zh/scholarships",
  "/en/scholarships",
  "/zh/programmes",
  "/en/programmes",
  "/zh/news",
  "/en/news",
];

export function resolvePublicIndexing(environment: Record<string, string | undefined>): PublicIndexingConfig {
  const requested = environment.PUBLIC_INDEXING_ENABLED === "true";
  const origin = approvedOrigin(environment.PUBLIC_SITE_URL) ?? DEFAULT_ORIGIN;
  return {
    enabled: requested && approvedOrigin(environment.PUBLIC_SITE_URL) !== null,
    origin,
  };
}

export function buildRobotsText(config: PublicIndexingConfig): string {
  if (!config.enabled) return "User-agent: *\nDisallow: /\n";
  return `User-agent: *\nAllow: /\nSitemap: ${config.origin}/sitemap.xml\n`;
}

export function buildSitemapXml(config: PublicIndexingConfig): string {
  const urls = config.enabled
    ? PUBLIC_ROUTES.map((route) => `<url><loc>${config.origin}${route}</loc></url>`).join("")
    : "";
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

function approvedOrigin(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || url.username || url.password || url.port
        || (url.pathname !== "/" && url.pathname !== "") || url.search || url.hash
        || (host !== "yangdoujiao.com" && !host.endsWith(".yangdoujiao.com"))) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}
