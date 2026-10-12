import { internalApiRequestInit, sanitizeClientAddress } from "./internal-api-request.ts";

const HOP_BY_HOP_HEADERS = [
  "connection",
  "content-length",
  "forwarded",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "x-forwarded-for",
  "x-forwarded-proto",
  "x-real-ip",
];

function cleanHeaders(source: Headers): Headers {
  const headers = new Headers(source);
  for (const name of HOP_BY_HOP_HEADERS) headers.delete(name);
  return headers;
}

export async function proxyBackendApiRequest(
  request: Request,
  apiBaseUrl: string,
  path: string[],
  requestBackend: typeof fetch = fetch,
): Promise<Response> {
  const incomingHeaders = new Headers(request.headers);
  const clientAddress = sanitizeClientAddress(incomingHeaders.get("x-forwarded-for"));
  const headers = new Headers(internalApiRequestInit({ headers: cleanHeaders(incomingHeaders) }, clientAddress).headers);
  headers.set("Accept-Encoding", "identity");

  const target = new URL(`${apiBaseUrl.replace(/\/$/, "")}/api/${path.map(encodeURIComponent).join("/")}`);
  target.search = new URL(request.url).search;
  const method = request.method.toUpperCase();
  const init: RequestInit & { duplex?: "half" } = {
    method,
    headers,
    redirect: "manual",
    signal: request.signal,
  };
  if (method !== "GET" && method !== "HEAD" && request.body) {
    init.body = request.body;
    init.duplex = "half";
  }

  const backendResponse = await requestBackend(target, init);
  return new Response(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: cleanHeaders(backendResponse.headers),
  });
}
