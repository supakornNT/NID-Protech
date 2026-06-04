export const STAFF_SECTION_LABELS: Record<string, string> = {
  home: "หน้าหลัก",
  screening: "รับเรื่องและคัดกรอง",
  assignment: "การพิจารณา",
  tracking: "การติดตาม",
  operation: "การปฏิบัติงาน",
  report: "รายงาน",
  management: "จัดการ",
};

export const STAFF_PERMISSION_LABELS: Record<string, string> = {
  "screening.issue.view": "ประเด็นปัญหา",
  "screening.complaint.view": "ข้อร้องเรียน",
  "assignment.ticket.approve": "พิจารณาออกใบงาน",
  "assignment.request.approve": "พิจารณาปิดงาน",
  "tracking.status.view": "ติดตามสถานะการดำเนินการ",
  "operation.result.view": "ผลการปฏิบัติงาน",
  "report.dashboard.view": "สำหรับผู้บริหาร",
  "report.operation.view": "การปฏิบัติงาน",
  "report.history.view": "ประวัติการแก้ไข",
  "report.login_log.view": "รายงานประวัติการเข้าใช้งานระบบ",
  "admin.organization.manage": "จัดการข้อมูลองค์กรที่เกี่ยวข้อง",
  "admin.system.manage": "จัดการระบบโครงการและระบบงาน",
  "admin.customer.manage": "บริหารจัดการข้อมูลลงทะเบียนผู้แจ้งประเด็น",
  "admin.staff.manage": "จัดการข้อมูลลงทะเบียนทีมแก้ไข",
  "admin.team.manage": "จัดการกลุ่มผู้ใช้งาน",
  "admin.permission.manage": "จัดการสิทธิผู้ใช้งานจำแนกตามกลุ่ม",
  "admin.user.manage": "จัดการข้อมูลผู้ใช้งาน",
  "admin.problem_type.manage": "จัดการรูปแบบประเด็นและข้อร้องเรียน",
};

export const STAFF_SECTION_KEY_BY_PERMISSION_PREFIX: Record<string, string> = {
  screening: "screening",
  assignment: "assignment",
  tracking: "tracking",
  operation: "operation",
  report: "report",
  admin: "management",
};
