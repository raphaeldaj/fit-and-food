import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";

const PROTECTED = ["/mon-espace", "/admin"];
const ADMIN_ONLY = ["/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!PROTECTED.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("access_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/connexion", req.url));
  }

  try {
    const payload = await verifyAccessToken(token);
    if (ADMIN_ONLY.some((p) => pathname.startsWith(p)) && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/mon-espace", req.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/connexion", req.url));
  }
}

export const config = {
  matcher: ["/mon-espace/:path*", "/admin/:path*"],
};