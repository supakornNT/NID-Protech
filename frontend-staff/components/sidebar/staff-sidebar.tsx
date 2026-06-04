"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ChartBar,
  ChevronDown,
  List,
  FileText,
  ChartPie,
  Home,
  ShieldAlert,
  ShieldCheck,
  FolderCheck,
  Siren,
  Rss,
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
    icon: List,
    children: [
      {
        title: STAFF_PERMISSION_LABELS["assignment.ticket.approve"],
        href: "/consideration/issue-work",
        icon: Rss,
      },
      {
        title: STAFF_PERMISSION_LABELS["assignment.request.approve"],
        href: "/consideration/close-work",
        icon: Rss,
      },
    ],
  },
  {
    title: STAFF_SECTION_LABELS.tracking,
    icon: List,
    children: [
      {
        title: STAFF_PERMISSION_LABELS["tracking.status.view"],
        href: "/tracking/status",
        icon: Rss,
      },
    ],
  },
  {
    title: STAFF_SECTION_LABELS.operation,
    icon: List,
    children: [
      {
        title: STAFF_PERMISSION_LABELS["operation.result.view"],
        href: "/operations",
        icon: Rss,
      },
    ],
  },
  {
    title: STAFF_SECTION_LABELS.report,
    icon: FileText,
    children: [
      {
        title: STAFF_PERMISSION_LABELS["report.dashboard.view"],
        href: "/reports/executive",
        icon: ChartBar,
      },
      {
        title: STAFF_PERMISSION_LABELS["report.operation.view"],
        href: "/reports/operations",
        icon: ChartPie,
      },
      {
        title: STAFF_PERMISSION_LABELS["report.history.view"],
        href: "/reports/edit-history",
        icon: ChartPie,
      },
      {
        title: STAFF_PERMISSION_LABELS["report.login_log.view"],
        href: "/reports/login-history",
        icon: ChartPie,
      },
    ],
  },
  {
    title: STAFF_SECTION_LABELS.management,
    icon: FileText,
    children: [
      {
        title: STAFF_PERMISSION_LABELS["admin.organization.manage"],
        href: "/management/organizations",
        icon: ChartBar,
      },
      {
        title: STAFF_PERMISSION_LABELS["admin.system.manage"],
        href: "/management/systems",
        icon: ChartPie,
      },
      {
        title: STAFF_PERMISSION_LABELS["admin.customer.manage"],
        href: "/management/reporters",
        icon: ChartPie,
      },
      {
        title: STAFF_PERMISSION_LABELS["admin.staff.manage"],
        href: "/management/teams",
        icon: ChartPie,
      },
      {
        title: STAFF_PERMISSION_LABELS["admin.team.manage"],
        href: "/management/user-groups",
        icon: ChartPie,
      },
      {
        title: STAFF_PERMISSION_LABELS["admin.permission.manage"],
        href: "/management/permissions",
        icon: ChartPie,
      },
      {
        title: STAFF_PERMISSION_LABELS["admin.user.manage"],
        href: "/management/users",
        icon: ChartPie,
      },
      {
        title: STAFF_PERMISSION_LABELS["admin.problem_type.manage"],
        href: "/management/issue-and-complaint-types",
        icon: ChartPie,
      },
    ],
  },
];

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
  const allowedPermissionKeys = new Set(
    modules.flatMap((module) => module.children.map((child) => child.key)),
  );

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

  const sidebarContent = (
    <div className="flex min-h-full flex-col px-4 py-8">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/18">
          <ShieldCheck size={24} />
        </div>

        <div className="leading-tight">
          <p className="text-[18px] font-bold">ProTech</p>
          <p className="text-[18px] font-bold">Support</p>
        </div>
      </div>

      <nav className="space-y-2.5 text-[13px] font-semibold">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;

          if ("children" in item && item.children) {
            const isOpen = item.children.some((child) =>
              pathname.startsWith(child.href),
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
                    const active = pathname === child.href;

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => onMobileOpenChange(false)}
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

          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onMobileOpenChange(false)}
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
