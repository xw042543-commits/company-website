const IPV4 = /^(?:0|[1-9]\d{0,2})(?:\.(?:0|[1-9]\d{0,2})){3}$/;
const IPV6 = /^[0-9a-f:.]+$/i;

export function sanitizeClientAddress(value: string | null | undefined): string | undefined {
  const candidate = value?.trim();
  if (!candidate || candidate.includes(",")) return undefined;
  if (IPV4.test(candidate)) {
    return candidate.split(".").every((part) => Number(part) <= 255) ? candidate : undefined;
  }
  return candidate.includes(":") && IPV6.test(candidate) ? candidate : undefined;
}

export function internalApiRequestInit(
  init: RequestInit = {},
  clientAddress?: string | null,
): RequestInit {
  const headers = new Headers(init.headers);
  headers.set("X-Forwarded-Proto", "https");
  const sanitizedAddress = sanitizeClientAddress(clientAddress);
  if (sanitizedAddress) headers.set("X-Forwarded-For", sanitizedAddress);
  else headers.delete("X-Forwarded-For");
  return { ...init, headers };
}

export function requestInternalApi(
  request: typeof fetch,
  input: string | URL | Request,
  init: RequestInit = {},
  clientAddress?: string | null,
) {
  return request(input, internalApiRequestInit(init, clientAddress));
}
