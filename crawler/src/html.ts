const ENTITIES: Record<string, string> = {
  amp: "&", apos: "'", gt: ">", lt: "<", nbsp: " ", quot: "\"",
};

export function decodeHtml(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, key: string) => {
    if (key.startsWith("#x")) return String.fromCodePoint(Number.parseInt(key.slice(2), 16));
    if (key.startsWith("#")) return String.fromCodePoint(Number.parseInt(key.slice(1), 10));
    return ENTITIES[key.toLowerCase()] ?? entity;
  });
}

export function plainText(value: string): string {
  return decodeHtml(value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ").trim();
}

export function titleOf(html: string): string | null {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return match ? plainText(match[1]) || null : null;
}

export function metaContent(html: string, key: string): string | null {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const name = attribute(tag, "name") ?? attribute(tag, "property");
    if (name?.toLowerCase() === key.toLowerCase()) return attribute(tag, "content");
  }
  return null;
}

export function linksOf(html: string, baseUrl: string): string[] {
  const links = new Set<string>();
  for (const match of html.matchAll(/<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
    try {
      const url = new URL(decodeHtml(match[1] ?? match[2] ?? match[3]), baseUrl);
      url.hash = "";
      if (url.protocol === "http:" || url.protocol === "https:") links.add(url.href);
    } catch { /* malformed links are ignored */ }
  }
  return [...links];
}

export function jsonLdOf(html: string): unknown[] {
  const values: unknown[] = [];
  for (const match of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (Array.isArray(parsed)) values.push(...parsed); else values.push(parsed);
    } catch { /* invalid publisher markup is retained in the page snapshot */ }
  }
  return values.flatMap(flattenJsonLd);
}

function flattenJsonLd(value: unknown): unknown[] {
  if (!value || typeof value !== "object") return [];
  const object = value as Record<string, unknown>;
  if (Array.isArray(object["@graph"])) return [object, ...object["@graph"].flatMap(flattenJsonLd)];
  return [object];
}

function attribute(tag: string, name: string): string | null {
  const expression = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const match = tag.match(expression);
  return match ? decodeHtml(match[1] ?? match[2] ?? match[3]) : null;
}
