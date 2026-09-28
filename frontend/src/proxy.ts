import { NextResponse, type NextRequest } from "next/server";
import { DEMO_SESSION_COOKIE } from "@/lib/demo-session";
import { proxyRedirectPath } from "@/lib/proxy-policy";

export function proxy(request: NextRequest) {
  const redirectPath = proxyRedirectPath(
    request.nextUrl.pathname,
    request.nextUrl.search,
    request.cookies.get(DEMO_SESSION_COOKIE)?.value,
  );

  return redirectPath
    ? NextResponse.redirect(new URL(redirectPath, request.url))
    : NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
