import { NextResponse, type NextRequest } from "next/server";
import { isProtectedPath } from "@/lib/access-policy";
import { hasAuthenticatedSession } from "@/lib/auth-session-core";
import { proxyRedirectPath } from "@/lib/proxy-policy";
import { resolveApiBaseUrl } from "@/lib/runtime-config-core";
import { DEMO_SESSION_COOKIE } from "@/lib/demo-session";

export async function proxy(request: NextRequest) {
  const protectedPath = isProtectedPath(request.nextUrl.pathname);
  const authenticated = protectedPath
    ? (process.env.NODE_ENV !== "production" && request.cookies.get(DEMO_SESSION_COOKIE)?.value === "1") || await hasAuthenticatedSession(
        resolveApiBaseUrl(process.env, process.env.NODE_ENV),
        request.headers.get("cookie"),
        fetch,
        request.headers.get("x-forwarded-for"),
      )
    : false;
  const redirectPath = proxyRedirectPath(
    request.nextUrl.pathname,
    request.nextUrl.search,
    authenticated,
  );

  return redirectPath
    ? NextResponse.redirect(new URL(redirectPath, request.url))
    : NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
