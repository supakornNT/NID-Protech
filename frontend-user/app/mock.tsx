import { TrackingDetail } from "@/types/tracking";

export const MOCK_DATA: Record<string, TrackingDetail> = {
  TH001: {
    trackingNo: "TH001",
    status: "รอตรวจสอบ",
    problem: "ไม่สามารถเข้าสู่ระบบ และทำรายการได้",
    repairStatus: "รอเจ้าหน้าที่ตรวจสอบ",
    repairedBy: "-",
    solution: "-",
    timeline: [
      {
        label: "ยื่นเรื่อง",
        date: "20/04/2567",
        time: "08 : 31",
      },
      {
        label: "ตรวจสอบ",
        date: "20/04/2567",
        time: "รอดำเนินการ",
      },
      {
        label: "ดำเนินการแก้ไข",
        time: "รอดำเนินการ",
      },
      {
        label: "เสร็จสิ้น",
        time: "รอดำเนินการ",
      },
    ],
  },

  TH002: {
    trackingNo: "TH002",
    status: "รอดำเนินการ",
    problem: "ไม่สามารถเข้าสู่ระบบ และทำรายการได้",
    repairStatus: "รอดำเนินการแก้ไข",
    repairedBy: "ทีม Support",
    solution: "ตรวจสอบ Log และ Service",
    timeline: [
      {
        label: "ยื่นเรื่อง",
        date: "20/04/2567",
        time: "08 : 31",
      },
      {
        label: "ตรวจสอบ",
        date: "20/04/2567",
        time: "10 : 46",
      },
      {
        label: "ดำเนินการแก้ไข",
        date: "20/04/2567",
        time: "รอดำเนินการ",
      },
      {
        label: "เสร็จสิ้น",
        time: "รอดำเนินการ",
      },
    ],
  },

  TH003: {
    trackingNo: "TH003",
    status: "รอตรวจสอบโดยลูกค้า",
    problem: "ไม่สามารถเข้าสู่ระบบ และทำรายการได้",
    repairStatus: "ดำเนินการเสร็จแล้ว",
    repairedBy: "ทีม IT",
    solution: "Restart Service เรียบร้อย",
    timeline: [
      {
        label: "ยื่นเรื่อง",
        date: "20/04/2567",
        time: "08 : 31",
      },
      {
        label: "ตรวจสอบ",
        date: "20/04/2567",
        time: "10 : 46",
      },
      {
        label: "ดำเนินการแก้ไข",
        date: "20/04/2567",
        time: "10 : 54",
      },
      {
        label: "เสร็จสิ้น",
        date: "20/04/2567",
        time: "รอยืนยัน",
      },
    ],
  },

  TH004: {
    trackingNo: "TH004",
    status: "เสร็จสิ้น",
    ratingStatus: "ยังไม่ประเมิน",
    problem: "ไม่สามารถเข้าสู่ระบบ และทำรายการได้",
    repairStatus: "ลูกค้ายืนยันปิดงานแล้ว",
    repairedBy: "ทีม IT",
    solution: "ดำเนินการเสร็จสมบูรณ์",
    timeline: [
      {
        label: "ยื่นเรื่อง",
        date: "20/04/2567",
        time: "08 : 31",
      },
      {
        label: "ตรวจสอบ",
        date: "20/04/2567",
        time: "10 : 46",
      },
      {
        label: "ดำเนินการแก้ไข",
        date: "20/04/2567",
        time: "10 : 54",
      },
      {
        label: "เสร็จสิ้น",
        date: "20/04/2567",
        time: "ยืนยันแล้ว",
      },
    ],
  },

  TH005: {
    trackingNo: "TH005",
    status: "เสร็จสิ้น",
    ratingStatus: "ประเมินแล้ว",
    problem: "เครื่องพิมพ์ไม่สามารถใช้งานได้",
    repairStatus: "ลูกค้าประเมินเรียบร้อย",
    repairedBy: "ทีม Hardware",
    solution: "เปลี่ยน Driver และติดตั้งใหม่",
    timeline: [
      {
        label: "ยื่นเรื่อง",
        date: "20/04/2567",
        time: "09 : 10",
      },
      {
        label: "ตรวจสอบ",
        date: "20/04/2567",
        time: "09 : 35",
      },
      {
        label: "ดำเนินการแก้ไข",
        date: "20/04/2567",
        time: "11 : 20",
      },
      {
        label: "เสร็จสิ้น",
        date: "20/04/2567",
        time: "ประเมินแล้ว",
      },
    ],
  },
};


export const data = [
  {
    trackingNo: "TH123-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "รอการประเมิน",
  },
  {
    trackingNo: "TH133-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  },
   {
    trackingNo: "TH123-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "รอการประเมิน",
  },
  {
    trackingNo: "TH133-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  },
   {
    trackingNo: "TH123-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "รอการประเมิน",
  },
  {
    trackingNo: "TH133-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  }, {
    trackingNo: "TH123-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "รอการประเมิน",
  },
  {
    trackingNo: "TH133-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  }, {
    trackingNo: "TH123-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "รอการประเมิน",
  },
  {
    trackingNo: "TH133-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  },
   {
    trackingNo: "TH123-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "รอการประเมิน",
  },
  {
    trackingNo: "TH133-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  },
   {
    trackingNo: "TH123-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "รอการประเมิน",
  },
  {
    trackingNo: "TH133-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  },
   {
    trackingNo: "TH123-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "รอการประเมิน",
  },
  {
    trackingNo: "TH133-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  },
  
  {
    trackingNo: "TH144-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  },
  {
    trackingNo: "TH155-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  },
  {
    trackingNo: "TH166-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  },
  {
    trackingNo: "TH177-154-777",
    system: "Trade",
    dueDate: "20-5-2569",
    status: "เสร็จสิ้น",
  },
];