"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  ActionIcons,
  AdminTablePage,
  CheckCell,
  StatusBadge,
} from "@/components/admin/admin-table-page";
import { ProTechButton } from "@/components/tables/protech-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useOrganizationTable,
  type OrganizationApiItem,
} from "@/hooks/organizations/use-organization-table";
import { formatPhoneNumber } from "@/lib/utils";
import type { Column } from "@/types/table";

const PAGE_SIZE = 10;

type DialogMode = "create" | "edit" | "info";

type DialogState = {
  mode: DialogMode;
  item?: OrganizationApiItem;
} | null;

type OrganizationRow = {
  id: number;
  checked: boolean;
  organizationName: string;
  email: string;
  phone: string;
  organizationType: string;
  status: string;
  updatedAt: string;
};

function formatThaiDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function OrganizationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [dialogState, setDialogState] = useState<DialogState>(null);

  const {
    items,
    loading,
    error,
    activeId,
    statusOptions,
    typeOptions,
    removeOrganization,
  } = useOrganizationTable({
    search,
    statusFilter,
    typeFilter,
  });

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedItems = useMemo(() => {
    const startIndex = (safePage - 1) * PAGE_SIZE;
    return items.slice(startIndex, startIndex + PAGE_SIZE);
  }, [items, safePage]);

  const rows = useMemo<OrganizationRow[]>(() => {
    return pagedItems.map((item) => ({
      id: item.id,
      checked: selectedIds.includes(item.id),
      organizationName: item.organizationName || "-",
      email: item.email || "-",
      phone: formatPhoneNumber(item.phone) || "-",
      organizationType: item.organizationType || "-",
      status: item.status || "-",
      updatedAt: formatThaiDateTime(item.updatedAt),
    }));
  }, [pagedItems, selectedIds]);

  function resetSelection() {
    setSelectedIds([]);
  }

  function handleToggleSelect(id: number) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );
  }

  function handleToggleSelectAll() {
    const currentPageIds = pagedItems.map((item) => item.id);
    const hasUnselected = currentPageIds.some((id) => !selectedIds.includes(id));

    if (!hasUnselected) {
      setSelectedIds((current) =>
        current.filter((id) => !currentPageIds.includes(id)),
      );
      return;
    }

    setSelectedIds((current) =>
      Array.from(new Set([...current, ...currentPageIds])),
    );
  }

  async function handleDeleteSelected() {
    if (selectedIds.length === 0) {
      return;
    }

    for (const id of selectedIds) {
      const success = await removeOrganization(id);

      if (!success) {
        break;
      }
    }

    resetSelection();
  }

  const allSelected =
    pagedItems.length > 0 &&
    pagedItems.every((item) => selectedIds.includes(item.id));

  const columns: Column<OrganizationRow>[] = [
    {
      key: "checked",
      title: <CheckCell checked={allSelected} onClick={handleToggleSelectAll} />,
      render: (_, row) => (
        <CheckCell checked={row.checked} onClick={() => handleToggleSelect(row.id)} />
      ),
    },
    { key: "organizationName", title: "ชื่อองค์กร" },
    { key: "email", title: "อีเมล" },
    { key: "phone", title: "เบอร์โทร" },
    { key: "organizationType", title: "ประเภท" },
    {
      key: "status",
      title: "สถานะ",
      className: "w-[124px]",
      render: (value) => {
        const status = String(value ?? "-");
        const tone =
          status === "active"
            ? "success"
            : status === "inactive"
              ? "danger"
              : "neutral";

        return <StatusBadge label={status} tone={tone} />;
      },
    },
    { key: "updatedAt", title: "อัปเดตล่าสุด", className: "w-[180px]" },
    {
      key: "actions",
      title: "จัดการ",
      className: "w-[112px]",
      render: (_, row) => {
        const currentItem = pagedItems.find((item) => item.id === row.id);

        if (!currentItem) {
          return null;
        }

        return (
          <ActionIcons
            onEdit={() => {
              setDialogState({ mode: "edit", item: currentItem });
            }}
            onInfo={() => {
              setDialogState({ mode: "info", item: currentItem });
            }}
          />
        );
      },
    },
  ];

  return (
    <div className="min-h-full w-full rounded-xl px-5 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
      {error ? (
        <p className="mb-5 rounded-md border border-[#FFB4C0] bg-[#FFF5F7] px-4 py-3 text-sm text-[#D1435B]">
          {error}
        </p>
      ) : null}

      <AdminTablePage
        title="จัดการข้อมูลองค์กร"
        subtitle="จัดการข้อมูลองค์กรที่เกี่ยวข้อง"
        columns={columns}
        data={rows}
        searchValue={search}
        searchPlaceholder="ค้นหาชื่อองค์กร อีเมล เบอร์โทร"
        onSearchClick={(value) => {
          setSearch(value);
          setPage(1);
          resetSelection();
        }}
        page={safePage}
        totalPages={totalPages}
        totalItems={items.length}
        onPageChange={setPage}
        disableClientFiltering
        disableClientPagination
        showCreate={false}
        showDelete={false}
        renderToolbar={({ searchBar }) => (
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              {searchBar}

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                    resetSelection();
                  }}
                  className="h-[31px] min-w-[124px] appearance-none rounded-md border border-[#A8B1C2] bg-white px-4 pr-10 text-left text-[14px] text-[#6B7280] outline-none"
                >
                  <option value="all">สถานะทั้งหมด</option>
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#8B95A7]" />
              </div>

              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(event) => {
                    setTypeFilter(event.target.value);
                    setPage(1);
                    resetSelection();
                  }}
                  className="h-[31px] min-w-[132px] appearance-none rounded-md border border-[#A8B1C2] bg-white px-4 pr-10 text-left text-[14px] text-[#6B7280] outline-none"
                >
                  <option value="all">ประเภททั้งหมด</option>
                  {typeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#8B95A7]" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <ProTechButton
                variant="delete"
                className="h-[31px] px-4 text-[14px]"
                disabled={selectedIds.length === 0 || activeId !== null}
                onClick={() => {
                  void handleDeleteSelected();
                }}
              >
                ลบ
              </ProTechButton>

              <ProTechButton
                variant="create"
                className="h-[31px] px-4 text-[14px]"
                onClick={() => {
                  setDialogState({ mode: "create" });
                }}
              >
                สร้าง
              </ProTechButton>
            </div>
          </div>
        )}
      />

      {loading ? (
        <p className="mt-4 text-sm text-[#8B95A7]">กำลังโหลดข้อมูลองค์กร...</p>
      ) : null}

      <Dialog
        open={dialogState !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDialogState(null);
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-105 rounded-[28px] bg-white p-0 shadow-xl ring-0"
        >
          <div className="space-y-6 px-7 py-7">
            <DialogHeader className="space-y-2 text-center">
              <DialogTitle className="text-[24px] font-bold normal-case tracking-normal text-[#111827]">
                {dialogState?.mode === "create" && "สร้างองค์กร"}
                {dialogState?.mode === "edit" && "แก้ไของค์กร"}
                {dialogState?.mode === "info" && "รายละเอียดองค์กร"}
              </DialogTitle>
              <DialogDescription className="mt-0 text-[16px] text-[#6B7280]">
                {dialogState?.mode === "create" &&
                  "ปุ่มนี้เตรียมไว้ตามดีไซน์ สามารถเชื่อมหน้าฟอร์มสร้างองค์กรต่อได้"}
                {dialogState?.mode === "edit" &&
                  `เตรียมปุ่มแก้ไขไว้สำหรับ ${dialogState.item?.organizationName || "-"}`}
                {dialogState?.mode === "info" &&
                  `ชื่อองค์กร: ${dialogState.item?.organizationName || "-"} | ประเภท: ${dialogState.item?.organizationType || "-"} | สถานะ: ${dialogState.item?.status || "-"}`}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-center gap-3 pt-1">
              <ProTechButton
                variant="delete"
                className="h-10 min-w-26 text-[16px]"
                onClick={() => {
                  setDialogState(null);
                }}
              >
                ปิด
              </ProTechButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
