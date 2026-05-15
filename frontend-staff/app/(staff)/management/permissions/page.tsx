"use client";

import { useEffect, useMemo, useState } from "react";

import { ActionIcons } from "@/components/admin/admin-table-page";
import { AdminModalShell } from "@/components/admin/admin-modal-shell";
import { ProTechButton } from "@/components/tables/protech-button";
import { ProTechSearch } from "@/components/tables/protech-search";
import { ProTechTable } from "@/components/tables/protech-table";
import {
  normalizeSearchKeyword,
  normalizeTextInput,
} from "@/lib/form-utils";
import type { Column } from "@/types/table";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const pageLimit = 10;

type TeamApiItem = {
  id: number;
  name: string;
  status: string;
  createdAt?: string | null;
};

type TeamListResponse = {
  items: TeamApiItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type PermissionApiItem = {
  id: number;
  code: string;
  name: string;
  assigned: boolean;
};

type TeamPermissionDetailResponse = {
  team: {
    id: number;
    name: string;
    status: string;
  };
  permissions: PermissionApiItem[];
};

type PermissionSection = {
  id: string;
  title: string;
  className?: string;
  items: PermissionApiItem[];
};

type PermissionTableRow = {
  id: number;
  order: number;
  teamName: string;
};

type EditDialogState = {
  id: number;
  teamName: string;
  status: string;
  permissionIds: number[];
  sections: PermissionSection[];
} | null;

const sectionConfig: Array<{
  id: string;
  title: string;
  className?: string;
  codes: string[];
}> = [
  {
    id: "screening",
    title: "รับเรื่องและคัดกรอง",
    className: "order-1 lg:col-span-1",
    codes: ["screening.issue.manage", "screening.complaint.manage"],
  },
  {
    id: "reports",
    title: "การพิจารณา",
    className: "order-2 lg:col-span-1",
    codes: [
      "screening.issue.view",
      "screening.complaint.view",
      "operation.result.view",
      "operation.result.resolve",
    ],
  },
  {
    id: "tracking",
    title: "การติดตาม",
    className: "order-3 lg:col-span-1",
    codes: ["tracking.status.view"],
  },
  {
    id: "operation",
    title: "การปฏิบัติงาน",
    className: "order-4 lg:col-span-1",
    codes: ["operation.result.update"],
  },
  {
    id: "assignment",
    title: "การพิจารณา",
    className: "order-5 md:col-span-2 lg:col-span-2",
    codes: ["assignment.ticket.approve", "assignment.request.approve"],
  },
  {
    id: "management",
    title: "การจัดการ",
    className: "order-6 md:col-span-2 lg:col-span-3",
    codes: [
      "admin.organization.manage",
      "admin.system.manage",
      "admin.customer.manage",
      "admin.staff.manage",
      "admin.team.manage",
      "admin.permission.manage",
      "admin.user.manage",
      "admin.problem_type.manage",
    ],
  },
];

function buildPermissionSections(
  permissions: PermissionApiItem[],
): PermissionSection[] {
  const permissionMap = new Map(
    permissions.map((permission) => [permission.code, permission] as const),
  );

  return sectionConfig
    .map((section) => ({
      id: section.id,
      title: section.title,
      className: section.className,
      items: section.codes
        .map((code) => permissionMap.get(code))
        .filter((permission): permission is PermissionApiItem => Boolean(permission)),
    }))
    .filter((section) => section.items.length > 0);

  
      title: "อื่น ๆ",
      className: "order-7 md:col-span-2 lg:col-span-3",
      items: uncategorizedItems,
    });
  }

  return sections;
}

function getSectionDisplayTitle(sectionId: string, fallbackTitle: string) {
  if (sectionId === "screening") return "รับเรื่องและคัดกรอง";
  if (sectionId === "reports") return "รายงาน";
  if (sectionId === "tracking") return "การติดตาม";
  if (sectionId === "operation") return "การปฏิบัติงาน";
  if (sectionId === "assignment") return "การพิจารณา";
  if (sectionId === "management") return "การจัดการ";
  return fallbackTitle;
}

