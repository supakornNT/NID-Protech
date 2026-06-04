SET FOREIGN_KEY_CHECKS = 0;

-- Define target customer ID
SET @customer_id := 13;

-- 1. Clean up any existing records associated with Customer 13 to start fresh
DELETE FROM `attachments` WHERE `request_id` IN (SELECT `id` FROM `requests` WHERE `customer_id` = @customer_id) OR `ticket_id` IN (SELECT `id` FROM `tickets` WHERE `request_id` IN (SELECT `id` FROM `requests` WHERE `customer_id` = @customer_id));
DELETE FROM `request_confirmations` WHERE `customer_id` = @customer_id;
DELETE FROM `request_status_logs` WHERE `request_id` IN (SELECT `id` FROM `requests` WHERE `customer_id` = @customer_id);
DELETE FROM `ticket_assignments` WHERE `ticket_id` IN (SELECT `id` FROM `tickets` WHERE `request_id` IN (SELECT `id` FROM `requests` WHERE `customer_id` = @customer_id));
DELETE FROM `ticket_resolution_requests` WHERE `ticket_id` IN (SELECT `id` FROM `tickets` WHERE `request_id` IN (SELECT `id` FROM `requests` WHERE `customer_id` = @customer_id));
DELETE FROM `ticket_status_logs` WHERE `ticket_id` IN (SELECT `id` FROM `tickets` WHERE `request_id` IN (SELECT `id` FROM `requests` WHERE `customer_id` = @customer_id));
DELETE FROM `ticket_work_logs` WHERE `ticket_id` IN (SELECT `id` FROM `tickets` WHERE `request_id` IN (SELECT `id` FROM `requests` WHERE `customer_id` = @customer_id));
DELETE FROM `tickets` WHERE `request_id` IN (SELECT `id` FROM `requests` WHERE `customer_id` = @customer_id);
DELETE FROM `requests` WHERE `customer_id` = @customer_id;

-- 2. Insert new mock requests, letting MySQL auto-increment IDs

-- ==========================================
-- Case 1: REQ-MOCK13-0001 (screening)
-- ==========================================
INSERT INTO `requests` (`request_no`, `customer_id`, `organization`, `system_id`, `problem_type_id`, `title`, `detail`, `status`, `score`, `created_at`, `closed_at`, `due_at`, `resolved_at`) VALUES
('REQ-MOCK13-0001', @customer_id, NULL, NULL, 1, 'ไม่สามารถเข้าสู่ระบบได้', 'ผู้ใช้งานไม่สามารถเข้าสู่ระบบได้หลังเปลี่ยนรหัสผ่าน โดยหน้าเว็บแจ้งว่าอีเมลหรือรหัสผ่านไม่ถูกต้อง ทั้งที่ยืนยันข้อมูลแล้วหลายครั้ง', 'screening', NULL, '2026-06-04 09:10:00', NULL, NULL, NULL);
SET @req_id_1 = LAST_INSERT_ID();

INSERT INTO `request_status_logs` (`request_id`, `status`, `changed_by_type`, `changed_by_id`, `note`, `created_at`) VALUES
(@req_id_1, 'screening', 'staff', 1, 'รับเรื่องและรอคัดกรอง', '2026-06-04 09:18:00');

INSERT INTO `attachments` (`request_id`, `ticket_id`, `request_confirmation_id`, `attachment_type`, `original_name`, `file_ext`, `uploaded_at`, `saved_name`, `status`) VALUES
(@req_id_1, NULL, NULL, 'request_evidence', 'ภาพหน้าจอ-เข้าใช้งานไม่ได้-01.png', 'png', '2026-06-04 09:12:00', '1780473474571-l0vvqs-Screenshot 2026-03-24 143800.png', 'show'),
(@req_id_1, NULL, NULL, 'request_evidence', 'ภาพหน้าจอ-ข้อความผิดพลาด-02.png', 'png', '2026-06-04 09:13:00', '1780473474573-f4hfe6-Screenshot 2026-03-24 143844.png', 'show');


