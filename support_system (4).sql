-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 11, 2026 at 04:58 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `support_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `attachments`
--

CREATE TABLE `attachments` (
  `id` int(10) UNSIGNED NOT NULL,
  `report_id` int(10) UNSIGNED DEFAULT NULL,
  `ticket_id` int(10) UNSIGNED DEFAULT NULL,
  `attachment_type` enum('report_evidence','customer_tracking_ticket','assignment_ticket','resolution_evidence') NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `file_ext` enum('pdf','jpg','jpeg','png') NOT NULL,
  `uploaded_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attachments`
--

INSERT INTO `attachments` (`id`, `report_id`, `ticket_id`, `attachment_type`, `original_name`, `file_ext`, `uploaded_at`) VALUES
(1, 1, NULL, 'report_evidence', 'login-error-screen.png', 'png', '2026-05-08 08:01:00'),
(2, 3, NULL, 'report_evidence', 'network-error.jpg', 'jpg', '2026-05-08 08:31:00'),
(3, 5, NULL, 'report_evidence', 'complaint-detail.pdf', 'pdf', '2026-05-08 09:01:00'),
(4, NULL, 1, 'assignment_ticket', 'assignment-TCK-20260508-0001.pdf', 'pdf', '2026-05-08 08:26:00'),
(5, NULL, 3, 'resolution_evidence', 'fixed-report-result.png', 'png', '2026-05-08 11:25:00'),
(6, NULL, 4, 'resolution_evidence', 'service-followup.pdf', 'pdf', '2026-05-08 13:50:00'),
(7, NULL, 5, 'customer_tracking_ticket', 'tracking-TCK-20260508-0005.pdf', 'pdf', '2026-05-08 09:46:00'),
(8, NULL, 6, 'resolution_evidence', 'server-log-result.jpeg', 'jpeg', '2026-05-08 10:28:00');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `surname` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `customer_type` enum('person','company') NOT NULL,
  `status` enum('pending','approved','rejected','inactive') DEFAULT 'pending',
  `password_hash` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `surname`, `email`, `phone`, `customer_type`, `status`, `password_hash`, `created_at`, `updated_at`) VALUES
(1, 'สมชาย', 'ใจดี', 'somchai@example.com', '0811111111', 'person', 'approved', '$2b$10$mockhashcustomer1', '2026-05-01 10:00:00', '2026-05-01 10:00:00'),
(2, 'วราภรณ์', 'มั่นคง', 'waraporn@example.com', '0822222222', 'person', 'approved', '$2b$10$mockhashcustomer2', '2026-05-01 10:05:00', '2026-05-01 10:05:00'),
(3, 'บริษัท เอ็นไอดี', 'เทคโนโลยี', 'contact@nidtech.com', '023333333', 'company', 'approved', '$2b$10$mockhashcustomer3', '2026-05-01 10:10:00', '2026-05-01 10:10:00'),
(4, 'ลูกค้าใหม่', 'รออนุมัติ', 'pending@example.com', '0844444444', 'person', 'pending', '$2b$10$mockhashcustomer4', '2026-05-01 10:15:00', '2026-05-01 10:15:00'),
(5, 'ลูกค้าถูกปฏิเสธ', 'ทดสอบ', 'rejected@example.com', '0855555555', 'person', 'rejected', '$2b$10$mockhashcustomer5', '2026-05-01 10:20:00', '2026-05-01 10:20:00'),
(6, 'ลูกค้าเก่า', 'ปิดใช้งาน', 'inactive@example.com', '0866666666', 'company', 'inactive', '$2b$10$mockhashcustomer6', '2026-05-01 10:25:00', '2026-05-01 10:25:00');

-- --------------------------------------------------------

--
-- Table structure for table `customer_organizations`
--

CREATE TABLE `customer_organizations` (
  `id` int(10) UNSIGNED NOT NULL,
  `customer_id` int(10) UNSIGNED NOT NULL,
  `organization_id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customer_organizations`
--

INSERT INTO `customer_organizations` (`id`, `customer_id`, `organization_id`, `created_at`) VALUES
(1, 3, 1, '2026-05-01 10:30:00'),
(2, 6, 3, '2026-05-01 10:35:00'),
(3, 2, 2, '2026-05-01 10:40:00');

-- --------------------------------------------------------

--
-- Table structure for table `login_logs`
--

CREATE TABLE `login_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_type` enum('customer','staff') NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `login_at` datetime DEFAULT current_timestamp(),
  `status` enum('success','failed') NOT NULL,
  `fail_reason` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `login_logs`
--

INSERT INTO `login_logs` (`id`, `user_type`, `user_id`, `ip_address`, `user_agent`, `login_at`, `status`, `fail_reason`) VALUES
(1, 'customer', 1, '192.168.1.10', 'Chrome on Windows', '2026-05-08 07:50:00', 'success', NULL),
(2, 'customer', 4, '192.168.1.11', 'Chrome on Android', '2026-05-08 07:55:00', 'failed', 'account_pending'),
(3, 'staff', 1, '10.0.0.10', 'Chrome on Windows', '2026-05-08 08:00:00', 'success', NULL),
(4, 'staff', 2, '10.0.0.11', 'Edge on Windows', '2026-05-08 08:02:00', 'success', NULL),
(5, 'staff', 8, '10.0.0.12', 'Chrome on Windows', '2026-05-08 08:05:00', 'failed', 'account_inactive'),
(6, 'customer', 1, '192.168.1.10', 'Chrome on Windows', '2026-05-08 08:10:00', 'failed', 'invalid_password');

-- --------------------------------------------------------

--
-- Table structure for table `organizations`
--

CREATE TABLE `organizations` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('company','government','other') NOT NULL DEFAULT 'company',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `organizations`
--

INSERT INTO `organizations` (`id`, `name`, `type`, `status`, `created_at`, `updated_at`) VALUES
(1, 'NID Technology Co., Ltd.', 'company', 'active', '2026-05-01 09:05:00', '2026-05-01 09:05:00'),
(2, 'Bangkok Digital Service', 'government', 'active', '2026-05-01 09:10:00', '2026-05-01 09:10:00'),
(3, 'ProTech Partner Group', 'company', 'inactive', '2026-05-01 09:15:00', '2026-05-01 09:15:00'),
(4, 'Other Customer Organization', 'other', 'active', '2026-05-01 09:20:00', '2026-05-01 09:20:00');

-- --------------------------------------------------------

--
-- Table structure for table `password_logs`
--

CREATE TABLE `password_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_type` enum('customer','staff') NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `changed_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `password_logs`
--

