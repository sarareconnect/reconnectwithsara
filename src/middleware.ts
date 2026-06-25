import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

const ADMIN_PREFIX = "/admin";
const ENTERPRISE_PREFIX = "/dashboard";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isAdminRoute = pathname.startsWith(ADMIN_PREFIX);
  const isEnterpriseRoute = pathname.startsWith(ENTERPRISE_PREFIX);

  // Unauthenticated → bounce to login (preserving intended destination).
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control.
  if (isAdminRoute && session.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (
    isEnterpriseRoute &&
    (session.role !== "ENTERPRISE_MANAGER" || !session.enterpriseId)
  ) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
