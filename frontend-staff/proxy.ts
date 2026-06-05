import { NextResponse, type NextRequest } from "next/server";

type StaffSession = {
  id?: number | string;
  modules?: {
    key: string;
    children: {
      key: string;
    }[];
  }[];
};


const LAST_ALLOWED_PATH_COOKIE = "protech_staff_last_allowed_path";

const ROUTE_PERMISSION_RULES = [
  { path: "/screening/issues", permission: "screening.issue.view" },
  { path: "/screening/complaints", permission: "screening.complaint.view" },
  { path: "/consideration/issue-work", permission: "assignment.ticket.approve" },
  { path: "/consideration/close-work", permission: "assignment.request.approve" },
  { path: "/tracking/status", permission: "tracking.status.view" },
  { path: "/operations", permission: "operation.result.view" },
  { path: "/reports/executive", permission: "report.dashboard.view" },
  { path: "/reports/operations", permission: "report.operation.view" },
  { path: "/reports/edit-history", permission: "report.history.view" },
  { path: "/reports/login-history", permission: "report.login_log.view" },
  { path: "/management/organizations", permission: "admin.organization.manage" },
  { path: "/management/systems", permission: "admin.system.manage" },
  { path: "/management/reporters", permission: "admin.customer.manage" },
  { path: "/management/teams", permission: "admin.staff.manage" },
  { path: "/management/user-groups", permission: "admin.team.manage" },
  { path: "/management/permissions", permission: "admin.permission.manage" },
  { path: "/management/users", permission: "admin.user.manage" },
  {
    path: "/management/issue-and-complaint-types",
    permission: "admin.problem_type.manage",
  },
] as const;

function findRequiredPermission(pathname: string) {
  return ROUTE_PERMISSION_RULES.find(
    (rule) => pathname === rule.path || pathname.startsWith(`${rule.path}/`),
  )?.permission;
}

function getAllowedPermissions(session: StaffSession) {
  if (!session) return new Set<string>();
  return new Set(
    (session.modules ?? []).flatMap((module) =>
      (module?.children ?? []).map((permission) => permission?.key).filter(Boolean),
    ),
  );
}

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

function getRedirectBackPath(request: NextRequest) {
  const lastAllowedPath = request.cookies.get(LAST_ALLOWED_PATH_COOKIE)?.value;
  const currentPath = request.nextUrl.pathname;

  if (
    lastAllowedPath &&
    lastAllowedPath.startsWith("/") &&
    lastAllowedPath !== currentPath
  ) {
    return lastAllowedPath;
  }

  return "/home";
}

function allowWithRememberedPath(request: NextRequest) {
  const response = NextResponse.next();
  response.cookies.set(LAST_ALLOWED_PATH_COOKIE, request.nextUrl.pathname, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requiredPermission = findRequiredPermission(pathname);

  const authCookie = request.cookies.get("protech_staff_auth")?.value;

  console.log("[Middleware Staff] Request path:", pathname);
  console.log("[Middleware Staff] Raw cookie length:", authCookie ? authCookie.length : "undefined/missing");

  if (!authCookie) {
    console.log("[Middleware Staff] Redirecting to /login because cookie is missing");
    return redirectTo(request, "/login");
  }

  let session: StaffSession;
  try {
    session = JSON.parse(decodeURIComponent(authCookie)) as StaffSession;
    console.log("[Middleware Staff] Parsed session staff id:", session?.id);
  } catch (err) {
    console.log("[Middleware Staff] Redirecting to /login because JSON parse failed:", err);
    return redirectTo(request, "/login");
  }

  if (!requiredPermission) {
    console.log("[Middleware Staff] No permission required for", pathname, "- Allowing request");
    return allowWithRememberedPath(request);
  }

  const allowedPermissions = getAllowedPermissions(session);
  console.log("[Middleware Staff] Required permission:", requiredPermission);
  console.log("[Middleware Staff] Session permissions count:", allowedPermissions.size);

  if (!allowedPermissions.has(requiredPermission)) {
    console.log("[Middleware Staff] Redirecting because permission missing:", requiredPermission);
    return redirectTo(request, getRedirectBackPath(request));
  }

  console.log("[Middleware Staff] Permission verified - Allowing request");
  return allowWithRememberedPath(request);
}

export const config = {
  matcher: [
    "/home",
    "/screening/:path*",
    "/consideration/:path*",
    "/tracking/:path*",
    "/operations/:path*",
    "/reports/:path*",
    "/management/:path*",
  ],
};
