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