-- ==========================================
-- Case 2: REQ-MOCK13-0002 (assigned)
-- ==========================================
INSERT INTO `requests` (`request_no`, `customer_id`, `organization`, `system_id`, `problem_type_id`, `title`, `detail`, `status`, `score`, `created_at`, `closed_at`, `due_at`, `resolved_at`) VALUES
('REQ-MOCK13-0002', @customer_id, NULL, 1, 2, 'ระบบบันทึกข้อมูลช้า', 'เมื่อกดบันทึกรายการขาย ระบบใช้เวลานานกว่า 30 วินาทีและบางครั้งค้างที่หน้าเดิม ทำให้ผู้ใช้งานต้องกดซ้ำหลายครั้ง', 'assigned', NULL, '2026-06-04 08:45:00', NULL, '2026-06-06', NULL);
SET @req_id_2 = LAST_INSERT_ID();

INSERT INTO `request_status_logs` (`request_id`, `status`, `changed_by_type`, `changed_by_id`, `note`, `created_at`) VALUES
(@req_id_2, 'screening', 'staff', 1, 'คัดกรองเรื่องแล้ว', '2026-06-04 09:00:00'),
(@req_id_2, 'assigned', 'staff', 1, 'มอบหมายงานให้เจ้าหน้าที่แล้ว', '2026-06-04 09:05:00');

INSERT INTO `tickets` (`ticket_no`, `request_id`, `assigned_team_id`, `assigned_staff_id`, `assigned_by`, `due_at`, `assigned_note`, `title`, `description`, `status`, `created_at`, `resolved_at`, `customer_confirm_due_at`, `closed_at`) VALUES
('TK-MOCK13-0002', @req_id_2, 1, 2, 1, '2026-06-06 17:00:00', 'มอบหมายตรวจสอบประสิทธิภาพการบันทึกข้อมูล', 'ตรวจสอบระบบบันทึกข้อมูลช้า', 'อยู่ระหว่างตรวจสอบ query และ application log', 'assigned', '2026-06-04 09:05:00', NULL, NULL, NULL);
SET @tk_id_2 = LAST_INSERT_ID();

INSERT INTO `ticket_assignments` (`ticket_id`, `assigned_team_id`, `assigned_staff_id`, `assigned_by`, `note`, `assigned_at`) VALUES
(@tk_id_2, 1, 2, 1, 'มอบหมายให้เจ้าหน้าที่หลักรับงาน', '2026-06-04 09:05:00');

INSERT INTO `ticket_status_logs` (`ticket_id`, `old_status`, `new_status`, `changed_by`, `note`, `created_at`) VALUES
(@tk_id_2, NULL, 'assigned', 1, 'สร้าง ticket และมอบหมายงาน', '2026-06-04 09:05:00');

INSERT INTO `attachments` (`request_id`, `ticket_id`, `request_confirmation_id`, `attachment_type`, `original_name`, `file_ext`, `uploaded_at`, `saved_name`, `status`) VALUES
(@req_id_2, NULL, NULL, 'request_evidence', 'ภาพหน้าจอ-ช้า-01.png', 'png', '2026-06-04 08:47:00', '1780473474573-zu11vf-Screenshot 2026-03-24 143931.png', 'show');


-- ==========================================
-- Case 3: REQ-MOCK13-0003 (in_progress)
-- ==========================================
INSERT INTO `requests` (`request_no`, `customer_id`, `organization`, `system_id`, `problem_type_id`, `title`, `detail`, `status`, `score`, `created_at`, `closed_at`, `due_at`, `resolved_at`) VALUES
('REQ-MOCK13-0003', @customer_id, NULL, 2, 3, 'เครื่องพิมพ์ไม่สามารถพิมพ์ใบเสร็จได้', 'เครื่องพิมพ์เชื่อมต่อกับระบบได้แต่เมื่อสั่งพิมพ์จะขึ้นสถานะ pending ตลอดเวลา เจ้าหน้าที่สาขาทดลองปิดเปิดอุปกรณ์แล้วแต่ยังไม่สามารถใช้งานได้', 'in_progress', NULL, '2026-06-04 08:20:00', NULL, '2026-06-05', NULL);
SET @req_id_3 = LAST_INSERT_ID();

INSERT INTO `request_status_logs` (`request_id`, `status`, `changed_by_type`, `changed_by_id`, `note`, `created_at`) VALUES
(@req_id_3, 'screening', 'staff', 1, 'คัดกรองเรื่องแล้ว', '2026-06-04 08:45:00'),
(@req_id_3, 'assigned', 'staff', 1, 'มอบหมายให้ทีมอุปกรณ์', '2026-06-04 08:55:00'),
(@req_id_3, 'in_progress', 'staff', 3, 'เจ้าหน้าที่เริ่มดำเนินการแก้ไข', '2026-06-04 09:40:00');

