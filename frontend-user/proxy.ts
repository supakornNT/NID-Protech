import { NextResponse, type NextRequest } from "next/server";

type CustomerSession = {
  organizationId?: number | null;
};


function redirectTo(
  request: NextRequest,
  pathname: string,
  options?: { next?: string },
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;

  if (options?.next) {
    url.searchParams.set("next", options.next);
  }

  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nextPath = `${pathname}${request.nextUrl.search}`;

  const authCookie = request.cookies.get("protech_user_auth")?.value;

  console.log("[Middleware User] Request path:", pathname);
  console.log("[Middleware User] Raw cookie length:", authCookie ? authCookie.length : "undefined/missing");

  if (!authCookie) {
    console.log("[Middleware User] Redirecting to /login because cookie is missing");
    return redirectTo(request, "/login", { next: nextPath });
  }

  let session: CustomerSession;
  try {
    session = JSON.parse(decodeURIComponent(authCookie)) as CustomerSession;
    console.log("[Middleware User] Parsed session customer organizationId:", session?.organizationId);
  } catch (err) {
    console.log("[Middleware User] Redirecting to /login because JSON parse failed:", err);
    return redirectTo(request, "/login", { next: nextPath });
  }

  const organizationId = session.organizationId ?? null;

  if (pathname.startsWith("/request/internal") && !organizationId) {
    console.log("[Middleware User] Internal request without organizationId - Redirecting to external");
    return redirectTo(request, "/request/external");
  }

  if (pathname.startsWith("/request/external") && organizationId) {
    console.log("[Middleware User] External request with organizationId - Redirecting to internal");
    return redirectTo(request, "/request/internal");
  }

  console.log("[Middleware User] Allowing request to", pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ["/home", "/request/:path*"],
};
