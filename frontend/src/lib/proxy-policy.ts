import { isAdviserPath, isProtectedPath, loginRedirectPath } from "./access-policy.ts";
import { hasAuthenticatedSession, loadSessionAccess, type SessionAccess } from "./auth-session-core.ts";
import { hasDevelopmentDemoSession } from "./demo-session.ts";

export async function loadProxySessionAccess(
  pathname: string, base: string | undefined | (() => string | undefined), cookie: string | null,
  environment: NodeJS.ProcessEnv["NODE_ENV"], request: typeof fetch = fetch, clientAddress?: string | null,
): Promise<SessionAccess> {
  if (!isProtectedPath(pathname)) return { authenticated: false, adviser: false };
  const adviserPath = isAdviserPath(pathname);
  if (!adviserPath && hasDevelopmentDemoSession(cookie, environment)) return { authenticated: true, adviser: false };
  const resolvedBase = typeof base === "function" ? base() : base;
  if (adviserPath) return loadSessionAccess(resolvedBase, cookie, request, clientAddress);
  const authenticated = await hasAuthenticatedSession(resolvedBase, cookie, request, clientAddress);
  return { authenticated, adviser: false };
}

export function proxyRedirectPath(pathname: string, search: string, access: boolean | SessionAccess) {
  if (!isProtectedPath(pathname)) return null;
  const authenticated = typeof access === "boolean" ? access : access.authenticated === true;
  if (!authenticated) return loginRedirectPath(pathname, search);
  if (isAdviserPath(pathname) && (typeof access === "boolean" || access.adviser !== true)) {
    return pathname.split("/").filter(Boolean)[0] === "zh" ? "/zh/forbidden" : "/en/forbidden";
  }
  return null;
}
