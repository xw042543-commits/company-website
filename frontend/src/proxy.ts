import { NextResponse, type NextRequest } from "next/server";
import { isAdviserPath } from "@/lib/access-policy";
import { loadProxySessionAccess, proxyRedirectPath } from "@/lib/proxy-policy";
import { resolveApiBaseUrl } from "@/lib/runtime-config-core";

export async function proxy(request: NextRequest) {
  const access = await loadProxySessionAccess(
    request.nextUrl.pathname,
    () => resolveApiBaseUrl(process.env, process.env.NODE_ENV),
    request.headers.get("cookie"),
    process.env.NODE_ENV,
    fetch,
    request.headers.get("x-forwarded-for"),
  );
  const redirectPath = proxyRedirectPath(
    request.nextUrl.pathname,
    request.nextUrl.search,
    access,
  );

  const response = redirectPath
    ? NextResponse.redirect(new URL(redirectPath, request.url))
    : NextResponse.next();
  if (isAdviserPath(request.nextUrl.pathname)) response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
