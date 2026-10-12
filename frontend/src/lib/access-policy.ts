import type { Locale } from "./site.ts";

const protectedSections = new Set([
  "account",
  "planning",
  "universities",
  "language",
  "scholarships",
  "news",
  "review",
  "adviser",
]);
const accountSections = new Set(["login", "register", "forgot-password"]);

export function isAdviserPath(pathname: string) {
  const [locale, section] = pathSegments(pathname);
  return (locale === "en" || locale === "zh") && section === "adviser";
}

function pathSegments(pathname: string) {
  return pathname.split(/[?#]/, 1)[0].split("/").filter(Boolean);
}

export function isProtectedPath(pathname: string) {
  const [locale, section] = pathSegments(pathname);
  return (locale === "en" || locale === "zh") && protectedSections.has(section ?? "");
}

export function safeReturnTo(value: string | undefined, locale: Locale) {
  const fallback = `/${locale}`;
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;

  try {
    const parsed = new URL(value, "https://udajo.local");
    if (parsed.origin !== "https://udajo.local") return fallback;
    const [normalizedLocale, section] = pathSegments(parsed.pathname);
    if (normalizedLocale !== locale || !section || accountSections.has(section)) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function loginRedirectPath(pathname: string, search: string) {
  const [locale] = pathSegments(pathname);
  const safeLocale: Locale = locale === "zh" ? "zh" : "en";
  const returnTo = safeReturnTo(`${pathname}${search}`, safeLocale);
  return `/${safeLocale}/login?returnTo=${encodeURIComponent(returnTo)}`;
}

export function signedInLoginDestination(authenticated: boolean, locale: Locale) {
  return authenticated ? `/${locale}/account` : null;
}