INSERT INTO `tickets` (`ticket_no`, `request_id`, `assigned_team_id`, `assigned_staff_id`, `assigned_by`, `due_at`, `assigned_note`, `title`, `description`, `status`, `created_at`, `resolved_at`, `customer_confirm_due_at`, `closed_at`) VALUES
('TK-MOCK13-0003', @req_id_3, 2, 3, 1, '2026-06-05 17:00:00', 'ตรวจสอบ printer spooler และ driver', 'แก้ปัญหาเครื่องพิมพ์ใบเสร็จ', 'กำลังรีเซ็ต print spooler และติดตั้ง driver ใหม่', 'in_progress', '2026-06-04 08:55:00', NULL, NULL, NULL);
SET @tk_id_3 = LAST_INSERT_ID();

INSERT INTO `ticket_assignments` (`ticket_id`, `assigned_team_id`, `assigned_staff_id`, `assigned_by`, `note`, `assigned_at`) VALUES
(@tk_id_3, 2, 3, 1, 'มอบหมายให้เจ้าหน้าที่อุปกรณ์รับผิดชอบ', '2026-06-04 08:55:00');

INSERT INTO `ticket_status_logs` (`ticket_id`, `old_status`, `new_status`, `changed_by`, `note`, `created_at`) VALUES
(@tk_id_3, NULL, 'assigned', 1, 'สร้าง ticket', '2026-06-04 08:55:00'),
(@tk_id_3, 'assigned', 'in_progress', 3, 'เริ่มดำเนินการแก้ไข', '2026-06-04 09:40:00');

INSERT INTO `attachments` (`request_id`, `ticket_id`, `request_confirmation_id`, `attachment_type`, `original_name`, `file_ext`, `uploaded_at`, `saved_name`, `status`) VALUES
(@req_id_3, NULL, NULL, 'request_evidence', 'ภาพปัญหาเครื่องพิมพ์.png', 'png', '2026-06-04 08:25:00', '1780473474576-8xsj3u-Screenshot 2026-03-24 143958.png', 'show'),
(@req_id_3, @tk_id_3, NULL, 'resolution_evidence', 'ภาพผลการตรวจสอบระหว่างแก้ไข.png', 'png', '2026-06-04 10:10:00', '1780473474582-ewsbrp-Screenshot 2026-03-24 144136.png', 'show');


-- ==========================================
-- Case 4: REQ-MOCK13-0004 (waiting_confirm)
-- ==========================================
INSERT INTO `requests` (`request_no`, `customer_id`, `organization`, `system_id`, `problem_type_id`, `title`, `detail`, `status`, `score`, `created_at`, `closed_at`, `due_at`, `resolved_at`) VALUES
('REQ-MOCK13-0004', @customer_id, NULL, 3, 4, 'รายงานสรุปยอดขายไม่ออก PDF', 'เมนูรายงานสามารถค้นหาข้อมูลได้ตามปกติ แต่เมื่อกด Export PDF ระบบโหลดค้างและไม่ดาวน์โหลดไฟล์ออกมาให้ผู้ใช้งาน', 'waiting_confirm', NULL, '2026-06-04 07:50:00', NULL, '2026-06-05', '2026-06-04');
SET @req_id_4 = LAST_INSERT_ID();

INSERT INTO `request_status_logs` (`request_id`, `status`, `changed_by_type`, `changed_by_id`, `note`, `created_at`) VALUES
(@req_id_4, 'screening', 'staff', 1, 'คัดกรองเรื่องแล้ว', '2026-06-04 08:10:00'),
(@req_id_4, 'assigned', 'staff', 1, 'มอบหมายให้เจ้าหน้าที่รายงาน', '2026-06-04 08:20:00'),
(@req_id_4, 'in_progress', 'staff', 4, 'เริ่มแก้ปัญหาการสร้าง PDF', '2026-06-04 10:15:00'),
(@req_id_4, 'waiting_confirm', 'staff', 1, 'ส่งผลการแก้ไขให้ลูกค้ายืนยัน', '2026-06-04 13:50:00');

