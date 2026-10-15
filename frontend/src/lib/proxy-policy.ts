import { requestInternalApi } from "./internal-api-request.ts";
import { isAccountManagementPath, isAdminPath, isAdviserPath, isProtectedPath, loginRedirectPath } from "./access-policy.ts";
import { hasAuthenticatedSession, loadSessionAccess, type SessionAccess } from "./auth-session-core.ts";
import { hasDevelopmentDemoSession } from "./demo-session.ts";

export async function loadProxySessionAccess(
  pathname: string, base: string | undefined | (() => string | undefined), cookie: string | null,
  environment: NodeJS.ProcessEnv["NODE_ENV"], request: typeof fetch = fetch, clientAddress?: string | null,
): Promise<SessionAccess> {
  if (!isProtectedPath(pathname)) return { authenticated: false, adviser: false, admin: false };
  const adviserPath = isAdviserPath(pathname);
  const adminPath = isAdminPath(pathname);
  if (!adviserPath && !adminPath && hasDevelopmentDemoSession(cookie, environment)) return { authenticated: true, adviser: false, admin: false };
  const resolvedBase = typeof base === "function" ? base() : base;
  if (adviserPath || adminPath) {
    const access = await loadSessionAccess(resolvedBase, cookie, request, clientAddress);
    if (!isAccountManagementPath(pathname)) return access;
    let advancedAdmin = false;
    if (access.authenticated && access.admin && resolvedBase && cookie) {
      try {
        const response = await requestInternalApi(request, `${resolvedBase.replace(/\/$/, "")}/api/v1/admin/catalog/lifecycle/capabilities`, {
          cache: "no-store", headers: { Cookie: cookie }, signal: AbortSignal.timeout(5_000),
        }, clientAddress);
        if (response.ok) advancedAdmin = (await response.json() as { permanentDelete?: unknown }).permanentDelete === true;
      } catch { /* Fail closed when current capabilities cannot be verified. */ }
    }
    return { ...access, advancedAdmin };
  }
  const authenticated = await hasAuthenticatedSession(resolvedBase, cookie, request, clientAddress);
  return { authenticated, adviser: false, admin: false };
}

export function proxyRedirectPath(pathname: string, search: string, access: boolean | SessionAccess) {
  if (!isProtectedPath(pathname)) return null;
  const authenticated = typeof access === "boolean" ? access : access.authenticated === true;
  if (!authenticated) return loginRedirectPath(pathname, search);
  if (isAdviserPath(pathname) && (typeof access === "boolean" || access.adviser !== true)) {
    return pathname.split("/").filter(Boolean)[0] === "zh" ? "/zh/forbidden" : "/en/forbidden";
  }
  if (isAdminPath(pathname) && (typeof access === "boolean" || access.admin !== true)) {
    return pathname.split("/").filter(Boolean)[0] === "zh" ? "/zh/forbidden" : "/en/forbidden";
  }
  if (isAccountManagementPath(pathname) && (typeof access === "boolean" || access.advancedAdmin !== true)) {
    return pathname.split("/").filter(Boolean)[0] === "zh" ? "/zh/forbidden" : "/en/forbidden";
  }
  return null;
}
