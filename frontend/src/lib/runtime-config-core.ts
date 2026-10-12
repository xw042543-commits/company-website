export type RuntimeEnvironment = Record<string, string | undefined>;

export function resolveApiBaseUrl(
  environment: RuntimeEnvironment,
  nodeEnvironment = environment.NODE_ENV,
): string | undefined {
  const value = environment.API_BASE_URL?.trim();
  if (!value) {
    if (nodeEnvironment === "production") throw new Error("API_BASE_URL is required in production.");
    return undefined;
  }

  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    return value.replace(/\/$/, "");
  } catch {
    throw new Error("API_BASE_URL must be a valid HTTP or HTTPS URL.");
  }
}