INSERT INTO `tickets` (`ticket_no`, `request_id`, `assigned_team_id`, `assigned_staff_id`, `assigned_by`, `due_at`, `assigned_note`, `title`, `description`, `status`, `created_at`, `resolved_at`, `customer_confirm_due_at`, `closed_at`) VALUES
('TK-MOCK13-0004', @req_id_4, 1, 4, 1, '2026-06-05 17:00:00', 'ตรวจสอบการ export PDF และสิทธิ์โฟลเดอร์', 'แก้ปัญหารายงาน PDF', 'ปรับสิทธิ์โฟลเดอร์ปลายทางและทดสอบการสร้างไฟล์ PDF ใหม่เรียบร้อยแล้ว', 'waiting_confirm', '2026-06-04 08:20:00', '2026-06-04 13:40:00', '2026-06-07 13:50:00', NULL);
SET @tk_id_4 = LAST_INSERT_ID();

INSERT INTO `ticket_assignments` (`ticket_id`, `assigned_team_id`, `assigned_staff_id`, `assigned_by`, `note`, `assigned_at`) VALUES
(@tk_id_4, 1, 4, 1, 'มอบหมายให้เจ้าหน้าที่รายงาน', '2026-06-04 08:20:00');

INSERT INTO `ticket_resolution_requests` (`ticket_id`, `requested_by`, `summary`, `status`, `reviewed_by`, `reviewed_at`, `reject_reason`, `created_at`) VALUES
(@tk_id_4, 4, 'ปลดล็อกสิทธิ์การสร้างไฟล์และทดสอบดาวน์โหลด PDF สำเร็จแล้ว กรุณาลองดาวน์โหลดอีกครั้ง', 'approved', 1, '2026-06-04 13:40:00', NULL, '2026-06-04 13:30:00');

INSERT INTO `ticket_status_logs` (`ticket_id`, `old_status`, `new_status`, `changed_by`, `note`, `created_at`) VALUES
(@tk_id_4, NULL, 'assigned', 1, 'สร้าง ticket', '2026-06-04 08:20:00'),
(@tk_id_4, 'assigned', 'in_progress', 4, 'เริ่มดำเนินการแก้ไข', '2026-06-04 10:15:00'),
(@tk_id_4, 'in_progress', 'resolved', 4, 'แก้ไขเสร็จและขออนุมัติปิดงาน', '2026-06-04 13:35:00'),
(@tk_id_4, 'resolved', 'waiting_confirm', 1, 'อนุมัติและส่งให้ลูกค้ายืนยัน', '2026-06-04 13:50:00');

INSERT INTO `attachments` (`request_id`, `ticket_id`, `request_confirmation_id`, `attachment_type`, `original_name`, `file_ext`, `uploaded_at`, `saved_name`, `status`) VALUES
(@req_id_4, NULL, NULL, 'request_evidence', 'รายงานสรุปยอดขาย-กดออกไม่ได้.pdf', 'pdf', '2026-06-04 07:55:00', '1780546540311-bo98al-RPT-20260603-0003.pdf', 'show'),
(@req_id_4, @tk_id_4, NULL, 'resolution_evidence', 'ภาพผลการแก้ไข-หลังทดสอบ.png', 'png', '2026-06-04 13:41:00', '1780473474582-ewsbrp-Screenshot 2026-03-24 144136.png', 'show'),
(@req_id_4, @tk_id_4, NULL, 'resolution_evidence', 'ภาพยืนยันการทำงานหลังแก้ไข.png', 'png', '2026-06-04 13:42:00', '1780473474584-74crmr-Screenshot 2026-03-24 144303.png', 'show'),
(@req_id_4, @tk_id_4, NULL, 'customer_tracking_ticket', 'tracking-REQ-MOCK13-0004.pdf', 'pdf', '2026-06-04 13:43:00', '1780546540311-bo98al-RPT-20260603-0003.pdf', 'show');


-- ==========================================
-- Case 5: REQ-MOCK13-0005 (closed)
-- ==========================================
INSERT INTO `requests` (`request_no`, `customer_id`, `organization`, `system_id`, `problem_type_id`, `title`, `detail`, `status`, `score`, `created_at`, `closed_at`, `due_at`, `resolved_at`) VALUES
('REQ-MOCK13-0005', @customer_id, NULL, 1, 5, 'อัปโหลดเอกสารแล้วชื่อไฟล์เพี้ยน', 'หลังแนบไฟล์เอกสารภาษาไทยในหน้าแจ้งปัญหา ชื่อไฟล์ที่แสดงในหน้าติดตามกลายเป็นตัวอักษรเพี้ยน ทำให้ผู้ใช้งานไม่มั่นใจว่าแนบไฟล์ถูกต้องหรือไม่', 'closed', NULL, '2026-06-03 15:10:00', '2026-06-04 09:00:00', '2026-06-04', '2026-06-03');
SET @req_id_5 = LAST_INSERT_ID();

