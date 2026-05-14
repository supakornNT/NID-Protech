"use client";

import { useEffect, useState } from "react";

import { AdminTablePage, StatusBadge } from "@/components/admin/admin-table-page";
import { ProTechButton } from "@/components/tables/protech-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Column } from "@/types/table";

type CustomerApiItem = {
  id: number;
  name: string;
  email: string;
  phone: string;
  customerType: string;
  organizationName: string | null;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
};

type CustomerListResponse = {
  items: CustomerApiItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type CustomerRow = {
  id: number;
  date: string;
  name: string;
  role: string;
  organizationName: string;
  email: string;
  phone: string;
  status: string;
};

type PendingAction = {
  id: number;
  action: "approve" | "reject";
  name: string;
} | null;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function formatThaiDateTime(value: string | null): string {
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

function mapCustomerTypeLabel(type: string): string {
  switch (type) {
    case "individual":
      return "บุคคลทั่วไป";
    case "organization":
      return "นิติบุคคล";
    default:
      return type || "-";
  }
}

function mapCustomerRow(item: CustomerApiItem): CustomerRow {
  return {
    id: item.id,
    date: formatThaiDateTime(item.createdAt),
    name: item.name,
    role: mapCustomerTypeLabel(item.customerType),
    organizationName: item.organizationName || "-",
    email: item.email,
    phone: item.phone || "-",
    status: item.status,
  };
}

export default function CustomersPage() {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  async function fetchCustomers() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/customers/unapproved?page=1&limit=100`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error(`Failed to load customers (${response.status})`);
      }

      const result = (await response.json()) as CustomerListResponse;
      setRows(result.items.map(mapCustomerRow));
      setError(null);
    } catch (fetchError) {
      console.error(fetchError);
      setError("ไม่สามารถโหลดข้อมูลผู้ใช้งานได้");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void (async () => {
      await fetchCustomers();
    })();
  }, []);

  async function updateCustomerStatus(
    id: number,
    action: "approve" | "reject",
  ) {
    if (activeId !== null) {
      return;
    }

    try {
      setActiveId(id);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/customers/${id}/${action}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} customer (${response.status})`);
      }

      await fetchCustomers();
    } catch (updateError) {
      console.error(updateError);
      setError("ไม่สามารถอัปเดตสถานะผู้ใช้งานได้");
    } finally {
      setActiveId(null);
    }
  }

  function openConfirmDialog(
    id: number,
    action: "approve" | "reject",
    name: string,
  ) {
    if (activeId !== null) {
      return;
    }

    setPendingAction({ id, action, name });
  }

  async function confirmPendingAction() {
    if (!pendingAction) {
      return;
    }

    const { id, action } = pendingAction;
    setPendingAction(null);
    await updateCustomerStatus(id, action);
  }

  const columns: Column<CustomerRow>[] = [
    { key: "date", title: "วันที่/เวลา" },
    { key: "name", title: "ชื่อ-นามสกุล" },
    { key: "role", title: "ประเภท" },
    { key: "organizationName", title: "บริษัท" },
    { key: "email", title: "อีเมล" },
    { key: "phone", title: "เบอร์โทร" },
    {
      key: "status",
      title: "สถานะ",
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <StatusBadge
            label={activeId === row.id ? "กำลังบันทึก..." : "ปฏิเสธ"}
            tone="danger"
            onClick={
              activeId === null
                ? () => {
                    openConfirmDialog(row.id, "reject", row.name);
                  }
                : undefined
            }
          />
          <StatusBadge
            label={activeId === row.id ? "กำลังบันทึก..." : "ยอมรับ"}
            tone="success"
            onClick={
              activeId === null
                ? () => {
                    openConfirmDialog(row.id, "approve", row.name);
                  }
                : undefined
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-full rounded-xl p-4 sm:p-6 lg:p-8">
      {error ? (
        <p className="mb-4 rounded-md border border-[#FFB4C0] bg-[#FFF5F7] px-4 py-3 text-sm text-[#D1435B]">
          {error}
        </p>
      ) : null}

      <AdminTablePage
        title="จัดการข้อมูลลงทะเบียนผู้แจ้งปัญหา"
        subtitle="ตรวจสอบและอนุมัติการลงทะเบียนของผู้ใช้งานที่รอการยืนยัน"
        columns={columns}
        data={rows}
        searchPlaceholder="ค้นหาชื่อ อีเมล หรือเบอร์โทร"
        showDelete={false}
        showCreate={false}
      />

      {loading ? (
        <p className="mt-4 text-sm text-[#8B95A7]">กำลังโหลดข้อมูล...</p>
      ) : null}

      <Dialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingAction(null);
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-[420px] rounded-[32px] bg-white p-0 shadow-xl ring-0"
        >
          <div className="space-y-6 px-7 py-7">
            <DialogHeader className="space-y-2 text-center">
              <DialogTitle className="text-[24px] font-bold normal-case tracking-normal text-[#111827]">
                {pendingAction?.action === "approve"
                  ? "ยืนยันการอนุมัติ"
                  : "ยืนยันการปฏิเสธ"}
              </DialogTitle>
              <DialogDescription className="mt-0 text-[16px] text-[#6B7280]">
                {pendingAction
                  ? `${
                      pendingAction.action === "approve"
                        ? "ต้องการอนุมัติ"
                        : "ต้องการปฏิเสธ"
                    }ผู้ใช้งาน ${pendingAction.name} ใช่หรือไม่`
                  : ""}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-center gap-3 pt-1">
              <ProTechButton
                variant="delete"
                className="h-10 min-w-[104px] rounded-full text-[16px]"
                onClick={() => {
                  setPendingAction(null);
                }}
              >
                ยกเลิก
              </ProTechButton>

              <ProTechButton
                variant="primary"
                className="h-10 min-w-[104px] rounded-full text-[16px]"
                onClick={() => {
                  void confirmPendingAction();
                }}
              >
                ยืนยัน
              </ProTechButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
