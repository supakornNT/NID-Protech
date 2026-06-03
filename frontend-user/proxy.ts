import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Get the organization_id cookie
  const orgIdCookie = request.cookies.get("organization_id");
  const orgId = orgIdCookie?.value;

  // 2. Perform checks for internal module routing
  if (pathname.startsWith("/request/internal")) {
    if (!orgId) {
      const url = request.nextUrl.clone();
      url.pathname = "/request/external";
      return NextResponse.redirect(url);
    }
  }

  // 3. Perform checks for external/public module routing
  if (pathname.startsWith("/request/external")) {
    if (orgId) {
      const url = request.nextUrl.clone();
      url.pathname = "/request/internal";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/request/internal", "/request/external"],
};