INSERT INTO `request_confirmations` (`request_id`, `customer_id`, `result`, `comment`, `score`, `confirmed_at`) VALUES
(@req_id_5, @customer_id, 'confirmed', 'ตรวจสอบแล้วชื่อไฟล์กลับมาอ่านได้ถูกต้อง', NULL, '2026-06-04 09:00:00');

INSERT INTO `request_status_logs` (`request_id`, `status`, `changed_by_type`, `changed_by_id`, `note`, `created_at`) VALUES
(@req_id_5, 'screening', 'staff', 1, 'คัดกรองเรื่องแล้ว', '2026-06-03 15:30:00'),
(@req_id_5, 'assigned', 'staff', 1, 'มอบหมายงานแล้ว', '2026-06-03 15:40:00'),
(@req_id_5, 'in_progress', 'staff', 2, 'เริ่มแก้ไขปัญหาชื่อไฟล์', '2026-06-03 16:00:00'),
(@req_id_5, 'waiting_confirm', 'staff', 1, 'ส่งผลการแก้ไขให้ลูกค้ายืนยัน', '2026-06-04 08:40:00'),
(@req_id_5, 'closed', 'customer', @customer_id, 'ลูกค้ายืนยันปิดงานแล้ว', '2026-06-04 09:00:00');

INSERT INTO `tickets` (`ticket_no`, `request_id`, `assigned_team_id`, `assigned_staff_id`, `assigned_by`, `due_at`, `assigned_note`, `title`, `description`, `status`, `created_at`, `resolved_at`, `customer_confirm_due_at`, `closed_at`) VALUES
('TK-MOCK13-0005', @req_id_5, 1, 2, 1, '2026-06-04 17:00:00', 'แก้ปัญหาการเข้ารหัสชื่อไฟล์ภาษาไทย', 'แก้ปัญหาชื่อไฟล์เพี้ยน', 'ปรับการถอดรหัสชื่อไฟล์ภาษาไทยทั้งตอนบันทึกและตอนแสดงผล รวมถึงทดสอบกับไฟล์เดิมที่เคยเพี้ยนแล้ว', 'closed', '2026-06-03 15:40:00', '2026-06-04 08:20:00', '2026-06-07 08:40:00', '2026-06-04 09:00:00');
SET @tk_id_5 = LAST_INSERT_ID();

INSERT INTO `ticket_assignments` (`ticket_id`, `assigned_team_id`, `assigned_staff_id`, `assigned_by`, `note`, `assigned_at`) VALUES
(@tk_id_5, 1, 2, 1, 'มอบหมายให้ตรวจสอบ encoding ชื่อไฟล์', '2026-06-03 15:40:00');

INSERT INTO `ticket_resolution_requests` (`ticket_id`, `requested_by`, `summary`, `status`, `reviewed_by`, `reviewed_at`, `reject_reason`, `created_at`) VALUES
(@tk_id_5, 2, 'ปรับการถอดรหัสชื่อไฟล์ภาษาไทยทั้งตอนบันทึกและตอนแสดงผล รวมถึงทดสอบกับไฟล์เดิมที่เคยเพี้ยนแล้ว', 'approved', 1, '2026-06-04 08:20:00', NULL, '2026-06-04 08:05:00');

INSERT INTO `ticket_status_logs` (`ticket_id`, `old_status`, `new_status`, `changed_by`, `note`, `created_at`) VALUES
(@tk_id_5, NULL, 'assigned', 1, 'สร้าง ticket', '2026-06-03 15:40:00'),
(@tk_id_5, 'assigned', 'in_progress', 2, 'เริ่มดำเนินการแก้ไข', '2026-06-03 16:00:00'),
(@tk_id_5, 'in_progress', 'resolved', 2, 'แก้ไขเสร็จและส่งขออนุมัติ', '2026-06-04 08:10:00'),
(@tk_id_5, 'resolved', 'waiting_confirm', 1, 'ส่งให้ลูกค้ายืนยัน', '2026-06-04 08:40:00'),
(@tk_id_5, 'waiting_confirm', 'closed', @customer_id, 'ลูกค้ายืนยันงานเรียบร้อย', '2026-06-04 09:00:00');