INSERT INTO `password_logs` (`id`, `user_type`, `user_id`, `password_hash`, `changed_at`) VALUES
(1, 'customer', 1, '$2b$10$oldcustomerhash1', '2026-05-01 10:00:00'),
(2, 'customer', 1, '$2b$10$newcustomerhash1', '2026-05-07 18:00:00'),
(3, 'staff', 1, '$2b$10$oldstaffhash1', '2026-05-01 11:00:00'),
(4, 'staff', 4, '$2b$10$newstaffhash4', '2026-05-06 09:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `problem_types`
--

CREATE TABLE `problem_types` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `report_type` enum('issue','complaint') NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `problem_types`
--

INSERT INTO `problem_types` (`id`, `name`, `report_type`, `status`, `created_at`, `updated_at`) VALUES
(1, 'เข้าสู่ระบบไม่ได้', 'issue', 'active', '2026-05-01 13:30:00', '2026-05-01 13:30:00'),
(2, 'ระบบช้า/โหลดไม่ขึ้น', 'issue', 'active', '2026-05-01 13:31:00', '2026-05-01 13:31:00'),
(3, 'เครือข่ายใช้งานไม่ได้', 'issue', 'active', '2026-05-01 13:32:00', '2026-05-01 13:32:00'),
(4, 'ข้อมูลแสดงผลผิดพลาด', 'issue', 'active', '2026-05-01 13:33:00', '2026-05-01 13:33:00'),
(5, 'ร้องเรียนการให้บริการล่าช้า', 'complaint', 'active', '2026-05-01 13:34:00', '2026-05-01 13:34:00'),
(6, 'ร้องเรียนพฤติกรรมเจ้าหน้าที่', 'complaint', 'active', '2026-05-01 13:35:00', '2026-05-01 13:35:00'),
(7, 'ประเภทปัญหาเก่า', 'issue', 'inactive', '2026-05-01 13:36:00', '2026-05-01 13:36:00');

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` int(10) UNSIGNED NOT NULL,
  `report_no` varchar(50) NOT NULL,
  `customer_id` int(10) UNSIGNED NOT NULL,
  `system_id` int(10) UNSIGNED DEFAULT NULL,
  `problem_type_id` int(10) UNSIGNED DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `detail` text NOT NULL,
  `status` enum('screening','assigned','in_progress','waiting_confirm','closed','rejected') DEFAULT 'screening',
  `score` tinyint(3) UNSIGNED DEFAULT NULL,
  `reject_reason` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `resolve_due_at` datetime DEFAULT NULL,
  `closed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reports`
--

INSERT INTO `reports` (`id`, `report_no`, `customer_id`, `system_id`, `problem_type_id`, `title`, `detail`, `status`, `score`, `reject_reason`, `created_at`, `resolve_due_at`, `closed_at`) VALUES
(1, 'REP-20260508-0001', 1, 1, 1, 'เข้าสู่ระบบไม่ได้', 'ลูกค้าแจ้งว่า login แล้วขึ้นรหัสผ่านไม่ถูกต้อง ทั้งที่กรอกถูก', 'screening', NULL, NULL, '2026-05-08 08:00:00', '2026-05-10 08:00:00', NULL),
(2, 'REP-20260508-0002', 1, 1, 2, 'ระบบโหลดช้ามาก', 'หน้า dashboard ใช้เวลานานกว่า 30 วินาที', 'assigned', NULL, NULL, '2026-05-08 08:15:00', '2026-05-10 08:15:00', NULL),
(3, 'REP-20260508-0003', 2, 3, 3, 'ใช้งานเครือข่ายไม่ได้', 'เข้าใช้งานระบบ E-Service ผ่านเครือข่ายสำนักงานไม่ได้', 'in_progress', NULL, NULL, '2026-05-08 08:30:00', '2026-05-10 08:30:00', NULL),
(4, 'REP-20260508-0004', 3, 1, 4, 'ข้อมูลในรายงานไม่ถูกต้อง', 'รายงานสถานะงานแสดงจำนวนไม่ตรงกับข้อมูลจริง', 'closed', NULL, NULL, '2026-05-08 08:45:00', '2026-05-10 08:45:00', '2026-05-08 13:36:46'),
(5, 'REP-20260508-0005', 3, 1, 5, 'ร้องเรียนการให้บริการล่าช้า', 'รอเจ้าหน้าที่ติดต่อกลับนานเกินกำหนด', 'closed', 5, NULL, '2026-05-08 09:00:00', '2026-05-10 09:00:00', '2026-05-08 15:30:00'),
(6, 'REP-20260508-0006', 2, 2, 6, 'ร้องเรียนเจ้าหน้าที่พูดจาไม่เหมาะสม', 'ลูกค้าระบุว่าได้รับการสื่อสารไม่สุภาพ', 'rejected', NULL, 'ข้อมูลไม่เพียงพอและไม่พบหลักฐานประกอบ', '2026-05-08 09:15:00', '2026-05-06 13:25:54', NULL),
(7, 'REP-20260508-0007', 1, 1, 2, 'เปิดซ้ำหลังปิดงาน', 'ลูกค้ายืนยันว่าอาการเดิมกลับมาเกิดอีกครั้ง', 'in_progress', NULL, NULL, '2026-05-08 09:30:00', '2026-05-11 09:30:00', NULL),
(8, 'REP-20260508-0008', 2, 3, 1, 'ต้องการข้อมูลเพิ่มก่อนคัดกรอง', 'รายละเอียดที่แจ้งมายังไม่ชัดเจน', 'screening', NULL, NULL, '2026-05-08 09:45:00', '2026-05-05 13:26:02', NULL),
(9, 'REP-20260508-0009', 1, 1, 4, 'งานถูกยกเลิก', 'แจ้งผิดระบบ ลูกค้าขอยกเลิกรายการ', 'closed', 3, NULL, '2026-05-08 10:00:00', '2026-05-10 10:00:00', '2026-05-08 12:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `report_confirmations`
--

CREATE TABLE `report_confirmations` (
  `id` int(10) UNSIGNED NOT NULL,
  `report_id` int(10) UNSIGNED NOT NULL,
  `customer_id` int(10) UNSIGNED NOT NULL,
  `result` enum('confirmed','reopened') NOT NULL,
  `comment` text DEFAULT NULL,
  `score` tinyint(3) UNSIGNED DEFAULT NULL,
  `confirmed_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `report_confirmations`
--

INSERT INTO `report_confirmations` (`id`, `report_id`, `customer_id`, `result`, `comment`, `score`, `confirmed_at`) VALUES
(1, 5, 3, 'confirmed', 'เจ้าหน้าที่ติดต่อกลับและแก้ไขความล่าช้าเรียบร้อย', 5, '2026-05-08 15:30:00'),
(2, 7, 1, 'reopened', 'ยังพบปัญหาเดิมหลังจากแจ้งว่าแก้ไขแล้ว', NULL, '2026-05-08 09:30:00'),
(3, 9, 1, 'confirmed', 'แจ้งผิดระบบ ขอยกเลิกรายการ', 3, '2026-05-08 12:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `report_status_logs`
--

CREATE TABLE `report_status_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `report_id` int(10) UNSIGNED NOT NULL,
  `old_status` varchar(50) DEFAULT NULL,
  `new_status` varchar(50) NOT NULL,
  `changed_by_type` enum('customer','staff','system') NOT NULL,
  `changed_by_id` int(10) UNSIGNED DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `report_status_logs`
--

INSERT INTO `report_status_logs` (`id`, `report_id`, `old_status`, `new_status`, `changed_by_type`, `changed_by_id`, `note`, `created_at`) VALUES
(1, 1, NULL, 'screening', 'customer', 1, 'ลูกค้าส่งเรื่องใหม่', '2026-05-08 08:00:00'),
(2, 2, NULL, 'screening', 'customer', 1, 'ลูกค้าส่งเรื่องใหม่', '2026-05-08 08:15:00'),
(3, 2, 'screening', 'assigned', 'staff', 2, 'คัดกรองผ่านและส่งมอบหมายงาน', '2026-05-08 08:20:00'),
(4, 3, NULL, 'screening', 'customer', 2, 'ลูกค้าส่งเรื่องใหม่', '2026-05-08 08:30:00'),
(5, 3, 'screening', 'assigned', 'staff', 2, 'คัดกรองผ่าน', '2026-05-08 08:35:00'),
(6, 3, 'assigned', 'in_progress', 'staff', 5, 'เจ้าหน้าที่รับงานแล้ว', '2026-05-08 09:00:00'),
(7, 4, NULL, 'screening', 'customer', 3, 'ลูกค้าส่งเรื่องใหม่', '2026-05-08 08:45:00'),
(8, 4, 'screening', 'assigned', 'staff', 7, 'ส่งทีม Application', '2026-05-08 08:50:00'),
(9, 4, 'assigned', 'in_progress', 'staff', 7, 'เริ่มแก้ไข', '2026-05-08 09:10:00'),
(10, 4, 'in_progress', 'waiting_confirm', 'staff', 7, 'แก้ไขเสร็จ รอลูกค้ายืนยัน', '2026-05-05 11:30:00'),
(11, 5, NULL, 'screening', 'customer', 3, 'ลูกค้าส่งข้อร้องเรียน', '2026-05-08 09:00:00'),
(12, 5, 'screening', 'assigned', 'staff', 2, 'คัดกรองผ่าน', '2026-05-08 09:05:00'),
(13, 5, 'assigned', 'in_progress', 'staff', 6, 'รับเรื่องร้องเรียน', '2026-05-08 09:30:00'),
(14, 5, 'in_progress', 'waiting_confirm', 'staff', 6, 'สรุปผลการดำเนินการ', '2026-05-06 14:00:00'),
(15, 5, 'waiting_confirm', 'closed', 'customer', 3, 'ลูกค้ายืนยันและให้คะแนน', '2026-05-08 15:30:00'),
(16, 6, NULL, 'screening', 'customer', 2, 'ลูกค้าส่งข้อร้องเรียน', '2026-05-08 09:15:00'),
(17, 6, 'screening', 'rejected', 'staff', 2, 'ปฏิเสธจากขั้นคัดกรอง', '2026-05-08 09:20:00'),
(18, 7, NULL, 'screening', 'customer', 1, 'ลูกค้าแจ้งอาการเดิมกลับมา', '2026-05-08 09:30:00'),
(19, 7, 'screening', 'assigned', 'staff', 7, 'ส่งให้ทีม IT ตรวจสอบซ้ำ', '2026-05-08 09:40:00'),
(20, 7, 'assigned', 'in_progress', 'staff', 4, 'รับงานเปิดซ้ำ', '2026-05-08 10:00:00'),
(21, 8, NULL, 'screening', 'customer', 2, 'ลูกค้าส่งเรื่องใหม่', '2026-05-08 09:45:00'),
(22, 9, NULL, 'screening', 'customer', 1, 'ลูกค้าส่งเรื่องใหม่', '2026-05-08 10:00:00'),
(23, 9, 'screening', 'closed', 'customer', 1, 'ลูกค้าขอยกเลิกหลังแจ้งผิดระบบ', '2026-05-08 12:00:00'),
(24, 4, 'waiting_confirm', 'closed', 'system', NULL, 'System auto-closed after customer confirmation deadline expired', '2026-05-08 13:36:46');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `created_at`) VALUES
(1, 'admin', '2026-05-01 09:00:00'),
(2, 'screening', '2026-05-01 09:00:00'),
(3, 'assignment', '2026-05-01 09:00:00'),
(4, 'operator', '2026-05-01 09:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `screenings`
--

CREATE TABLE `screenings` (
  `id` int(10) UNSIGNED NOT NULL,
  `report_id` int(10) UNSIGNED NOT NULL,
  `screened_by` int(10) UNSIGNED NOT NULL,
  `result` enum('accepted','rejected','need_more_info') NOT NULL,
  `note` text DEFAULT NULL,
  `screened_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `screenings`
--

INSERT INTO `screenings` (`id`, `report_id`, `screened_by`, `result`, `note`, `screened_at`) VALUES
(1, 1, 2, 'need_more_info', 'ขอภาพหน้าจอ error เพิ่มเติม', '2026-05-08 08:05:00'),
(2, 2, 2, 'accepted', 'รับเรื่องและส่งต่อให้ผู้มอบหมายงาน', '2026-05-08 08:20:00'),
(3, 3, 2, 'accepted', 'เป็นปัญหาเครือข่าย ส่งทีม Network', '2026-05-08 08:35:00'),
(4, 4, 7, 'accepted', 'ตรวจสอบแล้วเป็นปัญหาข้อมูลรายงาน', '2026-05-08 08:50:00'),
(5, 5, 2, 'accepted', 'รับเป็นข้อร้องเรียนด้านบริการ', '2026-05-08 09:05:00'),
(6, 6, 2, 'rejected', 'ข้อมูลไม่เพียงพอและไม่พบหลักฐานประกอบ', '2026-05-08 09:20:00'),
(7, 7, 7, 'accepted', 'เป็นงานเปิดซ้ำหลังลูกค้าปฏิเสธการปิดงาน', '2026-05-08 09:35:00'),
(8, 8, 2, 'need_more_info', 'ขอรายละเอียดรหัสผู้ใช้และช่วงเวลาที่เกิดปัญหา', '2026-05-08 09:50:00'),
(9, 9, 2, 'accepted', 'รับเรื่องก่อนลูกค้าขอยกเลิก', '2026-05-08 10:05:00');

-- --------------------------------------------------------

--
-- Table structure for table `staffs`
--

CREATE TABLE `staffs` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `surname` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `staffs`
--

INSERT INTO `staffs` (`id`, `name`, `surname`, `email`, `phone`, `password_hash`, `status`, `created_at`, `updated_at`) VALUES
(1, 'อดิศักดิ์', 'ผู้ดูแล', 'admin@protech.com', '0900000001', '$2b$10$mockhashstaff1', 'active', '2026-05-01 11:00:00', '2026-05-01 11:00:00'),
(2, 'ปวีณา', 'คัดกรอง', 'screening@protech.com', '0900000002', '$2b$10$mockhashstaff2', 'active', '2026-05-01 11:05:00', '2026-05-01 11:05:00'),
(3, 'กิตติ', 'มอบหมาย', 'assignment@protech.com', '0900000003', '$2b$10$mockhashstaff3', 'active', '2026-05-01 11:10:00', '2026-05-01 11:10:00'),
(4, 'ณัฐพล', 'ไอที', 'operator.it@protech.com', '0900000004', '$2b$10$mockhashstaff4', 'active', '2026-05-01 11:15:00', '2026-05-01 11:15:00'),
(5, 'รัตนา', 'เน็ตเวิร์ก', 'operator.network@protech.com', '0900000005', '$2b$10$mockhashstaff5', 'active', '2026-05-01 11:20:00', '2026-05-01 11:20:00'),
(6, 'วิชัย', 'ซัพพอร์ต', 'operator.support@protech.com', '0900000006', '$2b$10$mockhashstaff6', 'active', '2026-05-01 11:25:00', '2026-05-01 11:25:00'),
(7, 'มานพ', 'หลายบทบาท', 'multi.role@protech.com', '0900000007', '$2b$10$mockhashstaff7', 'active', '2026-05-01 11:30:00', '2026-05-01 11:30:00'),
(8, 'พนักงานเก่า', 'ปิดใช้งาน', 'inactive.staff@protech.com', '0900000008', '$2b$10$mockhashstaff8', 'inactive', '2026-05-01 11:35:00', '2026-05-01 11:35:00');

-- --------------------------------------------------------

--
-- Table structure for table `staff_team_roles`
--

CREATE TABLE `staff_team_roles` (
  `id` int(10) UNSIGNED NOT NULL,
  `staff_id` int(10) UNSIGNED NOT NULL,
  `team_id` int(10) UNSIGNED NOT NULL,
  `role_id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `staff_team_roles`
--

INSERT INTO `staff_team_roles` (`id`, `staff_id`, `team_id`, `role_id`, `created_at`) VALUES
(1, 1, 1, 1, '2026-05-01 12:30:00'),
(2, 2, 4, 2, '2026-05-01 12:31:00'),
(3, 3, 4, 3, '2026-05-01 12:32:00'),
(4, 4, 1, 4, '2026-05-01 12:33:00'),
(5, 5, 2, 4, '2026-05-01 12:34:00'),
(6, 6, 4, 4, '2026-05-01 12:35:00'),
(7, 7, 1, 2, '2026-05-01 12:36:00'),
(8, 7, 1, 3, '2026-05-01 12:37:00'),
(9, 7, 3, 4, '2026-05-01 12:38:00'),
(10, 8, 5, 4, '2026-05-01 12:39:00');

-- --------------------------------------------------------

--
-- Table structure for table `systems`
--

CREATE TABLE `systems` (
  `id` int(10) UNSIGNED NOT NULL,
  `organization_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `systems`
--

INSERT INTO `systems` (`id`, `organization_id`, `name`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'ระบบ ProTech Support', 'active', '2026-05-01 13:00:00', '2026-05-01 13:00:00'),
(2, 1, 'ระบบ HR Portal', 'active', '2026-05-01 13:05:00', '2026-05-01 13:05:00'),
(3, 2, 'ระบบ E-Service', 'active', '2026-05-01 13:10:00', '2026-05-01 13:10:00'),
(4, 3, 'ระบบเก่า Legacy', 'inactive', '2026-05-01 13:15:00', '2026-05-01 13:15:00');

-- --------------------------------------------------------

--
-- Table structure for table `teams`
--

CREATE TABLE `teams` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `teams`
--

INSERT INTO `teams` (`id`, `name`, `status`, `created_at`, `updated_at`) VALUES
(1, 'ทีม IT Support', 'active', '2026-05-01 12:00:00', '2026-05-01 12:00:00'),
(2, 'ทีม Network', 'active', '2026-05-01 12:05:00', '2026-05-01 12:05:00'),
(3, 'ทีม Application', 'active', '2026-05-01 12:10:00', '2026-05-01 12:10:00'),
(4, 'ทีม Customer Service', 'active', '2026-05-01 12:15:00', '2026-05-01 12:15:00'),
(5, 'ทีมเก่า', 'inactive', '2026-05-01 12:20:00', '2026-05-01 12:20:00');

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` int(10) UNSIGNED NOT NULL,
  `ticket_no` varchar(50) NOT NULL,
  `report_id` int(10) UNSIGNED NOT NULL,
  `parent_ticket_id` int(10) UNSIGNED DEFAULT NULL,
  `assigned_team_id` int(10) UNSIGNED DEFAULT NULL,
  `assigned_staff_id` int(10) UNSIGNED DEFAULT NULL,
  `assigned_by` int(10) UNSIGNED DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('assigned','in_progress','resolved','waiting_confirm','closed','rejected','cancelled') DEFAULT 'assigned',
  `created_at` datetime DEFAULT current_timestamp(),
  `resolved_at` datetime DEFAULT NULL,
  `customer_confirm_due_at` datetime DEFAULT NULL,
  `closed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tickets`
--

INSERT INTO `tickets` (`id`, `ticket_no`, `report_id`, `parent_ticket_id`, `assigned_team_id`, `assigned_staff_id`, `assigned_by`, `title`, `description`, `status`, `created_at`, `resolved_at`, `customer_confirm_due_at`, `closed_at`) VALUES
(1, 'TCK-20260508-0001', 2, NULL, 1, NULL, 3, 'ตรวจสอบระบบโหลดช้า', 'งานหลักสำหรับตรวจสอบ performance', 'assigned', '2026-05-08 08:25:00', NULL, NULL, NULL),
(2, 'TCK-20260508-0002', 3, NULL, 2, 5, 3, 'ตรวจสอบเครือข่ายสำนักงาน', 'ตรวจสอบ connectivity และ DNS', 'in_progress', '2026-05-08 08:40:00', NULL, NULL, NULL),
(3, 'TCK-20260508-0003', 4, NULL, 3, 7, 3, 'แก้ข้อมูลรายงานผิดพลาด', 'งานหลักทีม Application', 'closed', '2026-05-08 08:55:00', '2026-05-08 11:30:00', '2026-05-11 11:30:00', '2026-05-08 13:36:46'),
(4, 'TCK-20260508-0004', 5, NULL, 4, 6, 3, 'ตรวจสอบข้อร้องเรียนบริการล่าช้า', 'ติดต่อกลับลูกค้าและสรุปผล', 'closed', '2026-05-08 09:10:00', '2026-05-08 14:00:00', '2026-05-11 14:00:00', '2026-05-08 15:30:00'),
(5, 'TCK-20260508-0005', 7, NULL, 1, 4, 7, 'แก้ไขอาการเปิดซ้ำ', 'งานเปิดซ้ำหลังลูกค้าปฏิเสธการปิดงาน', 'in_progress', '2026-05-08 09:45:00', NULL, NULL, NULL),
(6, 'TCK-20260508-0006', 2, 1, 1, 4, 3, 'Sub-task: ตรวจสอบ server log', 'ตรวจสอบ error log ของ backend', 'resolved', '2026-05-08 08:30:00', '2026-05-08 10:30:00', NULL, NULL),
(7, 'TCK-20260508-0007', 2, 1, 2, 5, 3, 'Sub-task: ตรวจสอบ network latency', 'ตรวจสอบ latency ระหว่าง client และ server', 'rejected', '2026-05-08 08:32:00', NULL, NULL, NULL),
(8, 'TCK-20260508-0008', 9, NULL, 1, 4, 3, 'งานที่ถูกยกเลิก', 'ลูกค้าแจ้งผิดระบบและขอยกเลิก', 'cancelled', '2026-05-08 10:10:00', NULL, NULL, '2026-05-08 12:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `ticket_assignments`
--

CREATE TABLE `ticket_assignments` (
  `id` int(10) UNSIGNED NOT NULL,
  `ticket_id` int(10) UNSIGNED NOT NULL,
  `assigned_team_id` int(10) UNSIGNED DEFAULT NULL,
  `assigned_staff_id` int(10) UNSIGNED DEFAULT NULL,
  `assigned_by` int(10) UNSIGNED NOT NULL,
  `note` text DEFAULT NULL,
  `assigned_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ticket_assignments`
--

INSERT INTO `ticket_assignments` (`id`, `ticket_id`, `assigned_team_id`, `assigned_staff_id`, `assigned_by`, `note`, `assigned_at`) VALUES
(1, 1, 1, NULL, 3, 'มอบหมายให้ทีม IT Support ตรวจสอบก่อน', '2026-05-08 08:25:00'),
(2, 2, 2, 5, 3, 'มอบหมายให้เจ้าหน้าที่ Network', '2026-05-08 08:40:00'),
(3, 3, 3, 7, 3, 'มอบหมายให้ทีม Application', '2026-05-08 08:55:00'),
(4, 4, 4, 6, 3, 'มอบหมายทีม Customer Service จัดการข้อร้องเรียน', '2026-05-08 09:10:00'),
(5, 5, 1, 4, 7, 'เปิดซ้ำและส่งให้ operator เดิมตรวจสอบ', '2026-05-08 09:45:00'),
(6, 6, 1, 4, 3, 'แตกงานย่อยตรวจสอบ log', '2026-05-08 08:30:00'),
(7, 7, 2, 5, 3, 'แตกงานย่อยตรวจสอบ network', '2026-05-08 08:32:00'),
(8, 8, 1, 4, 3, 'มอบหมายก่อนลูกค้าขอยกเลิก', '2026-05-08 10:10:00'),
(9, 1, 1, 4, 3, 'ระบุผู้รับผิดชอบหลักหลังตรวจสอบเบื้องต้น', '2026-05-08 10:45:00');

-- --------------------------------------------------------

--
-- Table structure for table `ticket_resolution_requests`
--

CREATE TABLE `ticket_resolution_requests` (
  `id` int(10) UNSIGNED NOT NULL,
  `ticket_id` int(10) UNSIGNED NOT NULL,
  `requested_by` int(10) UNSIGNED NOT NULL,
  `summary` text NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `reviewed_by` int(10) UNSIGNED DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `reject_reason` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ticket_resolution_requests`
--

INSERT INTO `ticket_resolution_requests` (`id`, `ticket_id`, `requested_by`, `summary`, `status`, `reviewed_by`, `reviewed_at`, `reject_reason`, `created_at`) VALUES
(1, 3, 7, 'แก้ไขการดึงข้อมูลรายงานและทดสอบแล้ว ขอลูกค้ายืนยัน', 'approved', 3, '2026-05-08 11:30:00', NULL, '2026-05-08 11:20:00'),
(2, 4, 6, 'ติดต่อกลับลูกค้า ชี้แจง และปิดข้อร้องเรียนเรียบร้อย', 'approved', 3, '2026-05-08 14:00:00', NULL, '2026-05-08 13:45:00'),
(3, 5, 4, 'แก้ไขอาการเปิดซ้ำแล้ว ขอลูกค้าตรวจสอบอีกครั้ง', 'pending', NULL, NULL, NULL, '2026-05-08 11:00:00'),
(4, 7, 5, 'ไม่พบปัญหาเครือข่าย จึงขอปิดงานย่อย', 'rejected', 3, '2026-05-08 10:45:00', 'ยังไม่มีหลักฐานเพียงพอ ต้องแนบผลทดสอบเพิ่ม', '2026-05-08 10:25:00');

-- --------------------------------------------------------

--
-- Table structure for table `ticket_status_logs`
--

CREATE TABLE `ticket_status_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `ticket_id` int(10) UNSIGNED NOT NULL,
  `old_status` varchar(50) DEFAULT NULL,
  `new_status` varchar(50) NOT NULL,
  `changed_by` int(10) UNSIGNED DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ticket_status_logs`
--

INSERT INTO `ticket_status_logs` (`id`, `ticket_id`, `old_status`, `new_status`, `changed_by`, `note`, `created_at`) VALUES
(1, 1, NULL, 'assigned', 3, 'สร้าง ticket หลักและมอบหมายทีม', '2026-05-08 08:25:00'),
(2, 1, 'assigned', 'assigned', 3, 'แตกงานย่อย 2 งาน', '2026-05-08 08:32:00'),
(3, 2, NULL, 'assigned', 3, 'มอบหมายทีม Network', '2026-05-08 08:40:00'),
(4, 2, 'assigned', 'in_progress', 5, 'operator รับงาน', '2026-05-08 09:00:00'),
(5, 3, NULL, 'assigned', 3, 'มอบหมายทีม Application', '2026-05-08 08:55:00'),
(6, 3, 'assigned', 'in_progress', 7, 'เริ่มดำเนินการ', '2026-05-08 09:10:00'),
(7, 3, 'in_progress', 'resolved', 7, 'ดำเนินการเสร็จและส่งคำขอปิดงาน', '2026-05-08 11:20:00'),
(8, 3, 'resolved', 'waiting_confirm', 3, 'อนุมัติคำขอปิดงาน รอลูกค้ายืนยัน', '2026-05-08 11:30:00'),
(9, 4, NULL, 'assigned', 3, 'มอบหมายข้อร้องเรียน', '2026-05-08 09:10:00'),
(10, 4, 'assigned', 'in_progress', 6, 'รับเรื่องร้องเรียน', '2026-05-08 09:30:00'),
(11, 4, 'in_progress', 'resolved', 6, 'ดำเนินการเสร็จ', '2026-05-08 13:45:00'),
(12, 4, 'resolved', 'waiting_confirm', 3, 'อนุมัติและรอลูกค้ายืนยัน', '2026-05-08 14:00:00'),
(13, 4, 'waiting_confirm', 'closed', 3, 'ลูกค้ายืนยันปิดงานแล้ว', '2026-05-08 15:30:00'),
(14, 5, NULL, 'assigned', 7, 'สร้างงานเปิดซ้ำ', '2026-05-08 09:45:00'),
(15, 5, 'assigned', 'in_progress', 4, 'operator รับงานเปิดซ้ำ', '2026-05-08 10:00:00'),
(16, 6, NULL, 'assigned', 3, 'สร้างงานย่อยตรวจ log', '2026-05-08 08:30:00'),
(17, 6, 'assigned', 'in_progress', 4, 'เริ่มตรวจ log', '2026-05-08 09:20:00'),
(18, 6, 'in_progress', 'resolved', 4, 'ตรวจเสร็จแล้ว', '2026-05-08 10:30:00'),
(19, 7, NULL, 'assigned', 3, 'สร้างงานย่อยตรวจ network', '2026-05-08 08:32:00'),
(20, 7, 'assigned', 'rejected', 5, 'ปฏิเสธรับงานย่อยเพราะไม่พบปัญหา network', '2026-05-08 10:20:00'),
(21, 8, NULL, 'assigned', 3, 'สร้างงานก่อนลูกค้าขอยกเลิก', '2026-05-08 10:10:00'),
(22, 8, 'assigned', 'cancelled', 3, 'ลูกค้าขอยกเลิก', '2026-05-08 12:00:00'),
(23, 3, 'waiting_confirm', 'closed', NULL, 'System auto-closed after customer confirmation deadline expired', '2026-05-08 13:36:46');

-- --------------------------------------------------------

--
-- Table structure for table `ticket_work_logs`
--

CREATE TABLE `ticket_work_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `ticket_id` int(10) UNSIGNED NOT NULL,
  `staff_id` int(10) UNSIGNED NOT NULL,
  `work_detail` text NOT NULL,
  `work_status` enum('working','done','need_more_info') DEFAULT 'working',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ticket_work_logs`
--

INSERT INTO `ticket_work_logs` (`id`, `ticket_id`, `staff_id`, `work_detail`, `work_status`, `created_at`) VALUES
(1, 2, 5, 'ตรวจสอบ router และพบ packet loss บางช่วง', 'working', '2026-05-08 09:05:00'),
(2, 3, 7, 'แก้ query รายงานและทดสอบผลลัพธ์แล้ว', 'done', '2026-05-08 11:15:00'),
(3, 4, 6, 'ติดต่อขอโทษลูกค้าและชี้แจงสาเหตุความล่าช้า', 'done', '2026-05-08 13:30:00'),
(4, 5, 4, 'ตรวจสอบอาการเปิดซ้ำ ต้องการ log เพิ่มจากลูกค้า', 'need_more_info', '2026-05-08 10:30:00'),
(5, 6, 4, 'ตรวจสอบ backend log พบ timeout จาก query หนึ่ง', 'done', '2026-05-08 10:25:00'),
(6, 7, 5, 'ตรวจสอบแล้วไม่พบปัญหา network จึงปฏิเสธงานย่อย', 'done', '2026-05-08 10:20:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attachments`
--
ALTER TABLE `attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `report_id` (`report_id`),
  ADD KEY `ticket_id` (`ticket_id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_customers_status_created` (`status`,`created_at`);

--
-- Indexes for table `customer_organizations`
--
ALTER TABLE `customer_organizations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customer_organization_unique` (`customer_id`,`organization_id`),
  ADD KEY `organization_id` (`organization_id`);

--
-- Indexes for table `login_logs`
--
ALTER TABLE `login_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `organizations`
--
ALTER TABLE `organizations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_logs`
--
ALTER TABLE `password_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `problem_types`
--
ALTER TABLE `problem_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_problem_types_type_status` (`report_type`,`status`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `report_no` (`report_no`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `system_id` (`system_id`),
  ADD KEY `problem_type_id` (`problem_type_id`),
  ADD KEY `idx_reports_status_created` (`status`,`created_at`),
  ADD KEY `idx_reports_customer_status_created` (`customer_id`,`status`,`created_at`),
  ADD KEY `idx_reports_problem_status` (`problem_type_id`,`status`);

--
-- Indexes for table `report_confirmations`
--
ALTER TABLE `report_confirmations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `report_id` (`report_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `report_status_logs`
--
ALTER TABLE `report_status_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `report_id` (`report_id`),
  ADD KEY `idx_report_status_logs_report_created` (`report_id`,`created_at`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `screenings`
--
ALTER TABLE `screenings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `report_id` (`report_id`),
  ADD KEY `screened_by` (`screened_by`);

--
-- Indexes for table `staffs`
--
ALTER TABLE `staffs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_staffs_status_created` (`status`,`created_at`);

--
-- Indexes for table `staff_team_roles`
--
ALTER TABLE `staff_team_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `staff_team_role_unique` (`staff_id`,`team_id`,`role_id`),
  ADD KEY `team_id` (`team_id`),
  ADD KEY `role_id` (`role_id`);

--
-- Indexes for table `systems`
--
ALTER TABLE `systems`
  ADD PRIMARY KEY (`id`),
  ADD KEY `organization_id` (`organization_id`),
  ADD KEY `idx_systems_org_status` (`organization_id`,`status`);

--
-- Indexes for table `teams`
--
ALTER TABLE `teams`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ticket_no` (`ticket_no`),
  ADD KEY `report_id` (`report_id`),
  ADD KEY `parent_ticket_id` (`parent_ticket_id`),
  ADD KEY `assigned_team_id` (`assigned_team_id`),
  ADD KEY `assigned_staff_id` (`assigned_staff_id`),
  ADD KEY `assigned_by` (`assigned_by`),
  ADD KEY `idx_tickets_status_created` (`status`,`created_at`),
  ADD KEY `idx_tickets_team_status_created` (`assigned_team_id`,`status`,`created_at`),
  ADD KEY `idx_tickets_staff_status_created` (`assigned_staff_id`,`status`,`created_at`),
  ADD KEY `idx_tickets_parent_status` (`parent_ticket_id`,`status`);

--
-- Indexes for table `ticket_assignments`
--
ALTER TABLE `ticket_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_id` (`ticket_id`),
  ADD KEY `assigned_team_id` (`assigned_team_id`),
  ADD KEY `assigned_staff_id` (`assigned_staff_id`),
  ADD KEY `assigned_by` (`assigned_by`),
  ADD KEY `idx_ticket_assignments_ticket_assigned_at` (`ticket_id`,`assigned_at`);

--
-- Indexes for table `ticket_resolution_requests`
--
ALTER TABLE `ticket_resolution_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_id` (`ticket_id`),
  ADD KEY `requested_by` (`requested_by`),
  ADD KEY `reviewed_by` (`reviewed_by`);

--
-- Indexes for table `ticket_status_logs`
--
ALTER TABLE `ticket_status_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_id` (`ticket_id`),
  ADD KEY `changed_by` (`changed_by`),
  ADD KEY `idx_ticket_status_logs_ticket_created` (`ticket_id`,`created_at`);

--
-- Indexes for table `ticket_work_logs`
--
ALTER TABLE `ticket_work_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_id` (`ticket_id`),
  ADD KEY `staff_id` (`staff_id`),
  ADD KEY `idx_work_logs_ticket_created` (`ticket_id`,`created_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attachments`
--
ALTER TABLE `attachments`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `customer_organizations`
--
ALTER TABLE `customer_organizations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `login_logs`
--
ALTER TABLE `login_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `organizations`
--
ALTER TABLE `organizations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `password_logs`
--
ALTER TABLE `password_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `problem_types`
--
ALTER TABLE `problem_types`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `report_confirmations`
--
ALTER TABLE `report_confirmations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `report_status_logs`
--
ALTER TABLE `report_status_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `screenings`
--
ALTER TABLE `screenings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `staffs`
--
ALTER TABLE `staffs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `staff_team_roles`
--
ALTER TABLE `staff_team_roles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `systems`
--
ALTER TABLE `systems`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `teams`
--
ALTER TABLE `teams`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `ticket_assignments`
--
ALTER TABLE `ticket_assignments`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `ticket_resolution_requests`
--
ALTER TABLE `ticket_resolution_requests`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `ticket_status_logs`
--
ALTER TABLE `ticket_status_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `ticket_work_logs`
--
ALTER TABLE `ticket_work_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attachments`
--
ALTER TABLE `attachments`
  ADD CONSTRAINT `attachments_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `attachments_ibfk_2` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `customer_organizations`
--
ALTER TABLE `customer_organizations`
  ADD CONSTRAINT `customer_organizations_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `customer_organizations_ibfk_2` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`);

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`system_id`) REFERENCES `systems` (`id`),
  ADD CONSTRAINT `reports_ibfk_3` FOREIGN KEY (`problem_type_id`) REFERENCES `problem_types` (`id`);

--
-- Constraints for table `report_confirmations`
--
ALTER TABLE `report_confirmations`
  ADD CONSTRAINT `report_confirmations_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`),
  ADD CONSTRAINT `report_confirmations_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);

--
-- Constraints for table `report_status_logs`
--
ALTER TABLE `report_status_logs`
  ADD CONSTRAINT `report_status_logs_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`);

--
-- Constraints for table `screenings`
--
ALTER TABLE `screenings`
  ADD CONSTRAINT `screenings_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`),
  ADD CONSTRAINT `screenings_ibfk_2` FOREIGN KEY (`screened_by`) REFERENCES `staffs` (`id`);

--
-- Constraints for table `staff_team_roles`
--
ALTER TABLE `staff_team_roles`
  ADD CONSTRAINT `staff_team_roles_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staffs` (`id`),
  ADD CONSTRAINT `staff_team_roles_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`),
  ADD CONSTRAINT `staff_team_roles_ibfk_3` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

--
-- Constraints for table `systems`
--
ALTER TABLE `systems`
  ADD CONSTRAINT `fk_systems_organization` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `fk_ticket_assigner` FOREIGN KEY (`assigned_by`) REFERENCES `staffs` (`id`),
  ADD CONSTRAINT `fk_ticket_staff` FOREIGN KEY (`assigned_staff_id`) REFERENCES `staffs` (`id`),
  ADD CONSTRAINT `fk_ticket_team` FOREIGN KEY (`assigned_team_id`) REFERENCES `teams` (`id`),
  ADD CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`),
  ADD CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`parent_ticket_id`) REFERENCES `tickets` (`id`);

--
-- Constraints for table `ticket_assignments`
--
ALTER TABLE `ticket_assignments`
  ADD CONSTRAINT `ticket_assignments_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`),
  ADD CONSTRAINT `ticket_assignments_ibfk_2` FOREIGN KEY (`assigned_team_id`) REFERENCES `teams` (`id`),
  ADD CONSTRAINT `ticket_assignments_ibfk_3` FOREIGN KEY (`assigned_staff_id`) REFERENCES `staffs` (`id`),
  ADD CONSTRAINT `ticket_assignments_ibfk_4` FOREIGN KEY (`assigned_by`) REFERENCES `staffs` (`id`);

--
-- Constraints for table `ticket_resolution_requests`
--
ALTER TABLE `ticket_resolution_requests`
  ADD CONSTRAINT `ticket_resolution_requests_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`),
  ADD CONSTRAINT `ticket_resolution_requests_ibfk_2` FOREIGN KEY (`requested_by`) REFERENCES `staffs` (`id`),
  ADD CONSTRAINT `ticket_resolution_requests_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `staffs` (`id`);

--
-- Constraints for table `ticket_status_logs`
--
ALTER TABLE `ticket_status_logs`
  ADD CONSTRAINT `ticket_status_logs_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`),
  ADD CONSTRAINT `ticket_status_logs_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `staffs` (`id`);

--
-- Constraints for table `ticket_work_logs`
--
ALTER TABLE `ticket_work_logs`
  ADD CONSTRAINT `ticket_work_logs_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`),
  ADD CONSTRAINT `ticket_work_logs_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staffs` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
