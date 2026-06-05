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

  if (!authCookie) {
    return redirectTo(request, "/login", { next: nextPath });
  }

  let session: CustomerSession;
  try {
    session = JSON.parse(decodeURIComponent(authCookie)) as CustomerSession;
  } catch {
    return redirectTo(request, "/login", { next: nextPath });
  }

  const organizationId = session.organizationId ?? null;

  if (pathname.startsWith("/request/internal") && !organizationId) {
    return redirectTo(request, "/request/external");
  }

  if (pathname.startsWith("/request/external") && organizationId) {
    return redirectTo(request, "/request/internal");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home", "/request/:path*"],
};