INSERT INTO `attachments` (`request_id`, `ticket_id`, `request_confirmation_id`, `attachment_type`, `original_name`, `file_ext`, `uploaded_at`, `saved_name`, `status`) VALUES
(@req_id_5, NULL, NULL, 'request_evidence', 'ตัวอย่างไฟล์ชื่อไทยที่เพี้ยน.pdf', 'pdf', '2026-06-03 15:12:00', '1780546540311-bo98al-RPT-20260603-0003.pdf', 'show'),
(@req_id_5, @tk_id_5, NULL, 'resolution_evidence', 'ภาพผลการแก้ไข-หลังทดสอบ.png', 'png', '2026-06-04 08:21:00', '1780473474582-ewsbrp-Screenshot 2026-03-24 144136.png', 'show'),
(@req_id_5, @tk_id_5, NULL, 'customer_tracking_ticket', 'tracking-REQ-MOCK13-0005.pdf', 'pdf', '2026-06-04 08:22:00', '1780546540311-bo98al-RPT-20260603-0003.pdf', 'show');


-- ==========================================
-- Case 6: REQ-MOCK13-0006 (closed with score)
-- ==========================================
INSERT INTO `requests` (`request_no`, `customer_id`, `organization`, `system_id`, `problem_type_id`, `title`, `detail`, `status`, `score`, `created_at`, `closed_at`, `due_at`, `resolved_at`) VALUES
('REQ-MOCK13-0006', @customer_id, NULL, 2, 1, 'ข้อมูลหน้าแดชบอร์ดไม่อัปเดต', 'ยอดสรุปในหน้าแดชบอร์ดไม่ตรงกับรายการล่าสุดที่เพิ่มเข้ามา ต้องกดรีเฟรชหลายครั้งถึงจะเห็นข้อมูลใหม่', 'closed', 5, '2026-06-02 10:00:00', '2026-06-02 14:20:00', '2026-06-03', '2026-06-02');
SET @req_id_6 = LAST_INSERT_ID();

INSERT INTO `request_confirmations` (`request_id`, `customer_id`, `result`, `comment`, `score`, `confirmed_at`) VALUES
(@req_id_6, @customer_id, 'confirmed', 'ข้อมูลอัปเดตตรงแล้วและใช้งานได้ตามปกติ', 5, '2026-06-02 14:20:00');

INSERT INTO `request_status_logs` (`request_id`, `status`, `changed_by_type`, `changed_by_id`, `note`, `created_at`) VALUES
(@req_id_6, 'screening', 'staff', 1, 'คัดกรองเรื่องแล้ว', '2026-06-02 10:25:00'),
(@req_id_6, 'assigned', 'staff', 1, 'มอบหมายงานแล้ว', '2026-06-02 10:30:00'),
(@req_id_6, 'in_progress', 'staff', 3, 'เริ่มแก้ไข cache ของ dashboard', '2026-06-02 11:10:00'),
(@req_id_6, 'waiting_confirm', 'staff', 1, 'ส่งให้ลูกค้ายืนยัน', '2026-06-02 13:50:00'),
(@req_id_6, 'closed', 'customer', @customer_id, 'ลูกค้ายืนยันและให้คะแนนแล้ว', '2026-06-02 14:20:00');

INSERT INTO `tickets` (`ticket_no`, `request_id`, `assigned_team_id`, `assigned_staff_id`, `assigned_by`, `due_at`, `assigned_note`, `title`, `description`, `status`, `created_at`, `resolved_at`, `customer_confirm_due_at`, `closed_at`) VALUES
('TK-MOCK13-0006', @req_id_6, 2, 3, 1, '2026-06-03 17:00:00', 'ตรวจสอบ dashboard summary cache', 'แก้ปัญหาหน้าแดชบอร์ดไม่อัปเดต', 'แก้ cache key ของ dashboard summary และเพิ่มการ refresh หลังบันทึกรายการสำเร็จ', 'closed', '2026-06-02 10:30:00', '2026-06-02 13:30:00', '2026-06-05 13:50:00', '2026-06-02 14:20:00');
SET @tk_id_6 = LAST_INSERT_ID();

