import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const sessionToken =
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  const { pathname } = req.nextUrl;

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/inbox") ||
    pathname.startsWith("/trends") ||
    pathname.startsWith("/ask") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/settings");

  if (!sessionToken && isProtectedRoute) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (sessionToken && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/inbox/:path*",
    "/trends/:path*",
    "/ask/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
  ],
};
