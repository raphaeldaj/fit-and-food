import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";

const AUTH_ONLY_PAGES = ["/connexion", "/inscription", "/verification-2fa"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("access_token")?.value;

  // Pas connecté : seules les pages nécessitant un compte sont bloquées
  if (!token) {
    if (pathname.startsWith("/mon-espace") || pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/connexion", req.url));
    }
    return NextResponse.next();
  }

  try {
    const payload = await verifyAccessToken(token);
    const isAdmin = payload.role === "ADMIN";

    if (isAdmin) {
      if (!pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    } else {
      if (pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/mon-espace", req.url));
      }
      if (AUTH_ONLY_PAGES.includes(pathname)) {
        return NextResponse.redirect(new URL("/mon-espace", req.url));
      }
    }

    return NextResponse.next();
  } catch {
    if (pathname.startsWith("/mon-espace") || pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/connexion", req.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};