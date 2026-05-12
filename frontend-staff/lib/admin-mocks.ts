export const customerRows = Array.from({ length: 10 }, (_, index) => ({
  date: "28/04/2569 10:30",
  name: "admin01",
  role: index < 6 ? "บุคคลทั่วไป" : "ลูกค้านิติ",
  email: index === 0 ? "Test@gmail.com" : "Test",
  status: "ปฏิเสธ",
  action: "ยอมรับ",
}));

export const userGroupRows = Array.from({ length: 8 }, (_, index) => ({
  order: index + 1,
  groupName: `กลุ่มผู้ใช้งาน ${index + 1}`,
  memberCount: 10 + index,
  status: index % 2 === 0 ? "ใช้งาน" : "ไม่ใช้งาน",
}));

export const permissionRows = Array.from({ length: 4 }, (_, index) => ({
  order: index + 1,
  fullName: "ศุภกร ลีลาบางกุล",
  permissions: ["ITA", "ITO", "NS"],
  status: "ใช้งาน",
}));

export const userRows = Array.from({ length: 10 }, (_, index) => ({
  order: index + 1,
  name: "นายสมชาย ดอนหวาย",
  role: index % 2 === 0 ? "Admin" : "Customer",
  email: "test@gmail.com",
  status: index % 3 === 0 ? "ไม่ใช้งาน" : "ใช้งาน",
}));

export const teamRows = Array.from({ length: 8 }, (_, index) => ({
  order: index + 1,
  teamName: `ทีมแก้ไข ${index + 1}`,
  group: "Operator",
  phone: "081-234-5678",
  status: index % 2 === 0 ? "ใช้งาน" : "ไม่ใช้งาน",
}));

export const organizationRows = Array.from({ length: 10 }, (_, index) => ({
  order: index + 1,
  organizationName: "บริษัท โปรเทค ซัพพอร์ต จำกัด",
  type: "บริษัท",
  projectCount: 10,
  status: index % 3 === 1 ? "ไม่ใช้งาน" : "ใช้งาน",
}));

export const projectRows = Array.from({ length: 10 }, (_, index) => ({
  order: index + 1,
  projectName: `โครงการที่ ${index + 1}`,
  organization: "บริษัท โปรเทค ซัพพอร์ต จำกัด",
  systemCount: 4,
  status: index % 2 === 0 ? "ใช้งาน" : "ไม่ใช้งาน",
}));

export const problemTypeRows = Array.from({ length: 10 }, (_, index) => ({
  order: index + 1,
  category: index % 3 === 0 ? "คำร้อง" : "ประเด็น",
  type: index % 3 === 0 ? "เจ้าหน้าที่ไม่สุภาพ" : "Bug / Error",
}));

export const loginLogRows = Array.from({ length: 10 }, (_, index) => ({
  date: "28/04/2569 10:30",
  user: "admin01",
  system: index < 4 ? "customers system" : "staff system",
  status: "Login สำเร็จ",
}));

export const permissionManagementRows = [
  {
    permissionName: "จัดการผู้ใช้งาน",
    module: "User Management",
    status: "ใช้งาน",
    updatedAt: "12/05/2569 09:41",
  },
  {
    permissionName: "จัดการสิทธิ์",
    module: "Permission Management",
    status: "ใช้งาน",
    updatedAt: "12/05/2569 09:30",
  },
  {
    permissionName: "จัดการทีม",
    module: "Team Management",
    status: "ไม่ใช้งาน",
    updatedAt: "11/05/2569 16:12",
  },
  {
    permissionName: "จัดการองค์กร",
    module: "Organization Management",
    status: "ใช้งาน",
    updatedAt: "10/05/2569 13:28",
  },
  {
    permissionName: "จัดการประเภทประเด็น",
    module: "Problem Type Management",
    status: "ใช้งาน",
    updatedAt: "10/05/2569 11:05",
  },
  {
    permissionName: "จัดการโครงการ",
    module: "Project Management",
    status: "ไม่ใช้งาน",
    updatedAt: "09/05/2569 15:55",
  },
];

