import "server-only";

import { resolveApiBaseUrl } from "./runtime-config-core";

export function serverApiBaseUrl(): string | undefined {
  return resolveApiBaseUrl(process.env, process.env.NODE_ENV);
}
