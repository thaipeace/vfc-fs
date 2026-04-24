import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import { Role } from "@prisma/client";

// Route protection config
const PUBLIC_PATHS = ["/", "/login", "/api/auth/otp/send", "/api/auth/otp/verify"];
const ROLE_PATHS: Record<string, Role[]> = {
  "/admin": [Role.ADMIN],
  "/api/admin": [Role.ADMIN],
  "/sale": [Role.SALE, Role.ADMIN],
  "/api/sale": [Role.SALE, Role.ADMIN],
};

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (matchesPrefix(pathname, PUBLIC_PATHS)) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? verifyToken(token) : null;

  // Not authenticated → redirect to login
  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access
  for (const [prefix, allowedRoles] of Object.entries(ROLE_PATHS)) {
    if (pathname.startsWith(prefix) && !allowedRoles.includes(session.role)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/403", request.url));
    }
  }

  // Inject user info into headers for route handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", session.sub);
  requestHeaders.set("x-user-role", session.role);
  requestHeaders.set("x-user-phone", session.phone);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
