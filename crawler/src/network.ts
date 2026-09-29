import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export async function assertPublicUrl(url: URL): Promise<void> {
  if (!(["http:", "https:"] as string[]).includes(url.protocol)) throw new Error(`不支持的协议: ${url.protocol}`);
  if (url.username || url.password) throw new Error("网址不得包含账号信息");
  const records = await lookup(url.hostname, { all: true, verbatim: true });
  if (records.length === 0 || records.some((record) => isPrivateAddress(record.address))) throw new Error(`拒绝访问非公网地址: ${url.hostname}`);
}

export async function fetchPublic(url: URL, init: RequestInit, allowedHosts: Set<string>, redirects = 0): Promise<Response> {
  if (!allowedHosts.has(url.hostname.toLowerCase())) throw new Error(`跳转超出允许域名: ${url.hostname}`);
  await assertPublicUrl(url);
  const response = await fetch(url, { ...init, redirect: "manual", signal: AbortSignal.timeout(20_000) });
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    if (redirects >= 5) throw new Error("重定向次数超过 5 次");
    const location = response.headers.get("location");
    if (!location) throw new Error("重定向响应缺少 Location");
    return fetchPublic(new URL(location, url), init, allowedHosts, redirects + 1);
  }
  return response;
}

export async function readTextLimited(response: Response, maximumBytes: number): Promise<string> {
  const declared = Number(response.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maximumBytes) throw new Error(`响应超过 ${maximumBytes} 字节上限`);
  if (!response.body) return "";
  const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximumBytes) throw new Error(`响应超过 ${maximumBytes} 字节上限`);
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(bytes);
}

export function isPrivateAddress(address: string): boolean {
  if (isIP(address) === 4) {
    const [a, b] = address.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
  }
  const normalized = address.toLowerCase();
  if (normalized.startsWith("::ffff:") && isIP(normalized.slice(7)) === 4) return isPrivateAddress(normalized.slice(7));
  return normalized === "::" || normalized === "::1" || normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb") || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("ff");
}