INSERT INTO `ticket_assignments` (`ticket_id`, `assigned_team_id`, `assigned_staff_id`, `assigned_by`, `note`, `assigned_at`) VALUES
(@tk_id_6, 2, 3, 1, 'มอบหมายให้ทีมแอปพลิเคชัน', '2026-06-02 10:30:00');

INSERT INTO `ticket_resolution_requests` (`ticket_id`, `requested_by`, `summary`, `status`, `reviewed_by`, `reviewed_at`, `reject_reason`, `created_at`) VALUES
(@tk_id_6, 3, 'แก้ cache key ของ dashboard summary และเพิ่มการ refresh หลังบันทึกรายการสำเร็จ', 'approved', 1, '2026-06-02 13:30:00', NULL, '2026-06-02 13:10:00');

INSERT INTO `ticket_status_logs` (`ticket_id`, `old_status`, `new_status`, `changed_by`, `note`, `created_at`) VALUES
(@tk_id_6, NULL, 'assigned', 1, 'สร้าง ticket', '2026-06-02 10:30:00'),
(@tk_id_6, 'assigned', 'in_progress', 3, 'เริ่มแก้ไข', '2026-06-02 11:10:00'),
(@tk_id_6, 'in_progress', 'resolved', 3, 'แก้ไขเสร็จและส่งขออนุมัติ', '2026-06-02 13:20:00'),
(@tk_id_6, 'resolved', 'waiting_confirm', 1, 'ส่งให้ลูกค้ายืนยัน', '2026-06-02 13:50:00'),
(@tk_id_6, 'waiting_confirm', 'closed', @customer_id, 'ลูกค้ายืนยันและประเมินแล้ว', '2026-06-02 14:20:00');

INSERT INTO `attachments` (`request_id`, `ticket_id`, `request_confirmation_id`, `attachment_type`, `original_name`, `file_ext`, `uploaded_at`, `saved_name`, `status`) VALUES
(@req_id_6, @tk_id_6, NULL, 'resolution_evidence', 'ภาพยืนยันการทำงานหลังแก้ไข.png', 'png', '2026-06-02 13:31:00', '1780473474584-74crmr-Screenshot 2026-03-24 144303.png', 'show'),
(@req_id_6, @tk_id_6, NULL, 'customer_tracking_ticket', 'tracking-REQ-MOCK13-0006.pdf', 'pdf', '2026-06-02 13:32:00', '1780546540311-bo98al-RPT-20260603-0003.pdf', 'show');


-- ==========================================
-- Case 7: REQ-MOCK13-0007 (reopened case)
-- ==========================================
INSERT INTO `requests` (`request_no`, `customer_id`, `organization`, `system_id`, `problem_type_id`, `title`, `detail`, `status`, `score`, `created_at`, `closed_at`, `due_at`, `resolved_at`) VALUES
('REQ-MOCK13-0007', @customer_id, NULL, 3, 3, 'ข้อความหัวข้อยาวมากเพื่อใช้ทดสอบการแสดงผลบนหน้า track และการตีกลับงานหลังจากส่งผลการแก้ไขกลับมาแล้ว', 'เคสนี้ใช้ทดสอบข้อความยาวบนหน้า track, การมีไฟล์แนบตั้งต้น, การมีไฟล์หลักฐานการแก้ไข, และการตีกลับงานพร้อมแนบไฟล์เพิ่มเติมของลูกค้า', 'assigned', NULL, '2026-06-01 13:00:00', NULL, '2026-06-03', NULL);
SET @req_id_7 = LAST_INSERT_ID();

INSERT INTO `request_confirmations` (`request_id`, `customer_id`, `result`, `comment`, `score`, `confirmed_at`) VALUES
(@req_id_7, @customer_id, 'reopened', 'ยังพบปัญหาเดิมบางส่วน กรุณาตรวจสอบอีกครั้ง พร้อมแนบภาพประกอบเพิ่มเติม', NULL, '2026-06-02 09:15:00');
SET @rc_id_7 = LAST_INSERT_ID();

INSERT INTO `request_status_logs` (`request_id`, `status`, `changed_by_type`, `changed_by_id`, `note`, `created_at`) VALUES
(@req_id_7, 'screening', 'staff', 1, 'คัดกรองเรื่องแล้ว', '2026-06-01 13:20:00'),
(@req_id_7, 'assigned', 'staff', 1, 'มอบหมายงานรอบแรก', '2026-06-01 13:30:00'),
(@req_id_7, 'in_progress', 'staff', 4, 'เริ่มดำเนินการแก้ไข', '2026-06-01 14:15:00'),
(@req_id_7, 'waiting_confirm', 'staff', 1, 'ส่งให้ลูกค้ายืนยันรอบแรก', '2026-06-01 17:00:00'),
(@req_id_7, 'assigned', 'customer', @customer_id, 'ลูกค้าตีกลับงานและแนบไฟล์เพิ่มเติม', '2026-06-02 09:15:00');

