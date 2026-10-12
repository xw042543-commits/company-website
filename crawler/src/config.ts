import { readFile } from "node:fs/promises";
import type { CrawlerConfig, SourceDefinition } from "./types.ts";

const KEY = /^[a-z0-9][a-z0-9_-]{1,63}$/;

export async function loadConfig(path: string): Promise<CrawlerConfig> {
  const parsed: unknown = JSON.parse(await readFile(path, "utf8"));
  if (!parsed || typeof parsed !== "object") throw new Error("配置文件必须是 JSON 对象");
  const value = parsed as Partial<CrawlerConfig>;
  if (typeof value.userAgent !== "string" || value.userAgent.trim().length < 10) {
    throw new Error("userAgent 必须标识爬虫并提供真实联系方式");
  }
  if (!Number.isInteger(value.requestDelayMs) || (value.requestDelayMs ?? 0) < 1000) {
    throw new Error("requestDelayMs 必须是至少 1000 的整数");
  }
  if (!Number.isInteger(value.maxPagesPerSource) || (value.maxPagesPerSource ?? 0) < 1 || (value.maxPagesPerSource ?? 0) > 500) {
    throw new Error("maxPagesPerSource 必须是 1 到 500 的整数");
  }
  if (!Array.isArray(value.sources) || value.sources.length === 0) throw new Error("至少配置一个来源");
  value.sources.forEach(validateSource);
  return value as CrawlerConfig;
}

function validateSource(source: SourceDefinition, index: number): void {
  if (!source || typeof source !== "object") throw new Error(`sources[${index}] 格式错误`);
  if (!KEY.test(source.sourceKey)) throw new Error(`sources[${index}].sourceKey 格式错误`);
  if (typeof source.displayName !== "string" || !source.displayName.trim()) throw new Error(`sources[${index}].displayName 不能为空`);
  if (!Array.isArray(source.allowedHosts) || source.allowedHosts.length === 0) throw new Error(`sources[${index}].allowedHosts 不能为空`);
  if (!Array.isArray(source.seedUrls) || source.seedUrls.length === 0) throw new Error(`sources[${index}].seedUrls 不能为空`);
  const hosts = new Set(source.allowedHosts.map((host) => host.toLowerCase()));
  for (const seed of source.seedUrls) {
    const url = new URL(seed);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error(`仅支持 HTTP(S): ${seed}`);
    if (url.username || url.password) throw new Error(`URL 不得包含账号信息: ${seed}`);
    if (!hosts.has(url.hostname.toLowerCase())) throw new Error(`种子网址不在 allowedHosts 中: ${seed}`);
  }
}
