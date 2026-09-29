import { isProtectedPath, loginRedirectPath } from "./access-policy.ts";

export function proxyRedirectPath(pathname: string, search: string, authenticated: boolean) {
  if (!isProtectedPath(pathname) || authenticated) return null;
  return loginRedirectPath(pathname, search);
}