export const teamManagementRows = [
  {
    teamName: "ทีม Helpdesk",
    leader: "ศุภกร ลีลาบางกุล",
    membersCount: 8,
    status: "ใช้งาน",
  },
  {
    teamName: "ทีม Infrastructure",
    leader: "วราพร มั่นคง",
    membersCount: 6,
    status: "ใช้งาน",
  },
  {
    teamName: "ทีม Application Support",
    leader: "ธนภัทร ยอดแสงงาม",
    membersCount: 11,
    status: "ใช้งาน",
  },
  {
    teamName: "ทีม Onsite Service",
    leader: "ณภัทร วัฒนกิจ",
    membersCount: 5,
    status: "ไม่ใช้งาน",
  },
  {
    teamName: "ทีม Network",
    leader: "ปวีณ์ กิตติธนา",
    membersCount: 7,
    status: "ใช้งาน",
  },
];

export const organizationManagementRows = [
  {
    organizationName: "NID Technology Co., Ltd.",
    type: "บริษัท",
    status: "ใช้งาน",
    updatedAt: "12/05/2569 09:20",
  },
  {
    organizationName: "Bangkok Digital Service",
    type: "หน่วยงานรัฐ",
    status: "ใช้งาน",
    updatedAt: "11/05/2569 14:45",
  },
  {
    organizationName: "ProTech Partner Group",
    type: "บริษัท",
    status: "ไม่ใช้งาน",
    updatedAt: "10/05/2569 10:18",
  },
  {
    organizationName: "Other Customer Organization",
    type: "อื่น ๆ",
    status: "ใช้งาน",
    updatedAt: "09/05/2569 17:06",
  },
  {
    organizationName: "Digital Citizen Center",
    type: "หน่วยงานรัฐ",
    status: "ใช้งาน",
    updatedAt: "08/05/2569 13:55",
  },
];

export const projectManagementRows = [
  {
    projectName: "NID Helpdesk Portal",
    organization: "NID Technology Co., Ltd.",
    status: "ใช้งาน",
    updatedAt: "12/05/2569 09:12",
  },
  {
    projectName: "Citizen Support Platform",
    organization: "Bangkok Digital Service",
    status: "ใช้งาน",
    updatedAt: "11/05/2569 15:10",
  },
  {
    projectName: "Partner Service Desk",
    organization: "ProTech Partner Group",
    status: "ไม่ใช้งาน",
    updatedAt: "10/05/2569 10:05",
  },
  {
    projectName: "Internal Asset Support",
    organization: "NID Technology Co., Ltd.",
    status: "ใช้งาน",
    updatedAt: "09/05/2569 14:48",
  },
  {
    projectName: "Complaint Resolution Center",
    organization: "Digital Citizen Center",
    status: "ใช้งาน",
    updatedAt: "08/05/2569 11:32",
  },
];

export const problemTypeManagementRows = [
  {
    problemTypeName: "เข้าสู่ระบบไม่ได้",
    reportType: "ประเด็น",
    status: "ใช้งาน",
  },
  {
    problemTypeName: "ระบบช้า/โหลดไม่ขึ้น",
    reportType: "ประเด็น",
    status: "ใช้งาน",
  },
  {
    problemTypeName: "ข้อมูลแสดงผลผิดพลาด",
    reportType: "ประเด็น",
    status: "ใช้งาน",
  },
  {
    problemTypeName: "ร้องเรียนการให้บริการล่าช้า",
    reportType: "คำร้อง",
    status: "ใช้งาน",
  },
  {
    problemTypeName: "ร้องเรียนพฤติกรรมเจ้าหน้าที่",
    reportType: "คำร้อง",
    status: "ไม่ใช้งาน",
  },
  {
    problemTypeName: "ประเภทปัญหาเก่า",
    reportType: "ประเด็น",
    status: "ไม่ใช้งาน",
  },
];
