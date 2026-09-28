import { isProtectedPath, loginRedirectPath } from "./access-policy.ts";
import { isDemoSessionValue } from "./demo-session.ts";

export function proxyRedirectPath(pathname: string, search: string, sessionValue: string | undefined) {
  if (!isProtectedPath(pathname) || isDemoSessionValue(sessionValue)) return null;
  return loginRedirectPath(pathname, search);
}
