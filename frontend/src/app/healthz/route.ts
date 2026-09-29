import { NextResponse } from "next/server";

import { checkBackendReadiness } from "@/lib/frontend-readiness";
import { serverApiBaseUrl } from "@/lib/runtime-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const ready = await checkBackendReadiness(serverApiBaseUrl());
  return NextResponse.json(
    { status: ready ? "UP" : "DOWN" },
    { status: ready ? 200 : 503 },
  );
}