INSERT INTO `tickets` (`ticket_no`, `request_id`, `assigned_team_id`, `assigned_staff_id`, `assigned_by`, `due_at`, `assigned_note`, `title`, `description`, `status`, `created_at`, `resolved_at`, `customer_confirm_due_at`, `closed_at`) VALUES
('TK-MOCK13-0007', @req_id_7, 1, 4, 1, '2026-06-03 17:00:00', 'รอรับข้อเสนอแนะล่าสุดจากลูกค้า', 'แก้ไขตามข้อเสนอแนะหลังตีกลับงาน', 'รอเจ้าหน้าที่รับงานใหม่ตามข้อเสนอแนะล่าสุดของลูกค้า', 'assigned', '2026-06-01 13:30:00', NULL, NULL, NULL);
SET @tk_id_7 = LAST_INSERT_ID();

INSERT INTO `ticket_assignments` (`ticket_id`, `assigned_team_id`, `assigned_staff_id`, `assigned_by`, `note`, `assigned_at`) VALUES
(@tk_id_7, 1, 4, 1, 'มอบหมายงานรอบใหม่หลังลูกค้าตีกลับ', '2026-06-02 09:20:00');

INSERT INTO `ticket_resolution_requests` (`ticket_id`, `requested_by`, `summary`, `status`, `reviewed_by`, `reviewed_at`, `reject_reason`, `created_at`) VALUES
(@tk_id_7, 4, 'ทดสอบแก้ไขรอบแรกและส่งผลให้ลูกค้ายืนยันแล้ว', 'approved', 1, '2026-06-01 16:50:00', NULL, '2026-06-01 16:40:00');

INSERT INTO `ticket_status_logs` (`ticket_id`, `old_status`, `new_status`, `changed_by`, `note`, `created_at`) VALUES
(@tk_id_7, NULL, 'assigned', 1, 'สร้าง ticket', '2026-06-01 13:30:00'),
(@tk_id_7, 'assigned', 'in_progress', 4, 'เริ่มแก้ไขรอบแรก', '2026-06-01 14:15:00'),
(@tk_id_7, 'in_progress', 'resolved', 4, 'ส่งผลการแก้ไขรอบแรก', '2026-06-01 16:45:00'),
(@tk_id_7, 'resolved', 'waiting_confirm', 1, 'ส่งให้ลูกค้ายืนยัน', '2026-06-01 17:00:00'),
(@tk_id_7, 'waiting_confirm', 'assigned', @customer_id, 'ลูกค้าตีกลับงาน', '2026-06-02 09:15:00');

INSERT INTO `attachments` (`request_id`, `ticket_id`, `request_confirmation_id`, `attachment_type`, `original_name`, `file_ext`, `uploaded_at`, `saved_name`, `status`) VALUES
(@req_id_7, NULL, NULL, 'request_evidence', 'ภาพแจ้งปัญหาเดิม-01.png', 'png', '2026-06-01 13:02:00', '1780473474571-l0vvqs-Screenshot 2026-03-24 143800.png', 'show'),
(@req_id_7, NULL, NULL, 'request_evidence', 'ภาพแจ้งปัญหาเดิม-02.png', 'png', '2026-06-01 13:03:00', '1780473474573-f4hfe6-Screenshot 2026-03-24 143844.png', 'show'),
(@req_id_7, @tk_id_7, NULL, 'resolution_evidence', 'ภาพผลการแก้ไขรอบแรก.png', 'png', '2026-06-01 16:51:00', '1780473474582-ewsbrp-Screenshot 2026-03-24 144136.png', 'show'),
(@req_id_7, NULL, @rc_id_7, 'reopen_evidence', 'ภาพปัญหาเพิ่มเติมหลังตีกลับ.png', 'png', '2026-06-02 09:16:00', '1780473474584-74crmr-Screenshot 2026-03-24 144303.png', 'show');

SET FOREIGN_KEY_CHECKS = 1;
