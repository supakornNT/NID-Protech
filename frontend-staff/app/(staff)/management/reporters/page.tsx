"use client";

import { useState } from "react";

import { AdminTablePage, StatusBadge } from "@/components/admin/admin-table-page";
import { ProTechButton } from "@/components/tables/protech-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useUnapprovedCustomers,
  type CustomerApiItem,
} from "@/hooks/customers/use-unapproved-customers";
import { formatPhoneNumber } from "@/lib/utils";
import type { Column } from "@/types/table";

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
    case "person":
      return "บุคคลทั่วไป";
    case "company":
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
    phone: formatPhoneNumber(item.phone),
    status: item.status,
  };
}

export default function CustomersPage() {
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const { items, loading, error, activeId, updateCustomerStatus } =
    useUnapprovedCustomers();

  const rows = items.map(mapCustomerRow);

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
    { key: "date", title: "วันที/เวลา" },
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
    <div className="min-h-full w-full rounded-xl px-5 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
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
        searchPlaceholder="ค้นหาชื่อ อีเมล เบอร์โทร"
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
          className="max-w-105 rounded-[32px] bg-white p-0 shadow-xl ring-0"
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
                className="h-10 min-w-26 rounded-full text-[16px]"
                onClick={() => {
                  setPendingAction(null);
                }}
              >
                ยกเลิก
              </ProTechButton>

              <ProTechButton
                variant="primary"
                className="h-10 min-w-26 rounded-full text-[16px]"
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