function getSectionItemContainerClassName(sectionId: string) {
  if (sectionId === "management") {
    return "grid gap-x-5 gap-y-4 md:grid-cols-2 lg:grid-cols-4";
  }

  if (sectionId === "assignment") {
    return "grid gap-x-5 gap-y-4 lg:grid-cols-2";
  }

  return "space-y-3";
}

function getSectionCardClassName(sectionId: string) {
  if (sectionId === "management") {
    return "min-h-[136px]";
  }

  if (sectionId === "assignment") {
    return "min-h-[138px]";
  }

  return "min-h-[138px]";
}

export default function PermissionsPage() {
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [rows, setRows] = useState<PermissionTableRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<EditDialogState>(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchTeams() {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          page: String(page),
          limit: String(pageLimit),
        });
        const normalizedSearch = normalizeSearchKeyword(appliedSearch);

        if (normalizedSearch) {
          params.set("search", normalizedSearch);
        }

        const response = await fetch(`${apiBaseUrl}/admin/teams?${params.toString()}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Failed to load teams (${response.status})`);
        }

        const result = (await response.json()) as TeamListResponse;

        if (!active) {
          return;
        }

        setRows(
          result.items.map((item, index) => ({
            id: item.id,
            order: (result.pagination.page - 1) * result.pagination.limit + index + 1,
            teamName: item.name,
          })),
        );
        setTotalItems(result.pagination.total);
        setTotalPages(Math.max(result.pagination.totalPages, 1));
        setError(null);
      } catch (fetchError) {
        console.error(fetchError);

        if (!active) {
          return;
        }

        setError("ไม่สามารถโหลดข้อมูลสิทธิ์ผู้ใช้งานจำแนกตามกลุ่มได้");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchTeams();

    return () => {
      active = false;
    };
  }, [appliedSearch, page]);

  async function openEditDialog(teamId: number) {
    try {
      setDialogLoading(true);

      const response = await fetch(`${apiBaseUrl}/admin/teams/${teamId}/permissions`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to load team permissions (${response.status})`);
      }

      const result = (await response.json()) as TeamPermissionDetailResponse;

      setDialogState({
        id: result.team.id,
        teamName: result.team.name,
        status: result.team.status,
        permissionIds: result.permissions
          .filter((permission) => permission.assigned)
          .map((permission) => permission.id),
        sections: buildPermissionSections(result.permissions),
      });
    } catch (fetchError) {
      console.error(fetchError);
      setError("ไม่สามารถโหลดรายละเอียดสิทธิ์ของทีมได้");
    } finally {
      setDialogLoading(false);
    }
  }

  async function handleSubmitDialog(nextValue: NonNullable<EditDialogState>) {
    if (!nextValue) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(
        `${apiBaseUrl}/admin/teams/${nextValue.id}/permissions`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: nextValue.teamName,
            status: nextValue.status,
            permissionIds: nextValue.permissionIds,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to update team permissions (${response.status})`);
      }

      setDialogState(null);

      const normalizedSearch = normalizeSearchKeyword(appliedSearch);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageLimit),
      });

      if (normalizedSearch) {
        params.set("search", normalizedSearch);
      }

      const refreshResponse = await fetch(
        `${apiBaseUrl}/admin/teams?${params.toString()}`,
        {
          cache: "no-store",
        },
      );

      if (!refreshResponse.ok) {
        throw new Error(`Failed to refresh teams (${refreshResponse.status})`);
      }

      const refreshResult = (await refreshResponse.json()) as TeamListResponse;
      setRows(
        refreshResult.items.map((item, index) => ({
          id: item.id,
          order:
            (refreshResult.pagination.page - 1) * refreshResult.pagination.limit +
            index +
            1,
          teamName: item.name,
        })),
      );
      setTotalItems(refreshResult.pagination.total);
      setTotalPages(Math.max(refreshResult.pagination.totalPages, 1));
    } catch (submitError) {
      console.error(submitError);
      setError("ไม่สามารถบันทึกสิทธิ์ของทีมได้");
    } finally {
      setSaving(false);
    }
  }

  const columns: Column<PermissionTableRow>[] = useMemo(
    () => [
      {
        key: "order",
        title: "ลำดับ",
        className: "w-[180px]",
      },
      {
        key: "teamName",
        title: "กลุ่ม",
        className: "w-[340px]",
        render: (value) => (
          <span className="font-medium text-[#111827]">{String(value)}</span>
        ),
      },
      {
        key: "actions",
        title: "จัดการ",
        className: "w-[160px]",
        render: (_, row) => (
          <ActionIcons
            showInfo={false}
            onEdit={() => {
              void openEditDialog(row.id);
            }}
          />
        ),
      },
    ],
    [],
  );

  return (
    <div className="min-h-full w-full rounded-xl px-5 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
      <div className="space-y-5">
        <div>
          <h1 className="text-[32px] font-bold leading-none text-[#111827]">
            จัดการสิทธิ์ผู้ใช้งานจำแนกตามกลุ่ม
          </h1>
          <p className="mt-2 text-[16px] text-[#8B95A7]">
            การจัดการแก้ไขข้อมูลกลุ่มผู้ใช้งาน
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ProTechSearch
            value={searchValue}
            onChange={(event) => {
              setSearchValue(event.target.value);
            }}
            placeholder="ค้นหาชื่อทีม"
            inputProps={{
              type: "search",
              inputMode: "search",
              autoComplete: "off",
              maxLength: 255,
              title: "ค้นหาด้วยชื่อทีม",
            }}
            className="w-[222px] flex-none"
            inputClassName="h-[31px] rounded-md border border-[#A8B1C2] px-3 text-[14px]"
          />
          <ProTechButton
            variant="primary"
            className="h-[31px] min-w-[74px] px-4 text-[14px]"
            onClick={() => {
              setAppliedSearch(normalizeSearchKeyword(searchValue));
              setPage(1);
            }}
          >
            ค้นหา
          </ProTechButton>
        </div>

        {error ? (
          <div className="max-w-[420px] rounded-md border border-[#FFB4C0] bg-[#FFF5F7] px-3 py-2 text-sm text-[#D1435B]">
            {error}
          </div>
        ) : null}

        {loading ? (
          <p className="text-sm text-[#8B95A7]">กำลังโหลดข้อมูลสิทธิ์ผู้ใช้งาน...</p>
        ) : (
          <ProTechTable
            columns={columns}
            data={rows}
            limit={pageLimit}
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setPage}
          />
        )}
      </div>

      <PermissionEditModal
        open={dialogState !== null}
        loading={dialogLoading}
        saving={saving}
        value={dialogState}
        onOpenChange={(open) => {
          if (!open) {
            setDialogState(null);
          }
        }}
        onChange={setDialogState}
        onSubmit={(nextValue) => {
          void handleSubmitDialog(nextValue);
        }}
      />
    </div>
  );
}

