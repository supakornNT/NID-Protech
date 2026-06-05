"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";

import {
  Activity,
  AlertCircle,
  Briefcase,
  Building2,
  ChartBar,
  ChevronDown,
  ClipboardList,
  FileCheck,
  FileSignature,
  FileText,
  FolderCheck,
  History,
  Home,
  Key,
  LayoutDashboard,
  LogIn,
  Monitor,
  Radar,
  Rss,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Timer,
  User,
  UserCheck,
  UserPlus,
  Users,
  Wrench,
  X,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  STAFF_PERMISSION_LABELS,
  STAFF_SECTION_LABELS,
} from "@/components/sidebar/staff-navigation";

export type StaffSidebarModule = {
  key: string;
  label: string;
  children: {
    key: string;
    label: string;
  }[];
};

const MENU_PERMISSION_BY_HREF: Record<string, string> = {
  "/screening/issues": "screening.issue.view",
  "/screening/complaints": "screening.complaint.view",
  "/consideration/issue-work": "assignment.ticket.approve",
  "/consideration/close-work": "assignment.request.approve",
  "/tracking/status": "tracking.status.view",
  "/operations": "operation.result.view",
  "/reports/executive": "report.dashboard.view",
  "/reports/operations": "report.operation.view",
  "/reports/edit-history": "report.history.view",
  "/reports/login-history": "report.login_log.view",
  "/management/organizations": "admin.organization.manage",
  "/management/systems": "admin.system.manage",
  "/management/reporters": "admin.customer.manage",
  "/management/teams": "admin.staff.manage",
  "/management/user-groups": "admin.team.manage",
  "/management/permissions": "admin.permission.manage",
  "/management/users": "admin.user.manage",
  "/management/issue-and-complaint-types": "admin.problem_type.manage",
};

const menuItems = [
  {
    title: STAFF_SECTION_LABELS.home,
    href: "/home",
    icon: Home,
  },
  {
    title: STAFF_SECTION_LABELS.screening,
    icon: FolderCheck,
    children: [
      {
        title: STAFF_PERMISSION_LABELS["screening.issue.view"],
        href: "/screening/issues",
        icon: ShieldAlert,
      },
      {
        title: STAFF_PERMISSION_LABELS["screening.complaint.view"],
        href: "/screening/complaints",
        icon: Siren,
      },
    ],
  },
  {
    title: STAFF_SECTION_LABELS.assignment,
    icon: ClipboardList,
    children: [
      {
        title: STAFF_PERMISSION_LABELS["assignment.ticket.approve"],
        href: "/consideration/issue-work",
        icon: FileSignature,
      },
      {
        title: STAFF_PERMISSION_LABELS["assignment.request.approve"],
        href: "/consideration/close-work",
        icon: FileCheck,
      },
    ],
  },
  {
    title: STAFF_SECTION_LABELS.tracking,
    icon: Activity,
    children: [
      {
        title: STAFF_PERMISSION_LABELS["tracking.status.view"],
        href: "/tracking/status",
        icon: Radar,
      },
    ],
  },
  {
    title: STAFF_SECTION_LABELS.operation,
    icon: Briefcase,
    children: [
      {
        title: STAFF_PERMISSION_LABELS["operation.result.view"],
        href: "/operations",
        icon: Wrench,
      },
    ],
  },
  {
    title: STAFF_SECTION_LABELS.report,
    icon: ChartBar,
    children: [
      {
        title: STAFF_PERMISSION_LABELS["report.dashboard.view"],
        href: "/reports/executive",
        icon: LayoutDashboard,
      },
      {
        title: STAFF_PERMISSION_LABELS["report.operation.view"],
        href: "/reports/operations",
        icon: Timer,
      },
      {
        title: STAFF_PERMISSION_LABELS["report.history.view"],
        href: "/reports/edit-history",
        icon: History,
      },
      {
        title: STAFF_PERMISSION_LABELS["report.login_log.view"],
        href: "/reports/login-history",
        icon: LogIn,
      },
    ],
  },
  {
    title: STAFF_SECTION_LABELS.management,
    icon: Settings,
    children: [
      {
        title: STAFF_PERMISSION_LABELS["admin.organization.manage"],
        href: "/management/organizations",
        icon: Building2,
      },
      {
        title: STAFF_PERMISSION_LABELS["admin.system.manage"],
        href: "/management/systems",
        icon: Monitor,
      },
      {
        title: STAFF_PERMISSION_LABELS["admin.customer.manage"],
        href: "/management/reporters",
        icon: UserPlus,
      },
      {
        title: STAFF_PERMISSION_LABELS["admin.staff.manage"],
        href: "/management/teams",
        icon: Wrench,
      },
      {
        title: STAFF_PERMISSION_LABELS["admin.team.manage"],
        href: "/management/user-groups",
        icon: Users,
      },
      {
        title: STAFF_PERMISSION_LABELS["admin.permission.manage"],
        href: "/management/permissions",
        icon: Key,
      },
      {
        title: STAFF_PERMISSION_LABELS["admin.user.manage"],
        href: "/management/users",
        icon: User,
      },
      {
        title: STAFF_PERMISSION_LABELS["admin.problem_type.manage"],
        href: "/management/issue-and-complaint-types",
        icon: AlertCircle,
      },
    ],
  },
];

function isRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Props = {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  modules: StaffSidebarModule[];
};

export default function StaffSidebar({
  mobileOpen,
  onMobileOpenChange,
  modules,
}: Props) {
  const pathname = usePathname();
  const topLoader = useTopLoader();
  const allowedPermissionKeys = new Set(
    modules.flatMap((module) => module.children.map((child) => child.key)),
  );

  useEffect(() => {
    topLoader.done(true);
  }, [pathname, topLoader]);

  function handleNavigate(href: string) {
    onMobileOpenChange(false);

    if (pathname !== href) {
      topLoader.start();
    }
  }

  const visibleMenuItems = menuItems
    .map((item) => {
      const children = "children" in item ? item.children : undefined;

      if (!children) {
        return item;
      }

      const visibleChildren = children.filter((child) => {
        const requiredPermission = MENU_PERMISSION_BY_HREF[child.href];

        return requiredPermission
          ? allowedPermissionKeys.has(requiredPermission)
          : true;
      });

      if (visibleChildren.length === 0) {
        return null;
      }

      return {
        ...item,
        children: visibleChildren,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  const sidebarContent = (
    <div className="flex min-h-full flex-col px-4 py-8">
      <div className="mb-8 flex items-center px-2">
        <Image
          src={`${basePath}/ProTechLogoFinal.png`}
          alt="ProTech Support"
          width={130}
          height={37}
          priority
          className="h-auto w-auto object-contain"
        />
      </div>

      <nav className="space-y-2.5 text-[13px] font-semibold">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;

          if ("children" in item && item.children) {
            const isOpen = item.children.some((child) =>
              isRouteActive(pathname, child.href),
            );

            return (
              <Collapsible
                key={item.title}
                defaultOpen={isOpen}
              >
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className={`group flex min-h-10 w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                      isOpen ? "bg-white/20" : "hover:bg-white/15"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={17} />
                      {item.title}
                    </span>

                    <ChevronDown
                      size={15}
                      className="transition-transform duration-200 group-data-[state=open]:rotate-180"
                    />
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-2 space-y-1.5 pl-3">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    const active = isRouteActive(pathname, child.href);

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => handleNavigate(child.href)}
                        className={`flex min-h-9 items-center gap-2 rounded-xl px-3 py-2 text-[12px] leading-snug transition ${
                          active
                            ? "bg-white/30 text-white"
                            : "hover:bg-white/15"
                        }`}
                      >
                        <ChildIcon size={14} />
                        <span>{child.title}</span>
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          }

          const active = isRouteActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => handleNavigate(item.href)}
              className={`flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 transition ${
                active ? "bg-white/20" : "hover:bg-white/15"
              }`}
            >
              <Icon size={17} />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[244px] shrink-0 overflow-y-auto bg-[#3D71BC] text-white lg:block">
        {sidebarContent}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => onMobileOpenChange(false)}
          />

          <aside className="relative h-full w-[82vw] max-w-[300px] overflow-y-auto bg-[#3D71BC] text-white shadow-xl">
            <button
              type="button"
              className="absolute right-3 top-3 rounded-lg p-2 text-white hover:bg-white/15"
              onClick={() => onMobileOpenChange(false)}
            >
              <X size={22} />
            </button>

            {sidebarContent}
          </aside>
        </div>
      ) : null}
    </>
  );
}
