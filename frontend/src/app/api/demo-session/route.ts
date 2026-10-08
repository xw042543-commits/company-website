import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEMO_SESSION_COOKIE } from "@/lib/demo-session";

function unavailable() {
  return NextResponse.json({ message: "Not found" }, { status: 404 });
}
export async function GET() {
  if (process.env.NODE_ENV === "production" || (await cookies()).get(DEMO_SESSION_COOKIE)?.value !== "1") return unavailable();
  return NextResponse.json({
    id: 1,
    fullName: "UDAJO Demo Student",
    email: "demo@udajo.local",
    phone: null,
    emailVerified: true,
    phoneVerified: false,
    wechatLinked: false,
    wechatDisplayName: null,
    wechatAvatarUrl: null,
    wechatLastLoginAt: null,
    createdAt: "2026-09-30T00:00:00.000Z",
  });
}

export async function POST() {
  if (process.env.NODE_ENV === "production") return unavailable();
  const response = NextResponse.json({ authenticated: true, fullName: "UDAJO Demo Student" });
  response.cookies.set(DEMO_SESSION_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}

export async function DELETE() {
  if (process.env.NODE_ENV === "production") return unavailable();
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(DEMO_SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
