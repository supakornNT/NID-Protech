import { NextResponse, type NextRequest } from "next/server";

type CustomerSession = {
  organizationId?: number | null;
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
).replace(/\/$/, "");

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
  const cookie = request.headers.get("cookie");
  const nextPath = `${pathname}${request.nextUrl.search}`;

  if (!cookie) {
    return redirectTo(request, "/login", { next: nextPath });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me/customer`, {
      cache: "no-store",
      headers: {
        cookie,
      },
    });

    if (!response.ok) {
      return redirectTo(request, "/login", { next: nextPath });
    }

    const session = (await response.json()) as CustomerSession;
    const organizationId = session.organizationId ?? null;

    if (pathname.startsWith("/request/internal") && !organizationId) {
      return redirectTo(request, "/request/external");
    }

    if (pathname.startsWith("/request/external") && organizationId) {
      return redirectTo(request, "/request/internal");
    }

    return NextResponse.next();
  } catch {
    return redirectTo(request, "/login", { next: nextPath });
  }
}

export const config = {
  matcher: ["/home", "/track/:path*", "/request/:path*"],
};
