export function browserApiBaseUrl(): string | undefined {
  return typeof window === "undefined" ? undefined : window.location.origin;
}