function PermissionEditModal({
  open,
  loading,
  saving,
  value,
  onOpenChange,
  onChange,
  onSubmit,
}: {
  open: boolean;
  loading: boolean;
  saving: boolean;
  value: EditDialogState;
  onOpenChange: (open: boolean) => void;
  onChange: (value: EditDialogState) => void;
  onSubmit: (value: NonNullable<EditDialogState>) => void;
}) {
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setValidationError(null);
    }
  }, [open]);

  function togglePermission(permissionId: number) {
    if (!value) {
      return;
    }

    const nextPermissionIds = value.permissionIds.includes(permissionId)
      ? value.permissionIds.filter(
          (currentPermissionId) => currentPermissionId !== permissionId,
        )
      : [...value.permissionIds, permissionId];

    onChange({
      ...value,
      permissionIds: nextPermissionIds,
    });
  }

  const sectionsForDisplay = value
    ? value.sections.reduce<PermissionSection[]>((result, section) => {
        if (section.id === "other") {
          const reportsSection = result.find(
            (currentSection) => currentSection.id === "reports",
          );

          if (reportsSection) {
            reportsSection.items = [...reportsSection.items, ...section.items];
            return result;
          }
        }

        result.push(section);
        return result;
      }, [])
    : [];

  return (
    <AdminModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="แก้ไขข้อมูลสิทธิ์ผู้ใช้งานจำแนกตามกลุ่ม"
      widthClassName="max-w-none sm:max-w-none"
      contentClassName="top-8 translate-y-0"
      contentStyle={{ width: "min(980px, calc(100vw - 2rem))" }}
      bodyClassName="px-4 py-6 sm:px-5 sm:py-7"
      headerClassName="mb-5 text-center"
      titleClassName="text-[18px] font-bold normal-case tracking-normal text-[#3F73BB] sm:text-[20px]"
    >
      {loading ? (
        <p className="text-sm text-[#8B95A7]">กำลังโหลดรายละเอียดสิทธิ์...</p>
      ) : value ? (
        <div className="max-h-[calc(100vh-6rem)] space-y-5 overflow-y-auto pr-1">
          <div className="max-w-[280px] space-y-1.5">
            <label className="block text-[16px] text-[#111827]">ทีม</label>
            <input
              type="text"
              autoComplete="off"
              maxLength={255}
              value={value.teamName}
              onChange={(event) =>
                onChange({
                  ...value,
                  teamName: event.target.value,
                })
              }
              className="h-8 w-full rounded-[6px] border border-[#A8B1C2] bg-white px-3 text-[13px] text-[#111827] outline-none"
              placeholder="กรอกชื่อทีม เช่น ทีม IT Support"
            />
          </div>

          <div className="rounded-[6px] border border-[#A8B1C2] bg-[#EEF4FF] p-3 sm:p-4">
            <p className="mb-3 text-[15px] font-semibold text-[#111827]">
              จัดการสิทธิ์
            </p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sectionsForDisplay.map((section) => (
                <div
                  key={section.id}
                  className={`rounded-[6px] border border-[#A8B1C2] bg-white p-3 ${
                    getSectionCardClassName(section.id)
                  } ${section.className ?? ""}`}
                >
                  <p className="mb-3 text-[13px] font-medium text-[#111827]">
                    {getSectionDisplayTitle(section.id, section.title)}
                  </p>
                  <div className={getSectionItemContainerClassName(section.id)}>
                    {section.items.map((item) => (
                      <PermissionChoice
                        key={item.id}
                        checked={value.permissionIds.includes(item.id)}
                        label={item.name}
                        onToggle={() => {
                          togglePermission(item.id);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {validationError ? (
            <p className="rounded-md border border-[#FFB4C0] bg-[#FFF5F7] px-4 py-3 text-sm text-[#D1435B]">
              {validationError}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <ProTechButton
              variant="delete"
              className="h-8 min-w-[72px] text-[12px]"
              onClick={() => onOpenChange(false)}
            >
              ยกเลิก
            </ProTechButton>
            <ProTechButton
              variant="primary"
              className="h-8 min-w-[72px] text-[12px]"
              disabled={saving}
              onClick={() => {
                const normalizedTeamName = normalizeTextInput(value.teamName);

                if (!normalizedTeamName) {
                  setValidationError("กรุณากรอกชื่อทีม");
                  return;
                }

                if (value.permissionIds.length === 0) {
                  setValidationError("กรุณาเลือกสิทธิ์อย่างน้อย 1 รายการ");
                  return;
                }

                setValidationError(null);
                const nextValue: NonNullable<EditDialogState> = {
                  ...value,
                  teamName: normalizedTeamName,
                };
                onChange(nextValue);
                onSubmit(nextValue);
              }}
            >
              {saving ? "กำลังบันทึก..." : "เพิ่มสิทธิ์"}
            </ProTechButton>
          </div>
        </div>
      ) : null}
    </AdminModalShell>
  );
}

function PermissionChoice({
  checked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-start gap-2.5 text-left text-[12px] leading-5 text-[#111827]"
    >
      <span
        className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border ${
          checked
            ? "border-[#3F73BB] bg-[#3F73BB]"
            : "border-[#111827] bg-white"
        }`}
      >
        {checked ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
      </span>
      <span>{label}</span>
    </button>
  );
}
