import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { extractProgrammes, extractUniversity, mergeProgrammeCandidates } from "./extract.ts";
import { linksOf, titleOf } from "./html.ts";
import { fetchPublic, readTextLimited } from "./network.ts";
import { mayFetch, parseRobots, type RobotsPolicy } from "./robots.ts";
import type { CrawlerConfig, PageSnapshot, ReviewBundle, SourceDefinition } from "./types.ts";

export async function crawlAll(config: CrawlerConfig, outputRoot: string): Promise<ReviewBundle[]> {
  const run = new Date().toISOString().replace(/[:.]/g, "-");
  const root = path.resolve(outputRoot, run);
  await mkdir(root, { recursive: true });
  const bundles: ReviewBundle[] = [];
  for (const source of config.sources) bundles.push(await crawlSource(config, source, root));
  await writeFile(path.join(root, "manifest.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), sources: bundles.map((b) => ({ sourceKey: b.sourceKey, pages: b.pages.length, programmes: b.programmes.length, warnings: b.warnings.length })) }, null, 2)}\n`);
  return bundles;
}

async function crawlSource(config: CrawlerConfig, source: SourceDefinition, runRoot: string): Promise<ReviewBundle> {
  const sourceRoot = path.join(runRoot, source.sourceKey); const rawRoot = path.join(sourceRoot, "raw");
  await mkdir(rawRoot, { recursive: true });
  const allowedHosts = new Set(source.allowedHosts.map((host) => host.toLowerCase()));
  const queue = [...source.seedUrls]; const visited = new Set<string>(); const pages: PageSnapshot[] = []; const warnings: string[] = [];
  const policies = new Map<string, RobotsPolicy>(); let lastRequestAt = 0;
  while (queue.length && pages.length < config.maxPagesPerSource) {
    const current = new URL(queue.shift()!); current.hash = "";
    if (visited.has(current.href) || !allowedHosts.has(current.hostname.toLowerCase())) continue;
    visited.add(current.href);
    try {
      let policy = policies.get(current.origin);
      if (!policy) { policy = await loadRobots(current, config.userAgent, allowedHosts); policies.set(current.origin, policy); }
      if (!mayFetch(policy, current)) { warnings.push(`robots.txt 禁止抓取：${current.href}`); continue; }
      const delay = Math.max(config.requestDelayMs, policy.crawlDelayMs ?? 0);
      await wait(Math.max(0, lastRequestAt + delay - Date.now())); lastRequestAt = Date.now();
      const response = await fetchPublic(current, { headers: { "user-agent": config.userAgent, accept: "text/html,application/xhtml+xml" } }, allowedHosts);
      const contentType = response.headers.get("content-type") ?? "";
      if (!response.ok) { warnings.push(`HTTP ${response.status}：${current.href}`); continue; }
      if (!contentType.toLowerCase().includes("text/html")) { warnings.push(`跳过非 HTML 内容：${current.href}`); continue; }
      const html = await readTextLimited(response, 5_000_000); const fetchedAt = new Date().toISOString();
      const page: PageSnapshot = { url: response.url || current.href, fetchedAt, status: response.status, contentType, sha256: createHash("sha256").update(html).digest("hex"), title: titleOf(html), html };
      pages.push(page); visited.add(page.url);
      for (const link of linksOf(html, page.url)) if (allowedHosts.has(new URL(link).hostname.toLowerCase()) && !visited.has(link) && !queue.includes(link)) queue.push(link);
      queue.sort((left, right) => linkPriority(right) - linkPriority(left));
    } catch (error) { warnings.push(`${current.href}：${error instanceof Error ? error.message : String(error)}`); }
  }
  const pageRecords: ReviewBundle["pages"] = [];
  for (let index = 0; index < pages.length; index++) {
    const file = `${String(index + 1).padStart(4, "0")}-${pages[index].sha256.slice(0, 12)}.html`;
    await writeFile(path.join(rawRoot, file), pages[index].html);
    const { html: _html, ...metadata } = pages[index]; pageRecords.push({ ...metadata, snapshotFile: `raw/${file}` });
  }
  const programmes = mergeProgrammeCandidates(pages.flatMap((page) => extractProgrammes(page, source)));
  const bundle: ReviewBundle = { schemaVersion: "1.0", generatedAt: new Date().toISOString(), sourceKey: source.sourceKey, sourceName: source.displayName, warnings, university: pages[0] ? extractUniversity(pages[0], source) : null, programmes, pages: pageRecords };
  await writeFile(path.join(sourceRoot, "review-bundle.json"), `${JSON.stringify(bundle, null, 2)}\n`);
  return bundle;
}

async function loadRobots(url: URL, userAgent: string, hosts: Set<string>): Promise<RobotsPolicy> {
  const robotsUrl = new URL("/robots.txt", url.origin);
  const response = await fetchPublic(robotsUrl, { headers: { "user-agent": userAgent, accept: "text/plain" } }, hosts);
  if (response.status === 404 || response.status === 410) return { rules: [], crawlDelayMs: null };
  if (!response.ok) throw new Error(`无法确认 robots.txt（HTTP ${response.status}），本来源停止抓取`);
  return parseRobots(await readTextLimited(response, 512_000), userAgent);
}

function deduplicate<T>(items: T[], key: (item: T) => string): T[] { const seen = new Set<string>(); return items.filter((item) => { const value = key(item); if (seen.has(value)) return false; seen.add(value); return true; }); }
function wait(milliseconds: number): Promise<void> { return new Promise((resolve) => setTimeout(resolve, milliseconds)); }
function linkPriority(value: string): number {
  const path = new URL(value).pathname.toLowerCase(); let score = 0;
  if (path.includes("undergraduate")) score += 10;
  if (/bachelor|programme|program|course|facult/.test(path)) score += 6;
  if (/scholarship|admission|apply|news|contact|faq|privacy|login/.test(path)) score -= 8;
  if (/\.pdf$/i.test(path)) score -= 4;
  return score;
}
