import { NextResponse, type NextRequest } from "next/server";

import { proxyBackendApiRequest } from "@/lib/backend-api-proxy";
import { serverApiBaseUrl } from "@/lib/runtime-config";

type ApiRouteContext = { params: Promise<{ path: string[] }> };

async function proxyApi(request: NextRequest, context: ApiRouteContext) {
  const apiBaseUrl = serverApiBaseUrl();
  if (!apiBaseUrl) return NextResponse.json({ message: "API unavailable" }, { status: 503 });
  try {
    const { path } = await context.params;
    return await proxyBackendApiRequest(request, apiBaseUrl, path);
  } catch {
    return NextResponse.json({ message: "API unavailable" }, { status: 502 });
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export { proxyApi as DELETE, proxyApi as GET, proxyApi as OPTIONS, proxyApi as PATCH, proxyApi as POST, proxyApi as PUT };
