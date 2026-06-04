-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 04, 2026 at 10:23 AM
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
  `request_id` int(10) UNSIGNED DEFAULT NULL,
  `ticket_id` int(10) UNSIGNED DEFAULT NULL,
  `request_confirmation_id` int(10) UNSIGNED DEFAULT NULL,
  `attachment_type` enum('request_evidence','customer_tracking_ticket','assignment_ticket','resolution_evidence','reopen_evidence') NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `file_ext` enum('pdf','jpg','jpeg','png') NOT NULL,
  `uploaded_at` datetime DEFAULT current_timestamp(),
  `saved_name` varchar(255) DEFAULT NULL,
  `status` enum('show','hide') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attachments`
--

INSERT INTO `attachments` (`id`, `request_id`, `ticket_id`, `request_confirmation_id`, `attachment_type`, `original_name`, `file_ext`, `uploaded_at`, `saved_name`, `status`) VALUES
(4, NULL, 1, NULL, 'assignment_ticket', 'assignment-TCK-20260508-0001.pdf', 'pdf', '2026-05-08 08:26:00', NULL, 'show'),
(5, NULL, 3, NULL, 'resolution_evidence', 'fixed-report-result.png', 'png', '2026-05-08 11:25:00', NULL, 'show'),
(6, NULL, 4, NULL, 'resolution_evidence', 'service-followup.pdf', 'pdf', '2026-05-08 13:50:00', NULL, 'show'),
(7, NULL, 5, NULL, 'customer_tracking_ticket', 'tracking-TCK-20260508-0005.pdf', 'pdf', '2026-05-08 09:46:00', NULL, 'show'),
(8, NULL, 6, NULL, 'resolution_evidence', 'server-log-result.jpeg', 'jpeg', '2026-05-08 10:28:00', NULL, 'show'),
(135, 67, NULL, NULL, 'request_evidence', 'ภาพหน้าจอ-เข้าใช้งานไม่ได้-01.png', 'png', '2026-06-04 09:12:00', '1780473474571-l0vvqs-Screenshot 2026-03-24 143800.png', 'show'),
(136, 67, NULL, NULL, 'request_evidence', 'ภาพหน้าจอ-ข้อความผิดพลาด-02.png', 'png', '2026-06-04 09:13:00', '1780473474573-f4hfe6-Screenshot 2026-03-24 143844.png', 'show'),
(137, 68, NULL, NULL, 'request_evidence', 'ภาพหน้าจอ-ช้า-01.png', 'png', '2026-06-04 08:47:00', '1780473474573-zu11vf-Screenshot 2026-03-24 143931.png', 'show'),
(138, 69, NULL, NULL, 'request_evidence', 'ภาพปัญหาเครื่องพิมพ์.png', 'png', '2026-06-04 08:25:00', '1780473474576-8xsj3u-Screenshot 2026-03-24 143958.png', 'show'),
(139, 69, 39, NULL, 'resolution_evidence', 'ภาพผลการตรวจสอบระหว่างแก้ไข.png', 'png', '2026-06-04 10:10:00', '1780473474582-ewsbrp-Screenshot 2026-03-24 144136.png', 'show'),
(140, 70, NULL, NULL, 'request_evidence', 'รายงานสรุปยอดขาย-กดออกไม่ได้.pdf', 'pdf', '2026-06-04 07:55:00', '1780546540311-bo98al-RPT-20260603-0003.pdf', 'show'),
(141, 70, 40, NULL, 'resolution_evidence', 'ภาพผลการแก้ไข-หลังทดสอบ.png', 'png', '2026-06-04 13:41:00', '1780473474582-ewsbrp-Screenshot 2026-03-24 144136.png', 'show'),
(142, 70, 40, NULL, 'resolution_evidence', 'ภาพยืนยันการทำงานหลังแก้ไข.png', 'png', '2026-06-04 13:42:00', '1780473474584-74crmr-Screenshot 2026-03-24 144303.png', 'show'),
(143, 70, 40, NULL, 'customer_tracking_ticket', 'tracking-REQ-MOCK13-0004.pdf', 'pdf', '2026-06-04 13:43:00', '1780546540311-bo98al-RPT-20260603-0003.pdf', 'show'),
(144, 71, NULL, NULL, 'request_evidence', 'ตัวอย่างไฟล์ชื่อไทยที่เพี้ยน.pdf', 'pdf', '2026-06-03 15:12:00', '1780546540311-bo98al-RPT-20260603-0003.pdf', 'show'),
(145, 71, 41, NULL, 'resolution_evidence', 'ภาพผลการแก้ไข-หลังทดสอบ.png', 'png', '2026-06-04 08:21:00', '1780473474582-ewsbrp-Screenshot 2026-03-24 144136.png', 'show'),
(146, 71, 41, NULL, 'customer_tracking_ticket', 'tracking-REQ-MOCK13-0005.pdf', 'pdf', '2026-06-04 08:22:00', '1780546540311-bo98al-RPT-20260603-0003.pdf', 'show'),
(147, 72, 42, NULL, 'resolution_evidence', 'ภาพยืนยันการทำงานหลังแก้ไข.png', 'png', '2026-06-02 13:31:00', '1780473474584-74crmr-Screenshot 2026-03-24 144303.png', 'show'),
(148, 72, 42, NULL, 'customer_tracking_ticket', 'tracking-REQ-MOCK13-0006.pdf', 'pdf', '2026-06-02 13:32:00', '1780546540311-bo98al-RPT-20260603-0003.pdf', 'show'),
(149, 73, NULL, NULL, 'request_evidence', 'ภาพแจ้งปัญหาเดิม-01.png', 'png', '2026-06-01 13:02:00', '1780473474571-l0vvqs-Screenshot 2026-03-24 143800.png', 'show'),
(150, 73, NULL, NULL, 'request_evidence', 'ภาพแจ้งปัญหาเดิม-02.png', 'png', '2026-06-01 13:03:00', '1780473474573-f4hfe6-Screenshot 2026-03-24 143844.png', 'show'),
(151, 73, 43, NULL, 'resolution_evidence', 'ภาพผลการแก้ไขรอบแรก.png', 'png', '2026-06-01 16:51:00', '1780473474582-ewsbrp-Screenshot 2026-03-24 144136.png', 'show'),
(152, 73, NULL, 20, 'reopen_evidence', 'ภาพปัญหาเพิ่มเติมหลังตีกลับ.png', 'png', '2026-06-02 09:16:00', '1780473474584-74crmr-Screenshot 2026-03-24 144303.png', 'show'),
(153, 70, NULL, 21, 'reopen_evidence', 'RPT-20260603-0003.pdf', 'pdf', '2026-06-04 12:24:15', '1780550655463-35eoqe-RPT-20260603-0003.pdf', 'show'),
(154, 73, NULL, 22, 'reopen_evidence', 'REQ-1780468681245.pdf', 'pdf', '2026-06-04 14:19:18', '1780557558040-i3pola-REQ-1780468681245.pdf', 'show'),
(155, 74, NULL, NULL, 'request_evidence', 'RPT-20260603-0003.pdf', 'pdf', '2026-06-04 14:33:00', '1780558380681-bh7lp2-RPT-20260603-0003.pdf', 'show'),
(156, 74, NULL, NULL, 'request_evidence', 'REQ-1780468681245.pdf', 'pdf', '2026-06-04 14:33:00', '1780558380684-ytgkfz-REQ-1780468681245.pdf', 'show'),
(157, 74, NULL, NULL, 'request_evidence', 'REQ-1780468361971.pdf', 'pdf', '2026-06-04 14:33:00', '1780558380685-ma88vv-REQ-1780468361971.pdf', 'show'),
(158, 76, NULL, NULL, 'request_evidence', 'RPT-20260604-0001.pdf', 'pdf', '2026-06-04 14:51:27', '1780559486976-ac93u2-RPT-20260604-0001.pdf', 'show'),
(159, 76, NULL, NULL, 'request_evidence', 'RPT-20260603-0003.pdf', 'pdf', '2026-06-04 14:51:27', '1780559486980-koot9e-RPT-20260603-0003.pdf', 'show'),
(160, 76, NULL, NULL, 'request_evidence', 'REQ-1780468681245.pdf', 'pdf', '2026-06-04 14:51:27', '1780559486985-tppifi-REQ-1780468681245.pdf', 'show'),
(161, 76, NULL, NULL, 'request_evidence', 'REQ-1780468361971.pdf', 'pdf', '2026-06-04 14:51:27', '1780559486985-doxurq-REQ-1780468361971.pdf', 'show');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(10) UNSIGNED NOT NULL,
  `prefix_id` int(10) UNSIGNED DEFAULT NULL,
  `citizen_id` varchar(13) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `surname` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `customer_type` enum('person','company') NOT NULL,
  `organization_id` int(10) UNSIGNED DEFAULT NULL,
  `status` enum('pending','approved','rejected','inactive') DEFAULT 'pending',
  `password_hash` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `prefix_id`, `citizen_id`, `name`, `surname`, `email`, `phone`, `customer_type`, `organization_id`, `status`, `password_hash`, `created_at`, `updated_at`) VALUES
(1, 8, NULL, 'สมชาย', 'ใจดี', 'somchai@example.com', '0811111111', 'company', 1, 'approved', '$2b$10$63hAed0BbOk5HkdgWepIQuqOeDsfAUHA5sM2UOywWCJzSs.rqtA3u', '2026-05-01 10:00:00', '2026-06-02 17:32:20'),
(2, NULL, NULL, 'วราภรณ์', 'มั่นคง', 'waraporn@example.com', '0822222222', 'person', NULL, 'approved', '$2b$10$63hAed0BbOk5HkdgWepIQuqOeDsfAUHA5sM2UOywWCJzSs.rqtA3u', '2026-05-01 10:05:00', '2026-06-02 17:32:20'),
(3, 10, NULL, 'บริษัท เอ็นไอดี', 'เทคโนโลยี', 'contact@nidtech.com', '444444444', 'company', 2, 'approved', '$2b$10$mockhashcustomer3', '2026-05-01 10:10:00', '2026-05-25 10:20:25'),
(4, NULL, NULL, 'ลูกค้าใหม่', 'รออนุมัติ', 'pending@example.com', '0844444444', 'person', NULL, 'approved', '$2b$10$mockhashcustomer4', '2026-05-01 10:15:00', '2026-05-13 12:15:04'),
(5, NULL, NULL, 'ลูกค้าถูกปฏิเสธ', 'ทดสอบ', 'rejected@example.com', '0855555555', 'person', NULL, 'approved', '$2b$10$mockhashcustomer5', '2026-05-01 10:20:00', '2026-06-03 15:46:33'),
(6, NULL, NULL, 'ลูกค้าเก่า', 'ปิดใช้งาน', 'inactive@example.com', '0866666666', 'company', 3, 'approved', '$2b$10$mockhashcustomer6', '2026-05-01 10:25:00', '2026-05-26 12:03:06'),
(7, NULL, NULL, 'ggg', 'ggg', 'test16@gmail.com', '0000000000', 'person', NULL, 'rejected', '$2b$10$tivq7REfkaWiwHn50Uu14u437v2FFYrrTs.tzDa5aaPW3n0gEW.c6', '2026-05-12 15:06:43', '2026-05-18 11:46:05'),
(8, NULL, '1103700000001', 'สมชาย', 'ใจดี', 'somchai01@example.com', '0811111111', 'person', NULL, 'approved', '$2b$10$mockhash1', '2026-05-13 12:18:59', '2026-05-18 11:46:02'),
(9, NULL, '1103700000002', 'วราภรณ์', 'มั่นคง', 'waraporn02@example.com', '0822222222', 'person', NULL, 'approved', '$2b$10$mockhash2', '2026-05-13 12:18:59', '2026-05-13 12:25:05'),
(10, NULL, '1103700000003', 'ธนพล', 'รุ่งเรือง', 'thanapon03@example.com', '0833333333', 'person', NULL, 'inactive', '$2b$10$mockhash3', '2026-05-13 12:18:59', '2026-05-22 16:45:37'),
(11, NULL, '1103700000004', 'กิตติ', 'ศรีไทย', 'kitti04@example.com', '0844444444', 'person', NULL, 'rejected', '$2b$10$mockhash4', '2026-05-13 12:18:59', '2026-05-13 12:29:47'),
(12, NULL, '1103700000005', 'บริษัท เอ็นไอดี', 'เทคโนโลยี', 'nidtech@example.com', '020000000', 'company', NULL, 'approved', '$2b$10$mockhash5', '2026-05-13 12:18:59', '2026-05-15 11:40:24'),
(13, NULL, '1103700000006', 'บริษัท โปรเซอร์วิส', 'โซลูชั่น', 'proservice@example.com', '021111111', 'company', 4, 'approved', '$2b$10$mockhash6', '2026-05-13 12:18:59', '2026-05-15 11:45:42'),
(14, NULL, '1103700000007', 'ลูกค้าทดสอบ', 'รออนุมัติ', 'pendingcustomer@example.com', '0855555555', 'person', NULL, 'approved', '$2b$10$mockhash7', '2026-05-13 12:18:59', '2026-05-13 12:26:29'),
(15, NULL, '1103700000008', 'ลูกค้าปฏิเสธ', 'ระบบ', 'rejectcustomer@example.com', '0866666666', 'person', NULL, 'rejected', '$2b$10$mockhash8', '2026-05-13 12:18:59', '2026-05-13 12:26:24'),
(16, 2, '1100801526563', 'ธนวัฒน์', 'เเซ่จึง', '22trai2548@gmail.com', '0623547878', 'person', NULL, 'approved', '$2b$10$uU9FBBpUUJIYgnrwVbViGeLMCj40mKsRdjxXfjKlq3Y.AYRPnFWV6', '2026-06-03 12:43:06', '2026-06-03 12:45:43');

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
(6, 'customer', 1, '192.168.1.10', 'Chrome on Windows', '2026-05-08 08:10:00', 'failed', 'invalid_password'),
(7, 'customer', 8, '192.168.3.232', 'Chrome on Android', '2026-04-27 16:44:32', 'failed', 'session_expired'),
(8, 'staff', 3, '192.168.15.191', 'Firefox on Linux', '2026-02-23 12:44:32', 'success', NULL),
(9, 'customer', 3, '192.168.9.226', 'Chrome on Android', '2026-04-27 15:44:32', 'success', NULL),
(10, 'customer', 11, '192.168.17.118', 'Mobile WebView', '2026-05-16 20:44:32', 'failed', 'too_many_attempts'),
(11, 'customer', 15, '10.0.18.147', 'Chrome on Android', '2026-04-09 19:44:32', 'failed', 'account_inactive'),
(12, 'staff', 4, '192.168.16.239', 'Safari on iPhone', '2026-03-16 17:44:32', 'success', NULL),
(13, 'staff', 8, '10.0.18.43', 'Chrome on Android', '2026-04-05 11:44:32', 'success', NULL),
(14, 'customer', 9, '192.168.9.46', 'Firefox on Linux', '2026-03-09 08:44:32', 'success', NULL),
(15, 'customer', 6, '192.168.14.7', 'Chrome on Windows', '2026-05-14 01:44:32', 'success', NULL),
(16, 'staff', 4, '192.168.17.248', 'Safari on iPhone', '2026-03-02 01:44:32', 'success', NULL),
(17, 'customer', 5, '192.168.12.211', 'Safari on iPad', '2026-03-31 20:44:32', 'success', NULL),
(18, 'staff', 4, '10.0.13.128', 'Firefox on Linux', '2026-03-15 16:44:32', 'success', NULL),
(19, 'customer', 1, '192.168.5.74', 'Chrome on MacOS', '2026-03-04 07:44:32', 'success', NULL),
(20, 'customer', 3, '192.168.12.177', 'Firefox on Linux', '2026-04-02 21:44:32', 'success', NULL),
(21, 'staff', 3, '192.168.10.200', 'Edge on Windows', '2026-04-26 14:44:32', 'success', NULL),
(22, 'staff', 7, '192.168.16.210', 'Chrome on MacOS', '2026-04-23 03:44:32', 'success', NULL),
(23, 'customer', 5, '10.0.1.181', 'Safari on iPad', '2026-04-26 11:44:32', 'success', NULL),
(24, 'customer', 7, '192.168.15.180', 'Safari on iPhone', '2026-03-25 06:44:32', 'failed', 'account_pending'),
(25, 'customer', 7, '10.0.9.244', 'Safari on iPad', '2026-04-06 07:44:32', 'success', NULL),
(26, 'staff', 9, '192.168.7.115', 'Safari on iPhone', '2026-02-28 14:44:32', 'success', NULL),
(27, 'customer', 14, '10.0.17.89', 'Safari on iPhone', '2026-04-14 04:44:32', 'success', NULL),
(28, 'customer', 11, '192.168.13.249', 'Chrome on Windows', '2026-04-13 13:44:32', 'success', NULL),
(29, 'staff', 1, '192.168.9.40', 'Safari on iPad', '2026-03-14 23:44:32', 'success', NULL),
(30, 'customer', 3, '192.168.17.89', 'Chrome on Android', '2026-05-10 12:44:32', 'success', NULL),
(31, 'customer', 10, '192.168.18.87', 'Chrome on Windows', '2026-05-09 21:44:32', 'success', NULL),
(32, 'staff', 5, '192.168.12.131', 'Mobile WebView', '2026-02-23 06:44:32', 'success', NULL),
(33, 'customer', 7, '192.168.12.153', 'Safari on iPhone', '2026-03-25 01:44:32', 'failed', 'session_expired'),
(34, 'customer', 8, '10.0.11.165', 'Firefox on Linux', '2026-04-15 09:44:32', 'success', NULL),
(35, 'customer', 5, '192.168.11.131', 'Mobile WebView', '2026-05-04 06:44:32', 'success', NULL),
(36, 'customer', 1, '192.168.5.30', 'Mobile WebView', '2026-04-19 10:44:32', 'success', NULL),
(37, 'staff', 5, '192.168.20.205', 'Chrome on Android', '2026-05-02 18:44:32', 'failed', 'invalid_password'),
(38, 'staff', 1, '192.168.4.134', 'Chrome on Android', '2026-05-15 11:44:32', 'success', NULL),
(39, 'staff', 6, '192.168.18.33', 'Chrome on Windows', '2026-03-12 15:44:32', 'success', NULL),
(40, 'customer', 13, '10.0.10.10', 'Firefox on Linux', '2026-03-26 13:44:32', 'success', NULL),
(41, 'customer', 7, '192.168.1.67', 'Chrome on Android', '2026-05-17 17:44:32', 'success', NULL),
(42, 'staff', 12, '192.168.14.184', 'Edge on Windows', '2026-02-28 16:44:32', 'success', NULL),
(43, 'staff', 4, '10.0.7.201', 'Mobile WebView', '2026-04-01 14:44:32', 'success', NULL),
(44, 'customer', 8, '10.0.10.222', 'Mobile WebView', '2026-03-12 02:44:32', 'success', NULL),
(45, 'customer', 4, '192.168.3.98', 'Edge on Windows', '2026-03-20 17:44:32', 'success', NULL),
(46, 'customer', 11, '10.0.11.141', 'Chrome on Android', '2026-05-06 01:44:32', 'success', NULL),
(47, 'customer', 6, '192.168.14.103', 'Mobile WebView', '2026-04-21 10:44:32', 'success', NULL),
(48, 'staff', 15, '192.168.18.14', 'Edge on Windows', '2026-03-17 13:44:32', 'success', NULL),
(49, 'customer', 15, '192.168.8.191', 'Edge on Windows', '2026-04-03 08:44:32', 'failed', 'too_many_attempts'),
(50, 'customer', 3, '192.168.2.81', 'Safari on iPad', '2026-05-17 08:44:32', 'success', NULL),
(51, 'staff', 3, '192.168.7.129', 'Edge on Windows', '2026-04-26 17:44:32', 'failed', 'user_not_found'),
(52, 'customer', 11, '10.0.17.204', 'Edge on Windows', '2026-05-13 10:44:32', 'success', NULL),
(53, 'staff', 10, '10.0.20.143', 'Chrome on MacOS', '2026-03-31 01:44:32', 'success', NULL),
(54, 'staff', 10, '192.168.9.28', 'Safari on iPhone', '2026-05-22 06:44:32', 'success', NULL),
(55, 'customer', 13, '192.168.9.98', 'Edge on Windows', '2026-02-28 17:44:32', 'failed', 'account_pending'),
(56, 'customer', 11, '192.168.8.101', 'Chrome on MacOS', '2026-02-25 03:44:32', 'success', NULL),
(57, 'customer', 10, '10.0.1.202', 'Chrome on MacOS', '2026-03-05 16:44:32', 'success', NULL),
(58, 'customer', 15, '192.168.16.99', 'Firefox on Linux', '2026-05-05 13:44:32', 'failed', 'account_inactive'),
(59, 'customer', 6, '192.168.11.14', 'Firefox on Linux', '2026-04-13 11:44:32', 'success', NULL),
(60, 'customer', 4, '192.168.6.71', 'Edge on Windows', '2026-03-03 16:44:32', 'success', NULL),
(61, 'staff', 11, '192.168.12.102', 'Safari on iPhone', '2026-05-01 03:44:32', 'failed', 'too_many_attempts'),
(62, 'staff', 4, '10.0.8.78', 'Safari on iPad', '2026-04-17 22:44:32', 'success', NULL),
(63, 'staff', 7, '10.0.10.138', 'Safari on iPhone', '2026-03-14 10:44:32', 'failed', 'invalid_password'),
(64, 'staff', 5, '192.168.13.187', 'Chrome on MacOS', '2026-03-03 11:44:32', 'success', NULL),
(65, 'staff', 3, '192.168.4.93', 'Safari on iPhone', '2026-03-25 05:44:32', 'success', NULL),
(66, 'staff', 7, '192.168.13.16', 'Safari on iPhone', '2026-03-28 11:44:32', 'failed', 'invalid_password'),
(67, 'customer', 1, '192.168.7.156', 'Chrome on Android', '2026-03-09 18:44:32', 'failed', 'session_expired'),
(68, 'staff', 8, '10.0.4.156', 'Edge on Windows', '2026-03-06 19:44:32', 'success', NULL),
(69, 'customer', 12, '192.168.9.38', 'Safari on iPad', '2026-03-19 04:44:32', 'success', NULL),
(70, 'staff', 2, '192.168.13.81', 'Firefox on Linux', '2026-03-12 18:44:32', 'success', NULL),
(71, 'customer', 3, '10.0.6.159', 'Chrome on Android', '2026-04-22 13:44:32', 'success', NULL),
(72, 'customer', 9, '192.168.9.107', 'Chrome on MacOS', '2026-05-13 14:44:32', 'failed', 'account_inactive'),
(73, 'customer', 15, '192.168.19.34', 'Chrome on MacOS', '2026-02-28 09:44:32', 'success', NULL),
(74, 'customer', 5, '192.168.6.95', 'Chrome on Windows', '2026-02-24 16:44:32', 'failed', 'account_pending'),
(75, 'staff', 1, '192.168.5.184', 'Mobile WebView', '2026-04-01 09:44:32', 'success', NULL),
(76, 'staff', 9, '10.0.8.97', 'Chrome on MacOS', '2026-05-15 15:44:32', 'failed', 'invalid_password'),
(77, 'customer', 6, '192.168.16.15', 'Mobile WebView', '2026-03-16 17:44:32', 'success', NULL),
(78, 'customer', 12, '192.168.18.35', 'Chrome on Windows', '2026-05-11 03:44:32', 'success', NULL),
(79, 'staff', 3, '192.168.5.2', 'Safari on iPad', '2026-05-16 08:44:32', 'success', NULL),
(80, 'customer', 3, '192.168.2.83', 'Safari on iPhone', '2026-03-17 19:44:32', 'failed', 'user_not_found'),
(81, 'staff', 5, '192.168.12.176', 'Firefox on Linux', '2026-04-24 23:44:32', 'success', NULL),
(82, 'staff', 3, '192.168.19.6', 'Safari on iPhone', '2026-03-24 04:44:32', 'success', NULL),
(83, 'staff', 5, '192.168.9.222', 'Chrome on Windows', '2026-02-21 19:44:32', 'success', NULL),
(84, 'staff', 7, '192.168.9.77', 'Chrome on Android', '2026-04-29 21:44:32', 'success', NULL),
(85, 'customer', 1, '192.168.6.232', 'Chrome on MacOS', '2026-05-17 10:44:32', 'failed', 'too_many_attempts'),
(86, 'customer', 2, '192.168.18.228', 'Chrome on MacOS', '2026-04-19 00:44:32', 'failed', 'too_many_attempts'),
(87, 'customer', 3, '10.0.8.152', 'Chrome on MacOS', '2026-04-24 07:44:32', 'success', NULL),
(88, 'staff', 1, '192.168.1.203', 'Mobile WebView', '2026-05-14 17:44:32', 'success', NULL),
(89, 'customer', 4, '192.168.17.234', 'Chrome on Android', '2026-05-10 07:44:32', 'success', NULL),
(90, 'customer', 3, '192.168.17.245', 'Safari on iPad', '2026-05-13 03:44:32', 'success', NULL),
(91, 'customer', 5, '192.168.7.253', 'Chrome on Windows', '2026-05-01 09:44:32', 'success', NULL),
(92, 'staff', 2, '192.168.5.58', 'Safari on iPad', '2026-04-18 19:44:32', 'success', NULL),
(93, 'customer', 14, '10.0.4.232', 'Chrome on Windows', '2026-03-25 11:44:32', 'failed', 'session_expired'),
(94, 'customer', 4, '192.168.10.165', 'Chrome on MacOS', '2026-05-04 23:44:32', 'failed', 'session_expired'),
(95, 'customer', 6, '192.168.1.82', 'Safari on iPad', '2026-04-06 09:44:32', 'failed', 'invalid_password'),
(96, 'customer', 8, '192.168.17.67', 'Mobile WebView', '2026-03-30 02:44:32', 'success', NULL),
(97, 'customer', 14, '192.168.5.142', 'Chrome on Windows', '2026-03-04 08:44:32', 'failed', 'invalid_password'),
(98, 'customer', 5, '10.0.15.146', 'Edge on Windows', '2026-04-22 15:44:32', 'success', NULL),
(99, 'customer', 4, '192.168.5.244', 'Chrome on Android', '2026-02-25 03:44:32', 'success', NULL),
(100, 'customer', 8, '192.168.8.15', 'Chrome on Android', '2026-03-11 00:44:32', 'failed', 'session_expired'),
(101, 'staff', 2, '192.168.13.103', 'Chrome on Android', '2026-03-29 23:44:32', 'success', NULL),
(102, 'customer', 5, '10.0.4.129', 'Chrome on Windows', '2026-03-10 15:44:32', 'success', NULL),
(103, 'customer', 2, '192.168.4.128', 'Chrome on Windows', '2026-04-01 16:44:32', 'success', NULL),
(104, 'staff', 14, '192.168.10.74', 'Mobile WebView', '2026-05-18 03:44:32', 'success', NULL),
(105, 'staff', 5, '192.168.9.222', 'Chrome on Windows', '2026-02-22 22:44:32', 'success', NULL),
(106, 'customer', 3, '10.0.10.71', 'Chrome on Windows', '2026-04-21 21:44:32', 'failed', 'session_expired'),
(107, 'customer', 4, '192.168.13.16', 'Safari on iPad', '2026-05-16 10:44:32', 'failed', 'invalid_password'),
(108, 'staff', 4, '192.168.3.247', 'Safari on iPad', '2026-04-08 11:44:32', 'success', NULL),
(109, 'customer', 7, '192.168.5.198', 'Chrome on Android', '2026-03-17 10:44:32', 'failed', 'too_many_attempts'),
(110, 'staff', 12, '192.168.14.37', 'Firefox on Linux', '2026-05-03 14:44:32', 'success', NULL),
(111, 'staff', 15, '192.168.16.227', 'Chrome on Windows', '2026-03-12 19:44:32', 'failed', 'account_inactive'),
(112, 'customer', 10, '192.168.5.246', 'Chrome on Android', '2026-05-03 00:44:32', 'success', NULL),
(113, 'staff', 11, '192.168.13.149', 'Chrome on Windows', '2026-03-11 19:44:32', 'failed', 'session_expired'),
(114, 'customer', 4, '10.0.10.162', 'Firefox on Linux', '2026-03-15 21:44:32', 'success', NULL),
(115, 'customer', 8, '10.0.12.87', 'Mobile WebView', '2026-04-03 10:44:32', 'success', NULL),
(116, 'customer', 4, '192.168.6.64', 'Safari on iPad', '2026-03-28 19:44:32', 'success', NULL),
(117, 'customer', 8, '10.0.16.28', 'Chrome on Android', '2026-03-26 21:44:32', 'failed', 'user_not_found'),
(118, 'staff', 8, '192.168.17.45', 'Safari on iPhone', '2026-04-30 06:44:32', 'success', NULL),
(119, 'staff', 3, '10.0.11.54', 'Safari on iPad', '2026-03-10 21:44:32', 'success', NULL),
(120, 'customer', 3, '192.168.14.183', 'Edge on Windows', '2026-03-09 03:44:32', 'success', NULL),
(121, 'customer', 4, '192.168.10.200', 'Edge on Windows', '2026-04-28 17:44:32', 'failed', 'account_pending'),
(122, 'customer', 8, '10.0.1.67', 'Safari on iPhone', '2026-04-02 11:44:32', 'success', NULL),
(123, 'customer', 4, '192.168.3.3', 'Firefox on Linux', '2026-04-30 03:44:32', 'success', NULL),
(124, 'customer', 7, '192.168.16.155', 'Firefox on Linux', '2026-03-02 04:44:32', 'success', NULL),
(125, 'staff', 11, '192.168.17.31', 'Chrome on Windows', '2026-04-28 12:44:32', 'failed', 'account_inactive'),
(126, 'customer', 7, '192.168.19.211', 'Safari on iPad', '2026-04-14 12:44:32', 'success', NULL),
(127, 'customer', 8, '192.168.14.122', 'Safari on iPhone', '2026-05-07 14:44:32', 'failed', 'account_pending'),
(128, 'customer', 14, '192.168.8.27', 'Safari on iPad', '2026-03-27 13:44:32', 'success', NULL),
(129, 'customer', 6, '192.168.19.2', 'Chrome on Android', '2026-05-02 01:44:32', 'success', NULL),
(130, 'customer', 2, '192.168.3.162', 'Chrome on MacOS', '2026-03-03 06:44:32', 'success', NULL),
(131, 'customer', 5, '192.168.6.2', 'Safari on iPhone', '2026-04-19 10:44:32', 'failed', 'user_not_found'),
(132, 'customer', 1, '10.0.20.91', 'Mobile WebView', '2026-04-15 01:44:32', 'success', NULL),
(133, 'staff', 6, '192.168.19.23', 'Edge on Windows', '2026-03-14 10:44:32', 'failed', 'account_inactive'),
(134, 'customer', 11, '10.0.10.67', 'Chrome on MacOS', '2026-04-11 18:44:32', 'success', NULL),
(135, 'staff', 3, '192.168.18.102', 'Safari on iPhone', '2026-04-15 08:44:32', 'success', NULL),
(136, 'customer', 8, '192.168.12.157', 'Safari on iPhone', '2026-02-22 15:44:32', 'success', NULL),
(137, 'staff', 3, '192.168.7.141', 'Chrome on MacOS', '2026-03-27 22:44:32', 'success', NULL),
(138, 'customer', 5, '192.168.7.116', 'Chrome on Android', '2026-03-09 00:44:32', 'success', NULL),
(139, 'customer', 3, '10.0.7.176', 'Edge on Windows', '2026-04-04 07:44:32', 'success', NULL),
(140, 'customer', 3, '192.168.6.199', 'Chrome on Windows', '2026-03-09 09:44:32', 'success', NULL),
(141, 'staff', 4, '192.168.11.216', 'Firefox on Linux', '2026-05-15 05:44:32', 'failed', 'invalid_password'),
(142, 'customer', 12, '192.168.20.188', 'Chrome on MacOS', '2026-03-22 08:44:32', 'success', NULL),
(143, 'customer', 1, '10.0.10.43', 'Safari on iPad', '2026-03-05 14:44:32', 'success', NULL),
(144, 'staff', 2, '192.168.9.251', 'Firefox on Linux', '2026-03-26 10:44:32', 'success', NULL),
(145, 'customer', 6, '192.168.20.13', 'Safari on iPhone', '2026-04-27 22:44:32', 'failed', 'account_pending'),
(146, 'customer', 2, '10.0.1.104', 'Mobile WebView', '2026-03-31 10:44:32', 'success', NULL),
(147, 'staff', 10, '192.168.7.205', 'Chrome on Windows', '2026-03-28 09:44:32', 'success', NULL),
(148, 'customer', 6, '192.168.10.19', 'Mobile WebView', '2026-04-14 02:44:32', 'success', NULL),
(149, 'customer', 5, '10.0.18.132', 'Mobile WebView', '2026-05-08 13:44:32', 'success', NULL),
(150, 'customer', 9, '192.168.14.139', 'Firefox on Linux', '2026-02-27 23:44:32', 'success', NULL),
(151, 'customer', 1, '192.168.15.125', 'Safari on iPhone', '2026-05-12 20:44:32', 'success', NULL),
(152, 'customer', 11, '192.168.8.228', 'Safari on iPad', '2026-04-27 04:44:32', 'success', NULL),
(153, 'staff', 8, '192.168.20.201', 'Chrome on Windows', '2026-03-22 01:44:32', 'failed', 'session_expired'),
(154, 'staff', 9, '192.168.11.191', 'Chrome on Android', '2026-04-10 14:44:32', 'failed', 'invalid_password'),
(155, 'staff', 1, '192.168.20.247', 'Mobile WebView', '2026-05-15 01:44:32', 'success', NULL),
(156, 'customer', 4, '192.168.12.127', 'Firefox on Linux', '2026-05-03 15:44:32', 'success', NULL),
(157, 'staff', 6, '10.0.12.160', 'Safari on iPad', '2026-05-04 17:44:32', 'success', NULL),
(158, 'customer', 3, '192.168.9.184', 'Safari on iPhone', '2026-03-25 07:44:32', 'failed', 'session_expired'),
(159, 'customer', 13, '192.168.6.173', 'Edge on Windows', '2026-02-23 08:44:32', 'success', NULL),
(160, 'staff', 6, '10.0.5.144', 'Chrome on Android', '2026-02-27 03:44:32', 'success', NULL),
(161, 'staff', 10, '10.0.9.170', 'Mobile WebView', '2026-02-28 20:44:32', 'success', NULL),
(162, 'customer', 5, '10.0.6.213', 'Safari on iPad', '2026-04-14 12:44:32', 'success', NULL),
(163, 'customer', 8, '10.0.6.54', 'Chrome on Android', '2026-04-30 18:44:32', 'success', NULL),
(164, 'customer', 7, '10.0.16.205', 'Firefox on Linux', '2026-04-23 01:44:32', 'failed', 'too_many_attempts'),
(165, 'staff', 15, '192.168.8.207', 'Chrome on MacOS', '2026-02-28 11:44:32', 'success', NULL),
(166, 'customer', 14, '192.168.5.170', 'Edge on Windows', '2026-05-16 23:44:32', 'success', NULL),
(167, 'staff', 3, '192.168.19.124', 'Edge on Windows', '2026-04-01 09:44:32', 'success', NULL),
(168, 'customer', 8, '192.168.9.204', 'Chrome on MacOS', '2026-04-09 08:44:32', 'failed', 'too_many_attempts'),
(169, 'customer', 14, '192.168.13.173', 'Edge on Windows', '2026-03-23 18:44:32', 'success', NULL),
(170, 'customer', 14, '192.168.14.102', 'Chrome on Windows', '2026-02-24 17:44:32', 'success', NULL),
(171, 'staff', 7, '10.0.1.107', 'Chrome on Windows', '2026-02-24 18:44:32', 'success', NULL),
(172, 'staff', 12, '10.0.6.28', 'Chrome on MacOS', '2026-04-05 03:44:32', 'failed', 'user_not_found'),
(173, 'staff', 6, '192.168.10.147', 'Safari on iPad', '2026-05-01 12:44:32', 'success', NULL),
(174, 'customer', 2, '10.0.5.119', 'Firefox on Linux', '2026-03-01 22:44:32', 'failed', 'invalid_password'),
(175, 'customer', 5, '192.168.16.103', 'Firefox on Linux', '2026-04-15 14:44:32', 'success', NULL),
(176, 'customer', 2, '192.168.7.90', 'Chrome on MacOS', '2026-03-20 04:44:32', 'success', NULL),
(177, 'customer', 13, '192.168.15.137', 'Edge on Windows', '2026-02-27 07:44:32', 'failed', 'account_pending'),
(178, 'customer', 1, '192.168.9.208', 'Chrome on MacOS', '2026-03-21 12:44:32', 'success', NULL),
(179, 'customer', 13, '192.168.9.239', 'Safari on iPad', '2026-04-25 04:44:32', 'success', NULL),
(180, 'staff', 6, '192.168.11.175', 'Mobile WebView', '2026-04-21 08:44:32', 'success', NULL),
(181, 'customer', 6, '192.168.2.79', 'Safari on iPhone', '2026-03-16 17:44:32', 'success', NULL),
(182, 'staff', 5, '192.168.19.157', 'Safari on iPhone', '2026-04-03 14:44:32', 'success', NULL),
(183, 'customer', 1, '192.168.10.13', 'Chrome on MacOS', '2026-03-03 11:44:32', 'success', NULL),
(184, 'customer', 1, '192.168.17.229', 'Chrome on Windows', '2026-04-02 20:44:32', 'success', NULL),
(185, 'customer', 7, '10.0.9.238', 'Safari on iPhone', '2026-02-25 17:44:32', 'success', NULL),
(186, 'customer', 8, '192.168.2.241', 'Edge on Windows', '2026-03-12 01:44:32', 'success', NULL),
(187, 'staff', 5, '10.0.4.178', 'Mobile WebView', '2026-04-03 12:44:32', 'success', NULL),
(188, 'staff', 8, '192.168.12.253', 'Safari on iPhone', '2026-04-24 16:44:32', 'failed', 'invalid_password'),
(189, 'staff', 15, '192.168.4.71', 'Chrome on MacOS', '2026-04-19 02:44:32', 'success', NULL),
(190, 'customer', 13, '10.0.2.169', 'Chrome on Windows', '2026-04-19 20:44:32', 'failed', 'invalid_password'),
(191, 'customer', 6, '192.168.5.53', 'Safari on iPad', '2026-04-03 00:44:32', 'success', NULL),
(192, 'customer', 4, '10.0.15.83', 'Safari on iPad', '2026-05-21 15:44:32', 'success', NULL),
(193, 'customer', 1, '192.168.14.150', 'Mobile WebView', '2026-05-09 16:44:32', 'success', NULL),
(194, 'customer', 7, '192.168.16.252', 'Firefox on Linux', '2026-04-30 03:44:32', 'failed', 'account_pending'),
(195, 'customer', 2, '10.0.17.237', 'Chrome on Android', '2026-04-23 13:44:32', 'success', NULL),
(196, 'staff', 2, '10.0.3.115', 'Chrome on MacOS', '2026-02-25 05:44:32', 'success', NULL),
(197, 'customer', 5, '192.168.15.253', 'Chrome on MacOS', '2026-05-11 06:44:32', 'success', NULL),
(198, 'customer', 4, '192.168.16.129', 'Chrome on Android', '2026-03-26 23:44:32', 'success', NULL),
(199, 'customer', 7, '10.0.2.190', 'Edge on Windows', '2026-04-18 03:44:32', 'success', NULL),
(200, 'customer', 10, '192.168.2.149', 'Firefox on Linux', '2026-03-21 01:44:32', 'failed', 'account_pending'),
(201, 'customer', 1, '192.168.1.19', 'Safari on iPhone', '2026-04-21 16:44:32', 'success', NULL),
(202, 'customer', 8, '192.168.9.125', 'Chrome on Android', '2026-03-18 14:44:32', 'success', NULL),
(203, 'staff', 3, '10.0.17.155', 'Safari on iPad', '2026-03-21 13:44:32', 'success', NULL),
(204, 'staff', 13, '192.168.18.251', 'Safari on iPhone', '2026-04-12 00:44:32', 'success', NULL),
(205, 'customer', 8, '192.168.17.161', 'Firefox on Linux', '2026-03-24 06:44:32', 'failed', 'too_many_attempts'),
(206, 'customer', 11, '10.0.12.181', 'Chrome on MacOS', '2026-03-01 07:44:32', 'success', NULL),
(207, 'staff', 1, '192.168.13.22', 'Edge on Windows', '2026-03-30 05:44:32', 'success', NULL),
(208, 'customer', 6, '10.0.17.96', 'Safari on iPhone', '2026-03-31 15:44:32', 'success', NULL),
(209, 'staff', 10, '192.168.12.101', 'Safari on iPhone', '2026-05-09 13:44:32', 'success', NULL),
(210, 'customer', 4, '192.168.16.40', 'Safari on iPad', '2026-02-24 01:44:32', 'success', NULL),
(211, 'staff', 11, '192.168.4.166', 'Chrome on MacOS', '2026-02-26 01:44:32', 'success', NULL),
(212, 'customer', 15, '192.168.11.41', 'Chrome on Android', '2026-03-26 23:44:32', 'success', NULL),
(213, 'staff', 2, '192.168.13.120', 'Safari on iPad', '2026-03-21 05:44:32', 'success', NULL),
(214, 'customer', 12, '10.0.6.49', 'Chrome on Android', '2026-05-16 12:44:32', 'success', NULL),
(215, 'staff', 3, '192.168.3.51', 'Firefox on Linux', '2026-04-01 13:44:32', 'failed', 'too_many_attempts'),
(216, 'staff', 11, '10.0.8.57', 'Mobile WebView', '2026-02-24 09:44:32', 'success', NULL),
(217, 'staff', 14, '192.168.16.18', 'Mobile WebView', '2026-04-06 18:44:32', 'failed', 'account_pending'),
(218, 'staff', 15, '10.0.3.40', 'Safari on iPad', '2026-03-13 22:44:32', 'success', NULL),
(219, 'customer', 3, '192.168.16.113', 'Mobile WebView', '2026-04-24 17:44:32', 'success', NULL),
(220, 'staff', 6, '192.168.18.199', 'Safari on iPhone', '2026-05-06 12:44:32', 'success', NULL),
(221, 'customer', 8, '10.0.5.84', 'Mobile WebView', '2026-03-22 21:44:32', 'failed', 'account_inactive'),
(222, 'staff', 7, '10.0.20.45', 'Chrome on Windows', '2026-03-29 13:44:32', 'success', NULL),
(223, 'customer', 1, '192.168.11.2', 'Edge on Windows', '2026-04-02 04:44:32', 'success', NULL),
(224, 'customer', 3, '192.168.15.27', 'Safari on iPhone', '2026-05-06 10:44:32', 'success', NULL),
(225, 'staff', 7, '10.0.14.245', 'Chrome on MacOS', '2026-04-26 13:44:32', 'success', NULL),
(226, 'staff', 7, '192.168.11.152', 'Safari on iPhone', '2026-05-20 11:44:32', 'failed', 'session_expired'),
(227, 'customer', 6, '192.168.9.81', 'Safari on iPhone', '2026-04-20 12:44:32', 'success', NULL),
(228, 'customer', 12, '192.168.10.64', 'Mobile WebView', '2026-03-22 17:44:32', 'success', NULL),
(229, 'customer', 9, '10.0.4.225', 'Mobile WebView', '2026-02-23 07:44:32', 'success', NULL),
(230, 'staff', 5, '192.168.13.162', 'Safari on iPhone', '2026-04-16 05:44:32', 'failed', 'invalid_password'),
(231, 'customer', 8, '192.168.9.193', 'Edge on Windows', '2026-04-24 09:44:32', 'success', NULL),
(232, 'customer', 6, '192.168.3.192', 'Safari on iPhone', '2026-04-09 01:44:32', 'success', NULL),
(233, 'customer', 13, '192.168.6.221', 'Edge on Windows', '2026-05-04 02:44:32', 'success', NULL),
(234, 'staff', 14, '192.168.13.4', 'Chrome on Android', '2026-05-06 06:44:32', 'success', NULL),
(235, 'customer', 5, '192.168.7.104', 'Chrome on Windows', '2026-05-13 02:44:32', 'success', NULL),
(236, 'customer', 9, '10.0.11.244', 'Safari on iPhone', '2026-04-10 22:44:32', 'success', NULL),
(237, 'staff', 2, '192.168.18.137', 'Chrome on Windows', '2026-03-21 03:44:32', 'success', NULL),
(238, 'staff', 13, '192.168.8.177', 'Safari on iPad', '2026-03-11 14:44:32', 'failed', 'user_not_found'),
(239, 'customer', 5, '10.0.1.45', 'Chrome on MacOS', '2026-04-14 17:44:32', 'success', NULL),
(240, 'customer', 12, '192.168.12.172', 'Firefox on Linux', '2026-04-24 22:44:32', 'success', NULL),
(241, 'customer', 7, '192.168.9.17', 'Chrome on Windows', '2026-05-14 03:44:32', 'success', NULL),
(242, 'customer', 15, '10.0.7.12', 'Safari on iPhone', '2026-04-25 19:44:32', 'success', NULL),
(243, 'customer', 7, '192.168.19.87', 'Mobile WebView', '2026-03-07 02:44:32', 'success', NULL),
(244, 'staff', 15, '192.168.3.134', 'Safari on iPhone', '2026-03-06 00:44:32', 'success', NULL),
(245, 'customer', 2, '192.168.20.36', 'Chrome on MacOS', '2026-04-10 10:44:32', 'success', NULL),
(246, 'staff', 13, '192.168.16.233', 'Chrome on Android', '2026-04-24 13:44:32', 'success', NULL),
(247, 'customer', 8, '192.168.11.134', 'Mobile WebView', '2026-04-16 10:44:32', 'failed', 'account_pending'),
(248, 'customer', 13, '10.0.15.25', 'Safari on iPhone', '2026-04-20 17:44:32', 'success', NULL),
(249, 'customer', 3, '10.0.8.74', 'Safari on iPhone', '2026-04-06 17:44:32', 'success', NULL),
(250, 'customer', 12, '192.168.3.163', 'Mobile WebView', '2026-04-01 07:44:32', 'success', NULL),
(251, 'staff', 4, '192.168.12.77', 'Chrome on MacOS', '2026-04-25 12:44:32', 'failed', 'account_inactive'),
(252, 'customer', 14, '10.0.15.231', 'Safari on iPhone', '2026-05-08 19:44:32', 'failed', 'invalid_password'),
(253, 'staff', 5, '10.0.16.175', 'Chrome on Windows', '2026-04-10 10:44:32', 'success', NULL),
(254, 'customer', 4, '10.0.7.51', 'Chrome on Windows', '2026-03-30 14:44:32', 'success', NULL),
(255, 'customer', 8, '10.0.19.82', 'Chrome on MacOS', '2026-04-24 11:44:32', 'failed', 'too_many_attempts'),
(256, 'customer', 6, '10.0.12.2', 'Safari on iPhone', '2026-04-08 22:44:32', 'success', NULL),
(257, 'staff', 15, '192.168.10.51', 'Edge on Windows', '2026-02-26 05:44:32', 'success', NULL),
(258, 'staff', 8, '10.0.19.235', 'Mobile WebView', '2026-03-25 21:44:32', 'failed', 'too_many_attempts'),
(259, 'staff', 1, '192.168.3.234', 'Chrome on Android', '2026-05-17 16:44:32', 'success', NULL),
(260, 'staff', 3, '192.168.6.201', 'Chrome on Windows', '2026-03-01 00:44:32', 'success', NULL),
(261, 'customer', 13, '192.168.13.246', 'Chrome on Windows', '2026-05-07 16:44:32', 'success', NULL),
(262, 'staff', 15, '10.0.10.205', 'Edge on Windows', '2026-04-23 12:44:32', 'success', NULL),
(263, 'customer', 10, '192.168.12.121', 'Edge on Windows', '2026-04-08 18:44:32', 'success', NULL),
(264, 'staff', 2, '192.168.1.236', 'Edge on Windows', '2026-03-17 06:44:32', 'success', NULL),
(265, 'staff', 12, '10.0.15.19', 'Safari on iPhone', '2026-05-14 19:44:32', 'failed', 'user_not_found'),
(266, 'staff', 2, '10.0.9.6', 'Chrome on MacOS', '2026-03-12 20:44:32', 'success', NULL),
(267, 'customer', 1, '10.0.19.173', 'Edge on Windows', '2026-02-23 09:44:32', 'success', NULL),
(268, 'customer', 8, '192.168.15.43', 'Edge on Windows', '2026-04-01 10:44:32', 'success', NULL),
(269, 'customer', 4, '192.168.9.215', 'Mobile WebView', '2026-04-15 08:44:32', 'success', NULL),
(270, 'customer', 15, '10.0.17.67', 'Chrome on MacOS', '2026-04-05 09:44:32', 'success', NULL),
(271, 'staff', 4, '192.168.17.62', 'Firefox on Linux', '2026-03-16 20:44:32', 'failed', 'account_inactive'),
(272, 'customer', 5, '192.168.5.172', 'Firefox on Linux', '2026-04-08 02:44:32', 'success', NULL),
(273, 'customer', 1, '192.168.16.171', 'Chrome on Windows', '2026-05-11 22:44:32', 'success', NULL),
(274, 'staff', 3, '10.0.4.62', 'Firefox on Linux', '2026-02-26 23:44:32', 'success', NULL),
(275, 'customer', 8, '10.0.14.50', 'Mobile WebView', '2026-05-07 10:44:32', 'success', NULL),
(276, 'customer', 3, '192.168.19.47', 'Chrome on Windows', '2026-02-21 19:44:32', 'success', NULL),
(277, 'customer', 7, '192.168.1.244', 'Firefox on Linux', '2026-03-19 01:44:32', 'failed', 'account_pending'),
(278, 'customer', 8, '192.168.12.116', 'Edge on Windows', '2026-03-30 06:44:32', 'success', NULL),
(279, 'customer', 4, '192.168.12.201', 'Chrome on Android', '2026-04-05 09:44:32', 'failed', 'user_not_found'),
(280, 'customer', 1, '192.168.9.143', 'Safari on iPad', '2026-03-26 16:44:32', 'failed', 'account_inactive'),
(281, 'customer', 1, '192.168.5.52', 'Safari on iPhone', '2026-05-21 07:44:32', 'success', NULL),
(282, 'staff', 11, '192.168.1.109', 'Chrome on Windows', '2026-05-04 18:44:32', 'success', NULL),
(283, 'customer', 3, '192.168.11.129', 'Mobile WebView', '2026-05-11 16:44:32', 'success', NULL),
(284, 'customer', 2, '192.168.17.183', 'Chrome on Android', '2026-03-19 10:44:32', 'success', NULL),
(285, 'staff', 9, '10.0.20.33', 'Firefox on Linux', '2026-05-20 09:44:32', 'success', NULL),
(286, 'staff', 4, '10.0.1.236', 'Edge on Windows', '2026-03-07 20:44:32', 'success', NULL),
(287, 'customer', 1, '192.168.9.165', 'Mobile WebView', '2026-03-23 21:44:32', 'failed', 'account_pending'),
(288, 'customer', 9, '192.168.20.199', 'Chrome on Windows', '2026-03-05 05:44:32', 'success', NULL),
(289, 'customer', 5, '10.0.2.41', 'Edge on Windows', '2026-05-11 09:44:32', 'failed', 'session_expired'),
(290, 'customer', 3, '192.168.11.176', 'Chrome on MacOS', '2026-02-22 22:44:32', 'success', NULL),
(291, 'staff', 5, '192.168.17.175', 'Mobile WebView', '2026-03-26 01:44:32', 'success', NULL),
(292, 'customer', 4, '10.0.18.28', 'Mobile WebView', '2026-04-05 18:44:32', 'failed', 'session_expired'),
(293, 'customer', 5, '192.168.20.73', 'Edge on Windows', '2026-03-01 13:44:32', 'success', NULL),
(294, 'customer', 6, '10.0.19.173', 'Firefox on Linux', '2026-05-02 06:44:32', 'success', NULL),
(295, 'staff', 6, '10.0.18.133', 'Mobile WebView', '2026-05-17 23:44:32', 'success', NULL),
(296, 'staff', 8, '10.0.1.73', 'Safari on iPhone', '2026-02-25 19:44:32', 'success', NULL),
(297, 'customer', 1, '192.168.10.212', 'Firefox on Linux', '2026-02-28 21:44:32', 'success', NULL),
(298, 'customer', 6, '10.0.14.120', 'Safari on iPad', '2026-04-03 21:44:32', 'success', NULL),
(299, 'customer', 12, '10.0.13.168', 'Safari on iPad', '2026-04-13 17:44:32', 'success', NULL),
(300, 'customer', 1, '10.0.8.65', 'Chrome on Windows', '2026-03-27 14:44:32', 'success', NULL),
(301, 'customer', 3, '10.0.4.97', 'Safari on iPhone', '2026-04-07 23:44:32', 'failed', 'user_not_found'),
(302, 'customer', 11, '192.168.3.213', 'Mobile WebView', '2026-03-04 17:44:32', 'success', NULL),
(303, 'staff', 7, '10.0.18.160', 'Edge on Windows', '2026-03-06 19:44:32', 'success', NULL),
(304, 'staff', 10, '10.0.16.160', 'Chrome on MacOS', '2026-04-21 05:44:32', 'success', NULL),
(305, 'customer', 12, '192.168.5.88', 'Mobile WebView', '2026-02-28 19:44:32', 'success', NULL),
(306, 'customer', 10, '192.168.10.84', 'Chrome on Android', '2026-05-05 04:44:32', 'success', NULL),
(307, 'customer', 15, '192.168.16.86', 'Safari on iPhone', '2026-04-12 02:44:32', 'success', NULL),
(308, 'customer', 5, '10.0.17.78', 'Chrome on Windows', '2026-04-28 04:44:32', 'success', NULL),
(309, 'staff', 8, '192.168.19.149', 'Chrome on Windows', '2026-03-21 06:44:32', 'failed', 'session_expired'),
(310, 'customer', 7, '192.168.13.158', 'Chrome on Android', '2026-05-09 07:44:32', 'success', NULL),
(311, 'staff', 6, '192.168.20.2', 'Chrome on Windows', '2026-04-09 08:44:32', 'success', NULL),
(312, 'staff', 15, '10.0.10.206', 'Edge on Windows', '2026-03-24 00:44:32', 'success', NULL),
(313, 'customer', 9, '192.168.1.198', 'Firefox on Linux', '2026-04-21 23:44:32', 'success', NULL),
(314, 'customer', 4, '192.168.13.55', 'Chrome on Android', '2026-04-28 17:44:32', 'failed', 'account_pending'),
(315, 'customer', 9, '10.0.4.1', 'Safari on iPad', '2026-04-22 04:44:32', 'success', NULL),
(316, 'staff', 4, '192.168.15.112', 'Mobile WebView', '2026-04-09 23:44:32', 'failed', 'session_expired'),
(317, 'customer', 15, '192.168.3.243', 'Safari on iPad', '2026-05-03 16:44:32', 'success', NULL),
(318, 'customer', 13, '192.168.3.14', 'Mobile WebView', '2026-04-27 18:44:32', 'success', NULL),
(319, 'staff', 2, '192.168.8.63', 'Chrome on Windows', '2026-04-06 00:44:32', 'success', NULL),
(320, 'staff', 3, '10.0.14.159', 'Chrome on Android', '2026-03-15 00:44:32', 'failed', 'account_inactive'),
(321, 'customer', 4, '10.0.15.7', 'Chrome on Windows', '2026-02-26 18:44:32', 'success', NULL),
(322, 'customer', 7, '192.168.20.153', 'Chrome on Android', '2026-03-05 13:44:32', 'failed', 'too_many_attempts'),
(323, 'customer', 7, '192.168.16.203', 'Edge on Windows', '2026-03-19 18:44:32', 'success', NULL),
(324, 'customer', 4, '192.168.9.189', 'Edge on Windows', '2026-04-25 11:44:32', 'success', NULL),
(325, 'customer', 2, '192.168.7.21', 'Safari on iPad', '2026-05-20 17:44:32', 'success', NULL),
(326, 'customer', 13, '10.0.19.12', 'Safari on iPad', '2026-03-03 05:44:32', 'success', NULL),
(327, 'customer', 4, '192.168.18.78', 'Chrome on MacOS', '2026-04-30 18:44:32', 'success', NULL),
(328, 'customer', 4, '192.168.17.241', 'Safari on iPhone', '2026-03-16 16:44:32', 'success', NULL),
(329, 'staff', 2, '10.0.7.213', 'Chrome on Android', '2026-04-08 15:44:32', 'success', NULL),
(330, 'staff', 12, '192.168.6.207', 'Chrome on Android', '2026-03-24 20:44:32', 'failed', 'account_inactive'),
(331, 'customer', 8, '192.168.7.140', 'Chrome on MacOS', '2026-04-17 22:44:32', 'success', NULL),
(332, 'staff', 5, '192.168.16.133', 'Chrome on Android', '2026-03-26 00:44:32', 'success', NULL),
(333, 'customer', 5, '192.168.8.133', 'Safari on iPad', '2026-03-01 08:44:32', 'success', NULL),
(334, 'customer', 8, '192.168.3.3', 'Firefox on Linux', '2026-04-14 09:44:32', 'failed', 'too_many_attempts'),
(335, 'customer', 10, '192.168.14.227', 'Safari on iPad', '2026-04-21 23:44:32', 'success', NULL),
(336, 'customer', 2, '192.168.19.139', 'Mobile WebView', '2026-02-26 11:44:32', 'failed', 'invalid_password'),
(337, 'customer', 9, '192.168.2.4', 'Chrome on MacOS', '2026-05-20 19:44:32', 'success', NULL),
(338, 'staff', 2, '10.0.1.135', 'Edge on Windows', '2026-04-21 12:44:32', 'success', NULL),
(339, 'staff', 1, '10.0.13.103', 'Chrome on Windows', '2026-05-13 03:44:32', 'success', NULL),
(340, 'customer', 5, '192.168.16.151', 'Edge on Windows', '2026-05-05 06:44:32', 'success', NULL),
(341, 'customer', 3, '192.168.8.138', 'Edge on Windows', '2026-04-27 19:44:32', 'success', NULL),
(342, 'staff', 14, '10.0.14.202', 'Mobile WebView', '2026-04-28 21:44:32', 'failed', 'invalid_password'),
(343, 'customer', 10, '192.168.15.243', 'Firefox on Linux', '2026-04-10 02:44:32', 'success', NULL),
(344, 'staff', 2, '192.168.17.167', 'Mobile WebView', '2026-04-13 23:44:32', 'success', NULL),
(345, 'customer', 1, '192.168.1.84', 'Firefox on Linux', '2026-05-05 09:44:32', 'success', NULL),
(346, 'customer', 8, '10.0.3.215', 'Chrome on MacOS', '2026-03-18 09:44:32', 'success', NULL),
(347, 'customer', 9, '10.0.19.109', 'Safari on iPhone', '2026-04-03 20:44:32', 'success', NULL),
(348, 'staff', 2, '10.0.9.208', 'Mobile WebView', '2026-02-24 05:44:32', 'success', NULL),
(349, 'customer', 10, '10.0.18.11', 'Firefox on Linux', '2026-05-09 17:44:32', 'success', NULL),
(350, 'customer', 8, '192.168.14.232', 'Edge on Windows', '2026-04-21 15:44:32', 'success', NULL),
(351, 'staff', 2, '10.0.7.72', 'Safari on iPhone', '2026-02-25 18:44:32', 'success', NULL),
(352, 'customer', 6, '10.0.5.153', 'Safari on iPhone', '2026-03-14 14:44:32', 'success', NULL),
(353, 'staff', 3, '10.0.9.232', 'Chrome on Android', '2026-04-25 14:44:32', 'success', NULL),
(354, 'customer', 4, '10.0.9.203', 'Chrome on MacOS', '2026-04-14 16:44:32', 'success', NULL),
(355, 'customer', 3, '192.168.17.120', 'Chrome on MacOS', '2026-03-23 14:44:32', 'success', NULL),
(356, 'staff', 7, '10.0.14.194', 'Chrome on MacOS', '2026-03-02 11:44:32', 'success', NULL),
(357, 'staff', 10, '192.168.11.224', 'Chrome on MacOS', '2026-05-03 18:44:32', 'failed', 'account_pending'),
(358, 'staff', 15, '10.0.5.183', 'Chrome on MacOS', '2026-05-08 05:44:32', 'success', NULL),
(359, 'staff', 4, '192.168.13.62', 'Safari on iPad', '2026-05-03 14:44:32', 'success', NULL),
(360, 'customer', 8, '10.0.2.61', 'Mobile WebView', '2026-05-08 15:44:32', 'success', NULL),
(361, 'staff', 12, '192.168.20.216', 'Chrome on Android', '2026-03-20 17:44:32', 'success', NULL),
(362, 'customer', 14, '192.168.14.93', 'Chrome on MacOS', '2026-03-08 16:44:32', 'success', NULL),
(363, 'customer', 1, '192.168.16.217', 'Chrome on MacOS', '2026-03-11 01:44:32', 'success', NULL),
(364, 'staff', 7, '192.168.7.185', 'Edge on Windows', '2026-03-15 09:44:32', 'failed', 'too_many_attempts'),
(365, 'staff', 6, '10.0.16.254', 'Edge on Windows', '2026-05-10 16:44:32', 'success', NULL),
(366, 'staff', 1, '192.168.15.19', 'Chrome on Android', '2026-03-19 10:44:32', 'failed', 'session_expired'),
(367, 'customer', 5, '192.168.20.94', 'Chrome on MacOS', '2026-05-05 01:44:32', 'success', NULL),
(368, 'staff', 13, '10.0.3.126', 'Chrome on Windows', '2026-03-05 07:44:32', 'success', NULL),
(369, 'customer', 8, '192.168.10.70', 'Mobile WebView', '2026-03-24 21:44:32', 'failed', 'session_expired'),
(370, 'staff', 8, '192.168.15.92', 'Firefox on Linux', '2026-04-22 21:44:32', 'failed', 'too_many_attempts'),
(371, 'customer', 6, '192.168.12.51', 'Safari on iPhone', '2026-02-26 16:44:32', 'success', NULL),
(372, 'staff', 13, '192.168.12.45', 'Chrome on Android', '2026-04-10 18:44:32', 'success', NULL),
(373, 'staff', 9, '192.168.6.12', 'Safari on iPad', '2026-05-09 01:44:32', 'success', NULL),
(374, 'staff', 5, '192.168.14.8', 'Chrome on Android', '2026-03-16 05:44:32', 'failed', 'invalid_password'),
(375, 'staff', 15, '192.168.18.87', 'Chrome on Windows', '2026-04-12 13:44:32', 'success', NULL),
(376, 'staff', 4, '192.168.12.28', 'Chrome on MacOS', '2026-03-09 20:44:32', 'success', NULL),
(377, 'customer', 7, '192.168.17.169', 'Mobile WebView', '2026-04-15 00:44:32', 'failed', 'invalid_password'),
(378, 'customer', 4, '192.168.3.27', 'Chrome on Android', '2026-03-27 21:44:32', 'failed', 'session_expired'),
(379, 'staff', 5, '10.0.2.118', 'Chrome on Windows', '2026-02-25 21:44:32', 'failed', 'user_not_found'),
(380, 'staff', 4, '10.0.4.241', 'Chrome on Android', '2026-05-18 19:44:32', 'success', NULL),
(381, 'customer', 4, '10.0.12.245', 'Chrome on Windows', '2026-03-18 04:44:32', 'success', NULL),
(382, 'customer', 7, '192.168.2.90', 'Edge on Windows', '2026-03-10 02:44:32', 'success', NULL),
(383, 'customer', 1, '10.0.14.30', 'Edge on Windows', '2026-04-17 03:44:32', 'success', NULL),
(384, 'staff', 3, '192.168.16.82', 'Chrome on Android', '2026-05-17 19:44:32', 'success', NULL),
(385, 'customer', 2, '10.0.16.243', 'Safari on iPad', '2026-05-05 18:44:32', 'failed', 'invalid_password'),
(386, 'staff', 10, '192.168.19.158', 'Safari on iPhone', '2026-04-06 18:44:32', 'failed', 'too_many_attempts'),
(387, 'customer', 6, '192.168.2.52', 'Firefox on Linux', '2026-05-20 13:44:32', 'success', NULL),
(388, 'customer', 6, '192.168.19.215', 'Safari on iPad', '2026-04-17 16:44:32', 'success', NULL),
(389, 'customer', 10, '192.168.9.226', 'Chrome on Android', '2026-04-18 04:44:32', 'success', NULL),
(390, 'staff', 12, '192.168.7.54', 'Chrome on Android', '2026-05-18 15:44:32', 'failed', 'user_not_found'),
(391, 'customer', 5, '192.168.19.28', 'Firefox on Linux', '2026-05-01 11:44:32', 'success', NULL),
(392, 'customer', 13, '192.168.15.158', 'Mobile WebView', '2026-03-10 04:44:32', 'failed', 'invalid_password'),
(393, 'customer', 13, '192.168.15.221', 'Chrome on Android', '2026-05-13 08:44:32', 'success', NULL),
(394, 'staff', 1, '192.168.20.28', 'Firefox on Linux', '2026-02-22 12:44:32', 'success', NULL),
(395, 'customer', 13, '10.0.8.249', 'Firefox on Linux', '2026-03-22 05:44:32', 'success', NULL),
(396, 'staff', 13, '10.0.17.165', 'Firefox on Linux', '2026-04-01 18:44:32', 'success', NULL),
(397, 'staff', 3, '192.168.17.179', 'Mobile WebView', '2026-03-10 07:44:32', 'success', NULL),
(398, 'customer', 5, '192.168.5.42', 'Chrome on Android', '2026-04-05 10:44:32', 'success', NULL),
(399, 'customer', 12, '192.168.18.135', 'Mobile WebView', '2026-05-03 05:44:32', 'success', NULL),
(400, 'staff', 1, '10.0.20.110', 'Chrome on Android', '2026-03-15 06:44:32', 'success', NULL),
(401, 'customer', 13, '10.0.19.25', 'Firefox on Linux', '2026-02-22 10:44:32', 'success', NULL),
(402, 'customer', 5, '192.168.12.240', 'Mobile WebView', '2026-02-24 10:44:32', 'success', NULL),
(403, 'staff', 10, '192.168.15.37', 'Edge on Windows', '2026-04-06 16:44:32', 'success', NULL),
(404, 'customer', 4, '192.168.10.214', 'Chrome on MacOS', '2026-03-23 16:44:32', 'failed', 'invalid_password'),
(405, 'staff', 15, '10.0.20.9', 'Chrome on Android', '2026-02-27 08:44:32', 'success', NULL),
(406, 'customer', 3, '192.168.12.59', 'Safari on iPad', '2026-03-29 20:44:32', 'success', NULL),
(407, 'customer', 9, '10.0.14.172', 'Safari on iPad', '2026-05-18 12:44:32', 'success', NULL),
(408, 'customer', 4, '10.0.2.161', 'Mobile WebView', '2026-02-24 13:44:32', 'success', NULL),
(409, 'staff', 1, '10.0.12.194', 'Chrome on Windows', '2026-03-05 04:44:32', 'success', NULL),
(410, 'customer', 1, '10.0.12.16', 'Edge on Windows', '2026-03-02 19:44:32', 'success', NULL),
(411, 'customer', 11, '192.168.7.86', 'Firefox on Linux', '2026-03-25 09:44:32', 'success', NULL),
(412, 'customer', 7, '192.168.11.124', 'Chrome on MacOS', '2026-03-06 19:44:32', 'success', NULL),
(413, 'staff', 3, '192.168.1.179', 'Safari on iPad', '2026-04-27 12:44:32', 'failed', 'account_pending'),
(414, 'customer', 7, '192.168.13.159', 'Chrome on Android', '2026-05-11 10:44:32', 'success', NULL),
(415, 'customer', 11, '192.168.4.21', 'Mobile WebView', '2026-04-28 20:44:32', 'success', NULL),
(416, 'staff', 3, '192.168.20.165', 'Safari on iPhone', '2026-04-13 02:44:32', 'success', NULL),
(417, 'staff', 2, '192.168.3.84', 'Chrome on Android', '2026-02-24 03:44:32', 'success', NULL),
(418, 'customer', 6, '192.168.10.245', 'Safari on iPad', '2026-04-17 21:44:32', 'success', NULL),
(419, 'customer', 5, '192.168.8.151', 'Chrome on MacOS', '2026-04-24 08:44:32', 'success', NULL),
(420, 'customer', 13, '10.0.4.148', 'Safari on iPad', '2026-04-25 04:44:32', 'success', NULL),
(421, 'customer', 8, '192.168.4.67', 'Chrome on MacOS', '2026-04-27 13:44:32', 'success', NULL),
(422, 'customer', 7, '192.168.8.85', 'Edge on Windows', '2026-05-19 02:44:32', 'success', NULL),
(423, 'staff', 13, '192.168.16.151', 'Firefox on Linux', '2026-03-24 05:44:32', 'success', NULL),
(424, 'staff', 11, '192.168.1.6', 'Chrome on Windows', '2026-04-22 00:44:32', 'success', NULL),
(425, 'customer', 2, '10.0.15.60', 'Mobile WebView', '2026-04-26 00:44:32', 'success', NULL),
(426, 'staff', 1, '192.168.14.222', 'Safari on iPad', '2026-04-29 06:44:32', 'success', NULL),
(427, 'customer', 10, '192.168.10.137', 'Chrome on Android', '2026-04-02 08:44:32', 'failed', 'user_not_found'),
(428, 'staff', 4, '192.168.17.94', 'Safari on iPhone', '2026-04-15 07:44:32', 'success', NULL),
(429, 'customer', 6, '192.168.8.124', 'Safari on iPad', '2026-04-14 10:44:32', 'success', NULL),
(430, 'customer', 1, '192.168.7.149', 'Mobile WebView', '2026-02-22 08:44:32', 'success', NULL),
(431, 'customer', 6, '10.0.14.102', 'Chrome on Windows', '2026-05-20 10:44:32', 'failed', 'user_not_found'),
(432, 'customer', 12, '192.168.15.134', 'Safari on iPad', '2026-03-03 12:44:32', 'success', NULL),
(433, 'staff', 7, '10.0.19.236', 'Chrome on MacOS', '2026-04-06 12:44:32', 'success', NULL),
(434, 'customer', 12, '10.0.14.229', 'Edge on Windows', '2026-02-22 02:44:32', 'failed', 'user_not_found'),
(435, 'customer', 4, '192.168.15.208', 'Mobile WebView', '2026-02-24 05:44:32', 'success', NULL),
(436, 'staff', 8, '192.168.16.211', 'Chrome on MacOS', '2026-03-13 02:44:32', 'success', NULL),
(437, 'staff', 2, '192.168.12.73', 'Chrome on MacOS', '2026-02-21 19:44:32', 'success', NULL),
(438, 'customer', 5, '10.0.19.177', 'Firefox on Linux', '2026-04-19 17:44:32', 'success', NULL),
(439, 'customer', 5, '10.0.10.182', 'Chrome on Android', '2026-02-27 11:44:32', 'success', NULL),
(440, 'customer', 10, '10.0.8.48', 'Chrome on MacOS', '2026-03-18 09:44:32', 'success', NULL),
(441, 'customer', 15, '192.168.1.219', 'Safari on iPhone', '2026-03-10 05:44:32', 'success', NULL),
(442, 'customer', 5, '192.168.5.31', 'Chrome on MacOS', '2026-03-04 15:44:32', 'success', NULL),
(443, 'customer', 2, '10.0.7.219', 'Safari on iPhone', '2026-05-20 06:44:32', 'success', NULL),
(444, 'customer', 11, '10.0.9.10', 'Chrome on MacOS', '2026-04-29 19:44:32', 'success', NULL),
(445, 'customer', 9, '10.0.6.240', 'Mobile WebView', '2026-03-06 23:44:32', 'success', NULL),
(446, 'staff', 6, '192.168.6.237', 'Chrome on MacOS', '2026-04-16 23:44:32', 'success', NULL),
(447, 'staff', 2, '192.168.8.239', 'Edge on Windows', '2026-02-24 06:44:32', 'success', NULL),
(448, 'staff', 5, '192.168.9.70', 'Chrome on Windows', '2026-03-23 09:44:32', 'success', NULL),
(449, 'staff', 14, '10.0.5.16', 'Firefox on Linux', '2026-05-01 07:44:32', 'success', NULL),
(450, 'staff', 7, '192.168.20.158', 'Chrome on Android', '2026-05-09 07:44:32', 'success', NULL),
(451, 'staff', 1, '10.0.18.27', 'Chrome on MacOS', '2026-03-05 15:44:32', 'success', NULL),
(452, 'customer', 5, '10.0.3.49', 'Edge on Windows', '2026-04-19 08:44:32', 'success', NULL),
(453, 'staff', 5, '10.0.12.58', 'Safari on iPad', '2026-04-10 09:44:32', 'failed', 'account_inactive'),
(454, 'customer', 3, '192.168.14.254', 'Chrome on Windows', '2026-05-03 13:44:32', 'failed', 'account_pending'),
(455, 'staff', 9, '192.168.2.153', 'Chrome on MacOS', '2026-04-22 05:44:32', 'success', NULL),
(456, 'staff', 8, '10.0.7.44', 'Mobile WebView', '2026-05-01 03:44:32', 'failed', 'session_expired'),
(457, 'customer', 15, '192.168.12.117', 'Edge on Windows', '2026-04-22 11:44:32', 'success', NULL),
(458, 'customer', 13, '192.168.4.83', 'Chrome on Android', '2026-03-12 23:44:32', 'success', NULL),
(459, 'customer', 1, '192.168.11.36', 'Chrome on Windows', '2026-02-22 18:44:32', 'success', NULL),
(460, 'customer', 5, '10.0.5.205', 'Safari on iPad', '2026-04-07 01:44:32', 'success', NULL),
(461, 'staff', 3, '192.168.20.181', 'Firefox on Linux', '2026-04-21 19:44:32', 'success', NULL),
(462, 'customer', 7, '192.168.15.217', 'Chrome on Windows', '2026-03-21 03:44:32', 'success', NULL),
(463, 'customer', 4, '192.168.8.216', 'Chrome on Windows', '2026-03-09 13:44:32', 'failed', 'account_inactive'),
(464, 'customer', 2, '192.168.18.54', 'Safari on iPad', '2026-04-14 14:44:32', 'success', NULL),
(465, 'staff', 14, '192.168.3.43', 'Safari on iPad', '2026-03-20 06:44:32', 'failed', 'too_many_attempts'),
(466, 'customer', 7, '192.168.2.180', 'Safari on iPhone', '2026-03-21 01:44:32', 'failed', 'account_inactive'),
(467, 'staff', 5, '10.0.14.188', 'Firefox on Linux', '2026-05-19 05:44:32', 'success', NULL),
(468, 'customer', 14, '192.168.18.203', 'Safari on iPad', '2026-04-08 02:44:32', 'success', NULL),
(469, 'staff', 5, '192.168.9.71', 'Chrome on Android', '2026-03-02 08:44:32', 'failed', 'too_many_attempts'),
(470, 'staff', 1, '192.168.15.218', 'Chrome on Android', '2026-04-20 05:44:32', 'success', NULL),
(471, 'staff', 3, '10.0.8.51', 'Mobile WebView', '2026-05-13 19:44:32', 'failed', 'too_many_attempts'),
(472, 'customer', 7, '192.168.5.211', 'Safari on iPad', '2026-03-26 14:44:32', 'success', NULL),
(473, 'customer', 8, '10.0.18.24', 'Mobile WebView', '2026-05-12 13:44:32', 'success', NULL),
(474, 'staff', 13, '192.168.8.61', 'Chrome on Windows', '2026-04-06 00:44:32', 'success', NULL),
(475, 'customer', 1, '192.168.15.204', 'Chrome on MacOS', '2026-03-21 10:44:32', 'success', NULL),
(476, 'staff', 1, '192.168.13.27', 'Firefox on Linux', '2026-02-27 18:44:32', 'success', NULL),
(477, 'staff', 6, '192.168.11.53', 'Safari on iPad', '2026-03-23 12:44:32', 'success', NULL),
(478, 'staff', 3, '192.168.2.86', 'Edge on Windows', '2026-04-06 09:44:32', 'failed', 'user_not_found'),
(479, 'customer', 10, '192.168.14.226', 'Safari on iPhone', '2026-05-09 20:44:32', 'success', NULL),
(480, 'customer', 4, '192.168.1.117', 'Chrome on Android', '2026-03-22 17:44:32', 'success', NULL),
(481, 'staff', 7, '192.168.9.113', 'Mobile WebView', '2026-04-08 22:44:32', 'success', NULL),
(482, 'customer', 3, '10.0.1.250', 'Chrome on MacOS', '2026-05-02 21:44:32', 'success', NULL),
(483, 'customer', 6, '10.0.7.21', 'Safari on iPad', '2026-03-17 23:44:32', 'success', NULL),
(484, 'staff', 1, '192.168.18.45', 'Safari on iPhone', '2026-03-06 00:44:32', 'success', NULL),
(485, 'staff', 10, '10.0.5.166', 'Edge on Windows', '2026-05-21 03:44:32', 'success', NULL),
(486, 'customer', 6, '192.168.7.42', 'Chrome on MacOS', '2026-03-18 07:44:32', 'success', NULL),
(487, 'customer', 4, '192.168.16.193', 'Safari on iPad', '2026-05-02 20:44:32', 'success', NULL),
(488, 'customer', 14, '192.168.17.144', 'Safari on iPad', '2026-04-24 02:44:32', 'failed', 'invalid_password'),
(489, 'staff', 1, '192.168.18.83', 'Chrome on Windows', '2026-05-18 04:44:32', 'success', NULL),
(490, 'staff', 13, '10.0.7.69', 'Safari on iPad', '2026-04-16 19:44:32', 'success', NULL),
(491, 'staff', 14, '10.0.12.71', 'Firefox on Linux', '2026-04-07 23:44:32', 'failed', 'user_not_found'),
(492, 'staff', 5, '192.168.12.100', 'Chrome on Android', '2026-05-21 01:44:32', 'failed', 'account_inactive'),
(493, 'customer', 8, '192.168.16.57', 'Chrome on MacOS', '2026-04-01 02:44:32', 'failed', 'too_many_attempts'),
(494, 'staff', 11, '192.168.6.138', 'Mobile WebView', '2026-02-28 14:44:32', 'success', NULL),
(495, 'customer', 8, '192.168.19.145', 'Chrome on Windows', '2026-03-18 02:44:32', 'success', NULL),
(496, 'customer', 2, '192.168.9.158', 'Chrome on MacOS', '2026-02-21 19:44:32', 'success', NULL),
(497, 'customer', 13, '192.168.14.147', 'Mobile WebView', '2026-03-20 15:44:32', 'success', NULL),
(498, 'customer', 1, '192.168.2.78', 'Safari on iPhone', '2026-03-07 06:44:32', 'success', NULL),
(499, 'customer', 3, '192.168.1.14', 'Chrome on Android', '2026-02-27 11:44:32', 'success', NULL),
(500, 'customer', 9, '192.168.16.149', 'Edge on Windows', '2026-04-27 21:44:32', 'failed', 'account_inactive'),
(501, 'customer', 7, '10.0.11.44', 'Safari on iPhone', '2026-03-03 21:44:32', 'success', NULL),
(502, 'customer', 13, '192.168.8.54', 'Mobile WebView', '2026-02-27 13:44:32', 'success', NULL),
(503, 'customer', 7, '192.168.3.71', 'Mobile WebView', '2026-02-22 08:44:32', 'success', NULL),
(504, 'staff', 7, '192.168.8.79', 'Safari on iPad', '2026-05-19 11:44:32', 'success', NULL),
(505, 'staff', 8, '10.0.3.154', 'Firefox on Linux', '2026-04-02 17:44:32', 'success', NULL),
(506, 'staff', 11, '10.0.3.14', 'Mobile WebView', '2026-04-14 01:44:32', 'success', NULL),
(518, 'customer', 6, '24.107.206.199', 'Safari on iPad', '2026-05-22 00:55:52', 'success', NULL),
(519, 'customer', 10, '252.24.127.53', 'Edge on Windows', '2026-05-22 02:07:07', 'success', 'session_expired'),
(520, 'staff', 2, '3.202.235.60', 'Safari on iPad', '2026-05-22 07:40:38', 'success', 'too_many_attempts'),
(521, 'customer', 1, '86.137.170.182', 'Edge on Windows', '2026-05-22 16:34:15', 'success', NULL),
(522, 'customer', 8, '153.110.88.110', 'Chrome on Windows', '2026-05-22 07:49:21', 'success', NULL);
INSERT INTO `login_logs` (`id`, `user_type`, `user_id`, `ip_address`, `user_agent`, `login_at`, `status`, `fail_reason`) VALUES
(523, 'staff', 2, '32.70.254.38', 'Chrome on MacOS', '2026-05-22 08:33:21', 'success', NULL),
(524, 'staff', 5, '67.114.114.225', 'Chrome on Windows', '2026-05-22 17:02:30', 'success', NULL),
(525, 'staff', 7, '183.65.31.214', 'Chrome on MacOS', '2026-05-22 15:23:34', 'success', NULL),
(526, 'customer', 8, '46.110.159.208', 'Chrome on Android', '2026-05-22 13:59:34', 'success', NULL),
(527, 'staff', 2, '190.132.90.54', 'Mobile WebView', '2026-05-22 08:26:51', 'success', NULL),
(528, 'customer', 13, '73.228.157.101', 'Chrome on Windows', '2026-05-22 09:54:42', 'success', NULL),
(529, 'customer', 5, '39.219.210.141', 'Safari on iPhone', '2026-05-22 18:23:39', 'failed', NULL),
(530, 'customer', 9, '184.209.236.46', 'Chrome on Windows', '2026-05-22 00:09:52', 'success', NULL),
(531, 'customer', 4, '116.143.110.123', 'Chrome on Windows', '2026-05-22 02:56:41', 'success', NULL),
(532, 'customer', 15, '76.140.218.160', 'Edge on Windows', '2026-05-22 22:39:24', 'success', NULL),
(533, 'customer', 6, '84.160.37.214', 'Chrome on MacOS', '2026-05-22 07:31:59', 'success', NULL),
(534, 'customer', 2, '158.214.85.38', 'Firefox on Linux', '2026-05-22 05:50:15', 'success', NULL),
(535, 'customer', 10, '196.217.238.32', 'Chrome on MacOS', '2026-05-22 17:33:26', 'success', NULL),
(536, 'customer', 5, '108.67.14.123', 'Chrome on Android', '2026-05-22 18:10:22', 'success', NULL),
(537, 'customer', 7, '210.199.111.211', 'Chrome on MacOS', '2026-05-22 16:44:11', 'failed', NULL),
(538, 'customer', 2, '80.42.226.240', 'Chrome on Windows', '2026-05-22 08:10:01', 'success', NULL),
(539, 'customer', 8, '132.27.246.130', 'Firefox on Linux', '2026-05-22 17:02:37', 'success', 'too_many_attempts'),
(540, 'customer', 1, '79.108.46.161', 'Edge on Windows', '2026-05-22 03:13:15', 'failed', 'user_not_found'),
(541, 'staff', 13, '118.195.111.224', 'Chrome on Windows', '2026-05-22 18:43:10', 'success', 'too_many_attempts'),
(542, 'staff', 7, '31.63.221.152', 'Safari on iPhone', '2026-05-22 01:30:13', 'success', 'session_expired'),
(543, 'customer', 6, '246.162.74.136', 'Chrome on MacOS', '2026-05-22 09:57:46', 'success', NULL),
(544, 'customer', 15, '132.168.187.179', 'Safari on iPhone', '2026-05-22 09:03:19', 'success', 'account_pending'),
(545, 'customer', 10, '239.220.127.230', 'Chrome on Windows', '2026-05-22 09:06:19', 'failed', NULL),
(546, 'staff', 8, '148.110.103.184', 'Safari on iPad', '2026-05-22 19:59:12', 'failed', NULL),
(547, 'staff', 15, '86.216.59.157', 'Safari on iPhone', '2026-05-22 00:09:45', 'failed', NULL),
(548, 'customer', 12, '182.93.174.78', 'Safari on iPad', '2026-05-22 12:00:40', 'success', NULL),
(549, 'staff', 3, '220.183.255.214', 'Chrome on Android', '2026-05-22 11:26:29', 'success', NULL),
(550, 'customer', 10, '108.59.227.189', 'Chrome on Windows', '2026-05-22 23:47:11', 'failed', NULL),
(551, 'customer', 4, '30.225.14.159', 'Mobile WebView', '2026-05-22 22:27:20', 'success', NULL),
(552, 'customer', 12, '115.244.110.72', 'Chrome on Windows', '2026-05-22 18:05:45', 'success', NULL),
(553, 'staff', 5, '102.3.219.65', 'Firefox on Linux', '2026-05-22 17:30:50', 'success', NULL),
(554, 'customer', 9, '4.99.229.80', 'Chrome on MacOS', '2026-05-22 09:54:12', 'success', NULL),
(555, 'staff', 3, '59.169.156.21', 'Edge on Windows', '2026-05-22 13:22:42', 'success', 'invalid_password'),
(556, 'staff', 9, '142.17.167.20', 'Safari on iPad', '2026-05-22 21:44:58', 'success', NULL),
(557, 'staff', 12, '30.92.114.39', 'Safari on iPad', '2026-05-22 15:01:50', 'failed', NULL),
(558, 'customer', 13, '201.126.27.13', 'Mobile WebView', '2026-05-22 11:20:35', 'success', NULL),
(559, 'staff', 3, '23.214.235.25', 'Firefox on Linux', '2026-05-22 06:42:02', 'success', NULL),
(560, 'customer', 1, '181.117.42.113', 'Firefox on Linux', '2026-05-22 06:50:53', 'success', NULL),
(561, 'customer', 14, '8.138.154.100', 'Chrome on Android', '2026-05-22 14:10:39', 'success', NULL),
(562, 'customer', 1, '23.88.114.51', 'Firefox on Linux', '2026-05-22 16:35:11', 'success', NULL),
(563, 'customer', 5, '152.38.242.76', 'Firefox on Linux', '2026-05-22 07:30:25', 'success', NULL),
(564, 'customer', 8, '5.163.37.203', 'Edge on Windows', '2026-05-22 09:02:48', 'success', 'account_locked'),
(565, 'customer', 15, '37.196.107.200', 'Firefox on Linux', '2026-05-22 23:28:34', 'failed', NULL),
(566, 'staff', 4, '104.63.255.67', 'Safari on iPhone', '2026-05-22 18:07:48', 'failed', NULL),
(567, 'customer', 6, '85.155.8.87', 'Edge on Windows', '2026-05-22 00:05:34', 'success', NULL),
(568, 'customer', 5, '12.93.174.77', 'Safari on iPad', '2026-05-22 10:25:17', 'success', NULL),
(569, 'customer', 7, '18.242.134.198', 'Safari on iPhone', '2026-05-22 04:35:16', 'success', NULL),
(570, 'customer', 15, '56.53.99.78', 'Safari on iPhone', '2026-05-22 21:44:51', 'success', NULL),
(571, 'customer', 1, '245.163.80.166', 'Safari on iPhone', '2026-05-22 14:23:24', 'success', NULL),
(572, 'customer', 15, '82.170.93.211', 'Chrome on Windows', '2026-05-22 16:38:45', 'success', NULL),
(573, 'customer', 2, '96.166.30.160', 'Chrome on MacOS', '2026-05-22 02:04:26', 'success', 'user_not_found'),
(574, 'customer', 7, '149.159.92.237', 'Edge on Windows', '2026-05-22 00:34:43', 'success', NULL),
(575, 'customer', 1, '77.108.52.193', 'Chrome on Android', '2026-05-22 13:13:29', 'success', NULL),
(576, 'customer', 15, '16.99.191.146', 'Edge on Windows', '2026-05-22 08:31:20', 'failed', NULL),
(577, 'customer', 8, '188.38.137.59', 'Edge on Windows', '2026-05-22 01:16:14', 'success', 'too_many_attempts'),
(578, 'customer', 5, '11.91.167.50', 'Chrome on Windows', '2026-05-22 11:20:17', 'success', NULL),
(579, 'customer', 5, '223.121.189.74', 'Chrome on Android', '2026-05-22 04:48:59', 'success', NULL),
(580, 'customer', 11, '40.190.65.8', 'Safari on iPad', '2026-05-22 20:54:18', 'success', NULL),
(581, 'staff', 9, '33.248.123.125', 'Mobile WebView', '2026-05-22 12:41:03', 'success', NULL),
(582, 'customer', 8, '183.9.4.246', 'Chrome on MacOS', '2026-05-22 23:19:44', 'success', NULL),
(583, 'customer', 12, '102.195.158.204', 'Chrome on Android', '2026-05-22 06:59:32', 'success', NULL),
(584, 'customer', 4, '29.231.48.58', 'Edge on Windows', '2026-05-22 03:49:56', 'success', 'too_many_attempts'),
(585, 'customer', 6, '81.130.151.111', 'Safari on iPad', '2026-05-22 15:50:43', 'success', NULL),
(586, 'staff', 6, '67.51.53.112', 'Edge on Windows', '2026-05-22 12:43:34', 'failed', NULL),
(587, 'staff', 13, '139.68.177.170', 'Chrome on Android', '2026-05-22 05:45:51', 'success', NULL),
(588, 'customer', 1, '157.226.148.60', 'Safari on iPad', '2026-05-22 11:42:31', 'success', NULL),
(589, 'customer', 11, '53.236.253.48', 'Mobile WebView', '2026-05-22 05:34:56', 'success', NULL),
(590, 'staff', 1, '179.88.154.253', 'Chrome on Android', '2026-05-22 18:27:15', 'success', NULL),
(591, 'customer', 2, '200.162.211.55', 'Edge on Windows', '2026-05-22 08:37:59', 'failed', 'session_expired'),
(592, 'staff', 2, '174.27.123.22', 'Mobile WebView', '2026-05-22 16:38:16', 'success', NULL),
(593, 'customer', 6, '81.120.100.138', 'Edge on Windows', '2026-05-22 00:28:15', 'success', NULL),
(594, 'customer', 13, '236.28.198.139', 'Safari on iPad', '2026-05-22 08:07:28', 'success', NULL),
(595, 'customer', 6, '66.40.5.158', 'Chrome on Windows', '2026-05-22 08:28:37', 'success', NULL),
(596, 'staff', 7, '241.90.237.149', 'Chrome on Android', '2026-05-22 21:46:23', 'success', 'session_expired'),
(597, 'staff', 6, '84.153.255.51', 'Mobile WebView', '2026-05-22 09:16:34', 'failed', NULL),
(598, 'staff', 4, '37.18.231.81', 'Chrome on MacOS', '2026-05-22 09:59:53', 'success', NULL),
(599, 'staff', 7, '125.20.236.100', 'Chrome on Android', '2026-05-22 17:19:48', 'success', NULL),
(600, 'staff', 6, '81.145.226.187', 'Mobile WebView', '2026-05-22 18:45:25', 'failed', NULL),
(601, 'customer', 4, '74.197.251.153', 'Chrome on Windows', '2026-05-22 09:44:18', 'failed', NULL),
(602, 'staff', 14, '111.138.102.94', 'Firefox on Linux', '2026-05-22 02:16:21', 'success', NULL),
(603, 'staff', 13, '114.203.165.213', 'Chrome on Android', '2026-05-22 15:32:22', 'success', NULL),
(604, 'customer', 10, '7.39.173.238', 'Firefox on Linux', '2026-05-22 09:01:30', 'failed', NULL),
(605, 'staff', 13, '202.104.166.10', 'Chrome on Android', '2026-05-22 02:09:51', 'success', NULL),
(606, 'customer', 3, '216.190.47.173', 'Chrome on MacOS', '2026-05-22 03:08:35', 'success', NULL),
(607, 'customer', 12, '230.71.176.157', 'Mobile WebView', '2026-05-22 03:21:26', 'success', NULL),
(608, 'customer', 9, '16.147.178.193', 'Firefox on Linux', '2026-05-22 03:09:38', 'success', NULL),
(609, 'staff', 9, '186.215.8.158', 'Chrome on Windows', '2026-05-22 03:58:09', 'success', NULL),
(610, 'customer', 8, '38.62.195.24', 'Chrome on Android', '2026-05-22 13:27:21', 'success', 'account_locked'),
(611, 'staff', 7, '165.233.160.101', 'Chrome on Windows', '2026-05-22 06:40:37', 'success', NULL),
(612, 'customer', 7, '48.161.149.10', 'Safari on iPad', '2026-05-22 00:36:13', 'failed', NULL),
(613, 'customer', 12, '7.221.66.174', 'Firefox on Linux', '2026-05-22 03:19:49', 'success', NULL),
(614, 'customer', 8, '223.219.173.207', 'Chrome on Windows', '2026-05-22 16:08:08', 'success', NULL),
(615, 'customer', 2, '18.251.179.143', 'Firefox on Linux', '2026-05-22 19:23:02', 'failed', NULL),
(616, 'customer', 7, '79.38.206.149', 'Edge on Windows', '2026-05-22 18:47:01', 'success', NULL),
(617, 'staff', 9, '72.164.92.223', 'Safari on iPhone', '2026-05-22 20:14:13', 'success', NULL),
(645, 'customer', 11, '127.176.191.169', 'Chrome on Windows', '2024-07-27 17:38:50', 'success', NULL),
(646, 'staff', 3, '201.179.201.216', 'Chrome on MacOS', '2026-01-22 05:58:23', 'failed', 'invalid_password'),
(649, 'staff', 15, '160.170.47.232', 'Mobile WebView', '2024-01-22 07:54:57', 'failed', NULL),
(650, 'staff', 13, '160.17.48.187', 'Chrome on Windows', '2024-04-06 06:32:41', 'success', NULL),
(651, 'customer', 2, '13.16.35.126', 'Chrome on Windows', '2026-04-11 22:02:06', 'success', 'invalid_password'),
(652, 'staff', 2, '10.227.78.222', 'Safari on iPad', '2025-01-22 07:19:07', 'failed', 'user_not_found'),
(653, 'staff', 8, '50.164.137.191', 'Chrome on Windows', '2024-07-20 13:34:01', 'success', NULL),
(654, 'customer', 1, '23.116.245.109', 'Safari on iPhone', '2023-02-12 08:39:22', 'success', NULL),
(657, 'staff', 3, '121.75.216.91', 'Chrome on Android', '2023-06-16 20:42:27', 'failed', NULL),
(659, 'customer', 5, '185.71.231.175', 'Firefox on Linux', '2024-12-01 06:44:03', 'failed', 'user_not_found'),
(660, 'customer', 5, '154.128.108.156', 'Chrome on MacOS', '2023-06-21 05:14:40', 'success', NULL),
(661, 'staff', 2, '156.191.164.247', 'Mobile WebView', '2025-06-07 08:09:56', 'failed', NULL),
(662, 'customer', 3, '92.4.213.33', 'Chrome on Android', '2024-03-11 02:02:58', 'success', NULL),
(663, 'customer', 1, '183.214.186.36', 'Edge on Windows', '2023-05-23 23:31:12', 'success', NULL),
(664, 'customer', 7, '211.99.24.79', 'Safari on iPhone', '2024-07-15 03:16:05', 'success', NULL),
(666, 'customer', 1, '7.236.135.220', 'Firefox on Linux', '2023-05-04 05:18:35', 'failed', NULL),
(667, 'customer', 3, '8.165.30.164', 'Chrome on MacOS', '2024-09-08 11:58:55', 'success', NULL),
(668, 'customer', 8, '194.137.18.188', 'Safari on iPad', '2023-10-01 11:56:40', 'failed', NULL),
(669, 'staff', 6, '27.131.53.124', 'Chrome on MacOS', '2025-04-14 10:38:21', 'success', NULL),
(671, 'customer', 4, '64.31.191.97', 'Firefox on Linux', '2023-04-25 11:10:38', 'success', NULL),
(673, 'customer', 4, '22.187.95.167', 'Chrome on Android', '2026-04-15 15:22:58', 'success', NULL),
(674, 'customer', 3, '13.87.134.155', 'Safari on iPad', '2024-10-14 21:03:44', 'success', NULL),
(675, 'staff', 15, '68.157.43.253', 'Safari on iPad', '2024-02-16 01:23:13', 'success', NULL),
(676, 'staff', 10, '121.183.246.169', 'Safari on iPad', '2023-04-07 02:30:27', 'success', NULL),
(678, 'customer', 12, '110.18.221.30', 'Mobile WebView', '2025-04-14 21:49:10', 'failed', NULL),
(679, 'customer', 5, '33.8.182.122', 'Safari on iPhone', '2026-04-12 08:19:37', 'success', NULL),
(680, 'staff', 9, '45.73.210.66', 'Chrome on MacOS', '2024-03-09 01:05:25', 'success', NULL),
(681, 'staff', 7, '213.102.35.124', 'Chrome on Windows', '2025-06-10 00:22:41', 'success', NULL),
(682, 'customer', 8, '75.29.140.105', 'Safari on iPad', '2026-03-09 18:24:46', 'success', 'account_locked'),
(683, 'staff', 1, '193.4.122.87', 'Safari on iPhone', '2024-07-02 00:57:43', 'success', NULL),
(684, 'staff', 4, '119.229.226.185', 'Mobile WebView', '2025-11-01 14:45:06', 'failed', 'session_expired'),
(685, 'customer', 4, '143.206.26.22', 'Chrome on Windows', '2024-05-29 09:37:44', 'failed', NULL),
(686, 'staff', 5, '209.178.172.71', 'Safari on iPhone', '2023-01-05 21:55:22', 'success', NULL),
(687, 'customer', 3, '12.90.156.254', 'Chrome on Android', '2025-10-21 02:24:44', 'success', NULL),
(688, 'customer', 8, '119.20.200.174', 'Chrome on Windows', '2023-12-08 00:10:49', 'success', NULL),
(689, 'customer', 14, '102.152.158.78', 'Firefox on Linux', '2024-08-25 01:38:43', 'success', NULL),
(690, 'customer', 6, '118.136.19.196', 'Edge on Windows', '2026-02-02 00:32:06', 'success', 'invalid_password'),
(691, 'staff', 13, '87.90.151.228', 'Firefox on Linux', '2026-03-29 22:59:03', 'success', 'session_expired'),
(692, 'staff', 4, '41.64.183.209', 'Mobile WebView', '2024-04-02 16:53:41', 'success', NULL),
(694, 'staff', 9, '58.152.52.57', 'Edge on Windows', '2026-05-21 17:29:50', 'success', NULL),
(695, 'customer', 1, '182.226.250.63', 'Safari on iPhone', '2025-11-03 16:24:27', 'success', NULL),
(696, 'customer', 5, '73.171.93.207', 'Mobile WebView', '2024-07-17 00:57:00', 'success', NULL),
(697, 'customer', 1, '117.152.103.57', 'Mobile WebView', '2026-05-22 12:44:48', 'success', 'session_expired'),
(698, 'staff', 2, '102.227.20.181', 'Safari on iPhone', '2024-11-23 09:53:19', 'success', 'too_many_attempts'),
(699, 'customer', 5, '12.173.59.30', 'Mobile WebView', '2023-05-18 19:20:39', 'success', NULL),
(700, 'customer', 1, '207.95.23.82', 'Safari on iPhone', '2025-11-18 14:20:40', 'failed', NULL),
(701, 'customer', 1, '138.214.88.54', 'Chrome on Windows', '2024-09-05 01:44:49', 'success', NULL),
(702, 'customer', 12, '160.54.232.232', 'Chrome on MacOS', '2024-05-06 05:56:44', 'success', NULL),
(703, 'customer', 4, '212.246.248.248', 'Mobile WebView', '2025-12-15 21:49:10', 'success', 'session_expired'),
(704, 'customer', 4, '39.29.12.225', 'Safari on iPhone', '2025-11-16 18:43:19', 'success', NULL),
(706, 'staff', 8, '34.223.231.233', 'Chrome on MacOS', '2024-11-20 20:05:29', 'success', NULL),
(708, 'staff', 9, '15.135.113.160', 'Chrome on MacOS', '2023-08-05 07:49:47', 'success', 'account_locked'),
(710, 'staff', 6, '197.100.76.82', 'Firefox on Linux', '2025-04-30 18:55:29', 'success', NULL),
(713, 'customer', 11, '121.159.126.151', 'Safari on iPad', '2025-07-25 18:11:20', 'failed', NULL),
(715, 'customer', 6, '195.60.142.20', 'Firefox on Linux', '2024-03-23 09:57:30', 'success', NULL),
(716, 'customer', 1, '76.129.129.3', 'Edge on Windows', '2025-07-07 13:15:56', 'failed', NULL),
(717, 'customer', 2, '99.158.199.10', 'Chrome on MacOS', '2023-05-28 23:30:02', 'success', NULL),
(718, 'customer', 7, '131.144.14.151', 'Chrome on MacOS', '2023-07-16 07:57:20', 'success', NULL),
(719, 'customer', 9, '192.171.196.212', 'Chrome on MacOS', '2026-01-04 05:14:36', 'failed', NULL),
(720, 'customer', 8, '219.57.46.59', 'Edge on Windows', '2024-05-05 20:50:10', 'success', NULL),
(721, 'customer', 8, '168.55.209.112', 'Firefox on Linux', '2024-06-21 15:10:13', 'success', NULL),
(722, 'staff', 1, '34.169.217.71', 'Chrome on MacOS', '2024-02-22 23:05:49', 'failed', 'session_expired'),
(723, 'customer', 8, '173.110.211.215', 'Firefox on Linux', '2023-06-17 09:26:03', 'success', 'too_many_attempts'),
(725, 'customer', 15, '135.9.92.175', 'Safari on iPhone', '2025-10-08 09:58:37', 'success', NULL),
(726, 'staff', 12, '23.32.79.43', 'Mobile WebView', '2023-05-08 16:23:26', 'success', NULL),
(727, 'customer', 7, '50.190.16.19', 'Chrome on Android', '2025-08-09 17:44:47', 'success', NULL),
(728, 'customer', 12, '138.224.137.10', 'Edge on Windows', '2026-05-19 10:49:55', 'success', NULL),
(729, 'customer', 11, '186.2.139.177', 'Chrome on MacOS', '2023-05-21 23:26:00', 'success', NULL),
(730, 'customer', 6, '61.111.88.108', 'Chrome on Windows', '2023-08-18 12:43:51', 'success', NULL),
(731, 'customer', 7, '199.39.24.1', 'Firefox on Linux', '2025-08-03 01:09:11', 'success', NULL),
(732, 'staff', 3, '66.19.121.37', 'Safari on iPhone', '2023-03-25 09:31:10', 'failed', 'user_not_found'),
(733, 'staff', 8, '94.92.140.168', 'Firefox on Linux', '2023-11-16 04:21:11', 'success', NULL),
(735, 'customer', 11, '209.158.70.131', 'Firefox on Linux', '2023-08-26 14:19:40', 'success', NULL),
(736, 'staff', 7, '156.40.174.238', 'Edge on Windows', '2024-03-16 15:37:50', 'success', 'user_not_found'),
(737, 'customer', 1, '223.237.167.122', 'Safari on iPad', '2025-10-21 05:31:39', 'success', NULL),
(738, 'customer', 1, '167.163.241.206', 'Chrome on Android', '2025-06-08 10:16:11', 'success', NULL),
(740, 'customer', 9, '69.210.48.118', 'Firefox on Linux', '2024-05-06 10:54:32', 'success', 'user_not_found'),
(741, 'staff', 1, '56.226.174.191', 'Firefox on Linux', '2023-11-25 01:04:00', 'success', NULL),
(743, 'customer', 15, '74.172.97.223', 'Chrome on Android', '2025-02-05 22:33:14', 'success', NULL),
(744, 'customer', 6, '82.186.136.124', 'Chrome on MacOS', '2025-08-21 19:58:36', 'success', NULL),
(745, 'customer', 5, '102.82.59.48', 'Chrome on Android', '2025-07-25 11:48:14', 'success', NULL),
(746, 'customer', 3, '25.5.193.186', 'Safari on iPhone', '2025-08-20 04:37:01', 'failed', NULL),
(747, 'staff', 8, '12.128.88.55', 'Chrome on Windows', '2025-04-18 17:46:27', 'failed', NULL),
(748, 'customer', 13, '81.92.181.120', 'Chrome on Android', '2025-08-17 15:37:39', 'success', NULL),
(749, 'customer', 11, '84.202.213.201', 'Safari on iPad', '2026-03-25 17:47:43', 'success', NULL),
(750, 'customer', 5, '143.171.109.30', 'Safari on iPhone', '2023-10-28 02:20:05', 'failed', NULL),
(751, 'customer', 5, '66.159.61.79', 'Chrome on MacOS', '2023-12-17 16:52:35', 'success', 'user_not_found'),
(753, 'customer', 8, '112.138.49.88', 'Chrome on Android', '2025-10-12 00:57:26', 'success', NULL),
(755, 'customer', 13, '11.166.29.156', 'Firefox on Linux', '2026-01-02 14:33:37', 'success', NULL),
(757, 'customer', 4, '130.114.124.23', 'Mobile WebView', '2025-08-21 08:20:31', 'success', NULL),
(758, 'customer', 5, '22.164.237.180', 'Firefox on Linux', '2025-04-06 15:01:18', 'success', NULL),
(759, 'customer', 1, '8.40.174.239', 'Firefox on Linux', '2024-05-16 19:57:08', 'success', NULL),
(760, 'customer', 7, '218.146.239.245', 'Mobile WebView', '2023-05-17 11:38:39', 'success', NULL),
(761, 'staff', 8, '101.119.248.119', 'Safari on iPad', '2025-07-17 23:09:36', 'failed', NULL),
(762, 'customer', 11, '81.194.185.88', 'Edge on Windows', '2025-10-10 20:04:12', 'success', 'session_expired'),
(763, 'customer', 3, '32.235.47.41', 'Chrome on Android', '2025-11-16 21:10:51', 'success', NULL),
(764, 'customer', 2, '64.241.220.124', 'Chrome on MacOS', '2025-10-09 23:35:49', 'failed', NULL),
(765, 'customer', 5, '52.58.111.128', 'Chrome on Android', '2024-11-22 18:50:01', 'success', NULL),
(766, 'customer', 1, '52.15.149.190', 'Mobile WebView', '2025-05-19 01:59:34', 'success', 'session_expired'),
(767, 'customer', 1, '177.215.211.157', 'Edge on Windows', '2023-06-23 19:33:59', 'success', NULL),
(768, 'customer', 5, '167.187.108.233', 'Safari on iPhone', '2025-12-07 18:56:19', 'success', NULL),
(769, 'customer', 1, '144.28.154.178', 'Firefox on Linux', '2023-12-01 03:46:13', 'success', NULL),
(770, 'staff', 11, '113.88.52.253', 'Safari on iPhone', '2026-01-28 19:11:57', 'success', NULL),
(771, 'customer', 7, '105.217.214.165', 'Firefox on Linux', '2025-08-18 03:06:15', 'success', 'user_not_found'),
(772, 'customer', 14, '145.120.101.145', 'Firefox on Linux', '2025-03-31 20:24:49', 'success', NULL),
(773, 'staff', 6, '203.158.94.252', 'Chrome on MacOS', '2023-09-06 08:58:28', 'success', NULL),
(774, 'customer', 9, '51.129.217.187', 'Chrome on Windows', '2024-06-09 11:11:17', 'success', 'session_expired'),
(775, 'customer', 14, '48.113.142.117', 'Edge on Windows', '2025-11-27 18:36:50', 'success', NULL),
(776, 'staff', 2, '86.156.230.173', 'Firefox on Linux', '2024-05-31 17:44:46', 'success', 'user_not_found'),
(777, 'customer', 12, '199.42.34.43', 'Safari on iPad', '2025-11-27 07:09:15', 'success', NULL),
(778, 'customer', 7, '39.135.30.1', 'Firefox on Linux', '2024-04-01 13:41:01', 'failed', 'session_expired'),
(779, 'customer', 8, '75.190.185.96', 'Firefox on Linux', '2024-10-08 01:43:19', 'success', 'session_expired'),
(780, 'customer', 6, '46.211.133.30', 'Chrome on Windows', '2026-01-31 18:52:40', 'success', NULL),
(781, 'staff', 7, '84.138.148.67', 'Edge on Windows', '2023-06-29 20:48:36', 'failed', NULL),
(782, 'customer', 8, '117.25.234.74', 'Firefox on Linux', '2025-05-20 21:47:04', 'success', NULL),
(784, 'customer', 1, '163.137.126.219', 'Chrome on MacOS', '2024-10-16 19:59:00', 'failed', NULL),
(785, 'customer', 1, '46.211.129.13', 'Firefox on Linux', '2025-01-08 08:05:19', 'success', 'session_expired'),
(786, 'staff', 8, '59.112.100.162', 'Chrome on Windows', '2023-06-15 13:22:32', 'success', NULL),
(787, 'customer', 1, '214.199.6.195', 'Chrome on MacOS', '2025-01-03 05:41:14', 'success', NULL),
(788, 'customer', 6, '197.66.164.109', 'Chrome on Android', '2026-03-03 07:40:31', 'success', NULL),
(789, 'customer', 1, '189.254.111.47', 'Edge on Windows', '2024-12-11 14:45:47', 'success', NULL),
(790, 'customer', 6, '171.170.7.38', 'Firefox on Linux', '2026-02-28 00:24:03', 'success', NULL),
(792, 'staff', 5, '96.82.82.162', 'Chrome on Android', '2023-06-25 23:49:28', 'success', NULL),
(793, 'customer', 5, '113.156.136.212', 'Edge on Windows', '2024-03-15 19:52:09', 'success', NULL),
(794, 'staff', 1, '172.147.142.14', 'Edge on Windows', '2026-05-01 08:53:22', 'success', NULL),
(795, 'customer', 15, '82.255.229.122', 'Firefox on Linux', '2023-04-20 06:31:48', 'success', 'user_not_found'),
(796, 'staff', 5, '186.62.183.218', 'Chrome on Windows', '2023-03-04 20:23:46', 'success', NULL),
(797, 'staff', 7, '219.128.146.88', 'Chrome on Windows', '2023-01-18 00:49:25', 'success', NULL),
(798, 'customer', 14, '91.102.198.172', 'Chrome on Windows', '2023-11-01 21:43:45', 'failed', NULL),
(799, 'customer', 3, '92.241.123.145', 'Safari on iPad', '2024-03-04 06:28:12', 'success', NULL),
(800, 'customer', 9, '164.9.247.187', 'Chrome on MacOS', '2025-07-13 20:47:25', 'success', NULL),
(801, 'customer', 1, '86.215.12.179', 'Safari on iPhone', '2025-12-22 14:46:15', 'failed', NULL),
(802, 'customer', 11, '2.215.49.108', 'Edge on Windows', '2024-10-19 14:55:04', 'success', 'account_locked'),
(803, 'staff', 13, '163.22.62.244', 'Chrome on Windows', '2024-07-06 17:55:10', 'success', NULL),
(805, 'customer', 7, '77.32.153.158', 'Safari on iPhone', '2025-06-16 04:35:59', 'success', 'session_expired'),
(806, 'customer', 10, '77.209.14.209', 'Mobile WebView', '2023-09-15 02:33:54', 'success', NULL),
(807, 'customer', 6, '175.196.127.46', 'Safari on iPad', '2024-11-02 02:27:37', 'success', NULL),
(808, 'customer', 4, '94.197.150.161', 'Safari on iPad', '2023-03-21 02:30:21', 'success', NULL),
(809, 'customer', 4, '94.98.171.50', 'Mobile WebView', '2023-10-24 03:33:15', 'success', NULL),
(811, 'staff', 10, '17.144.150.63', 'Safari on iPad', '2025-06-14 15:44:27', 'success', NULL),
(812, 'staff', 11, '15.81.97.245', 'Firefox on Linux', '2024-06-06 20:27:07', 'success', NULL),
(813, 'customer', 7, '193.235.1.65', 'Safari on iPhone', '2025-04-19 01:43:06', 'success', 'user_not_found'),
(815, 'customer', 5, '207.185.215.11', 'Firefox on Linux', '2024-02-28 09:39:12', 'success', NULL),
(816, 'customer', 5, '172.10.223.64', 'Firefox on Linux', '2024-09-22 06:01:48', 'failed', NULL),
(817, 'customer', 1, '58.58.90.21', 'Safari on iPhone', '2024-12-21 10:18:33', 'success', NULL),
(818, 'customer', 2, '170.108.213.230', 'Chrome on Windows', '2024-04-01 13:18:31', 'failed', NULL),
(819, 'customer', 5, '84.7.1.239', 'Firefox on Linux', '2025-02-12 15:35:00', 'success', NULL),
(820, 'staff', 7, '123.130.230.250', 'Chrome on Android', '2023-02-08 13:13:50', 'success', NULL),
(821, 'customer', 5, '67.159.56.57', 'Safari on iPad', '2025-07-14 18:54:53', 'success', 'invalid_password'),
(822, 'customer', 4, '89.78.86.194', 'Chrome on MacOS', '2025-10-13 02:16:43', 'success', NULL),
(823, 'customer', 12, '172.121.15.219', 'Chrome on Windows', '2023-03-09 20:36:00', 'success', NULL),
(824, 'customer', 8, '37.237.38.241', 'Safari on iPhone', '2025-04-08 23:59:48', 'success', NULL),
(826, 'customer', 1, '16.86.117.73', 'Chrome on Windows', '2024-06-23 17:12:45', 'success', NULL),
(827, 'staff', 6, '136.232.183.219', 'Chrome on Android', '2023-05-22 02:01:19', 'success', NULL),
(828, 'customer', 3, '78.158.13.99', 'Chrome on MacOS', '2026-02-12 12:51:01', 'success', NULL),
(829, 'customer', 5, '127.37.4.163', 'Chrome on Android', '2026-04-18 16:19:53', 'failed', NULL),
(830, 'customer', 13, '39.112.168.251', 'Mobile WebView', '2025-12-23 21:49:02', 'success', 'account_locked'),
(831, 'customer', 2, '26.4.184.143', 'Firefox on Linux', '2025-01-13 15:13:41', 'success', NULL),
(832, 'customer', 11, '106.72.250.16', 'Safari on iPhone', '2025-06-05 23:10:31', 'success', NULL),
(833, 'customer', 4, '84.171.56.22', 'Chrome on MacOS', '2025-07-10 19:44:08', 'success', NULL),
(834, 'customer', 14, '222.92.208.252', 'Safari on iPad', '2024-11-21 21:47:58', 'success', 'invalid_password'),
(835, 'staff', 7, '96.235.79.202', 'Chrome on Windows', '2025-12-09 14:43:47', 'failed', NULL),
(836, 'staff', 14, '69.187.191.137', 'Safari on iPad', '2025-04-06 12:40:20', 'failed', NULL),
(837, 'staff', 13, '70.253.5.29', 'Edge on Windows', '2023-12-03 14:38:22', 'success', 'too_many_attempts'),
(838, 'staff', 1, '161.137.133.250', 'Safari on iPhone', '2026-02-06 20:22:49', 'failed', NULL),
(839, 'customer', 2, '154.12.40.165', 'Chrome on MacOS', '2026-05-18 23:01:44', 'success', NULL),
(840, 'customer', 11, '207.115.118.246', 'Safari on iPad', '2023-12-08 21:34:14', 'success', NULL),
(841, 'staff', 8, '8.53.237.7', 'Safari on iPhone', '2025-05-20 23:30:25', 'success', NULL),
(842, 'staff', 5, '76.47.230.244', 'Chrome on Windows', '2025-01-01 06:50:06', 'failed', NULL),
(844, 'customer', 6, '12.47.191.52', 'Chrome on MacOS', '2023-10-29 17:53:53', 'success', NULL),
(845, 'customer', 2, '27.62.219.143', 'Chrome on Android', '2024-11-12 15:30:13', 'failed', NULL),
(846, 'customer', 2, '211.126.161.170', 'Safari on iPad', '2023-10-31 17:11:58', 'failed', NULL),
(847, 'customer', 2, '123.18.177.66', 'Chrome on Android', '2024-02-20 18:52:50', 'success', NULL),
(848, 'staff', 6, '65.95.254.217', 'Safari on iPhone', '2026-04-02 05:59:28', 'failed', NULL),
(849, 'customer', 1, '97.30.73.21', 'Edge on Windows', '2024-11-29 18:15:21', 'success', NULL),
(851, 'staff', 3, '132.131.206.124', 'Chrome on Windows', '2025-05-11 22:11:35', 'failed', NULL),
(852, 'staff', 2, '209.45.17.206', 'Chrome on MacOS', '2025-11-22 03:15:14', 'success', NULL),
(854, 'customer', 5, '24.140.109.126', 'Chrome on Android', '2024-10-03 15:29:04', 'failed', NULL),
(855, 'customer', 9, '187.109.158.208', 'Chrome on Android', '2025-06-19 10:46:34', 'success', NULL),
(856, 'staff', 6, '203.82.227.120', 'Firefox on Linux', '2023-02-24 02:52:08', 'success', NULL),
(857, 'staff', 6, '62.63.102.68', 'Chrome on Windows', '2026-02-27 14:29:37', 'success', NULL),
(858, 'customer', 2, '85.132.112.165', 'Mobile WebView', '2025-05-17 06:09:48', 'success', NULL),
(859, 'customer', 12, '194.11.152.216', 'Safari on iPad', '2025-08-25 23:57:02', 'success', NULL),
(860, 'customer', 5, '146.83.167.78', 'Edge on Windows', '2026-05-11 13:15:08', 'success', NULL),
(861, 'customer', 3, '129.84.234.151', 'Chrome on Android', '2023-12-12 13:56:18', 'success', NULL),
(862, 'customer', 12, '134.174.155.252', 'Chrome on Windows', '2025-07-18 19:44:10', 'success', NULL),
(863, 'customer', 5, '181.98.127.82', 'Chrome on Windows', '2025-06-26 18:13:57', 'failed', NULL),
(864, 'customer', 4, '106.191.79.75', 'Edge on Windows', '2026-04-21 12:16:57', 'success', 'invalid_password'),
(865, 'staff', 7, '157.31.124.17', 'Chrome on MacOS', '2023-08-09 03:35:24', 'success', NULL),
(866, 'customer', 12, '130.148.38.3', 'Edge on Windows', '2023-01-31 06:33:15', 'success', NULL),
(867, 'customer', 10, '40.1.122.96', 'Safari on iPad', '2023-05-11 02:56:33', 'success', NULL),
(868, 'staff', 11, '193.39.42.95', 'Safari on iPhone', '2025-09-06 06:54:14', 'success', NULL),
(869, 'customer', 12, '171.124.34.52', 'Edge on Windows', '2024-11-11 11:45:06', 'success', NULL),
(870, 'staff', 10, '222.27.137.94', 'Chrome on Android', '2023-05-03 16:57:20', 'success', NULL),
(871, 'customer', 2, '58.140.249.57', 'Chrome on Android', '2024-02-14 20:03:13', 'success', NULL),
(872, 'staff', 2, '116.39.52.140', 'Chrome on Android', '2023-02-06 17:26:28', 'success', NULL),
(873, 'customer', 2, '87.159.243.228', 'Edge on Windows', '2024-06-30 00:54:18', 'success', NULL),
(874, 'staff', 2, '149.191.187.109', 'Mobile WebView', '2024-05-23 23:16:08', 'failed', NULL),
(875, 'customer', 12, '43.164.165.75', 'Edge on Windows', '2026-03-04 08:43:47', 'success', NULL),
(876, 'customer', 8, '121.75.213.77', 'Mobile WebView', '2023-04-06 08:24:25', 'success', NULL),
(877, 'staff', 2, '177.157.179.165', 'Chrome on Android', '2025-12-15 06:58:10', 'success', NULL),
(878, 'staff', 14, '80.18.72.51', 'Chrome on Android', '2023-07-08 05:04:56', 'success', NULL),
(880, 'staff', 1, '220.209.34.55', 'Firefox on Linux', '2025-10-26 12:27:41', 'success', 'too_many_attempts'),
(881, 'customer', 14, '100.119.250.130', 'Edge on Windows', '2024-11-12 12:56:41', 'success', 'account_pending'),
(882, 'customer', 1, '154.111.28.60', 'Chrome on MacOS', '2025-03-16 04:53:33', 'success', NULL),
(883, 'staff', 4, '86.70.56.70', 'Firefox on Linux', '2025-11-09 10:57:13', 'success', NULL),
(884, 'customer', 8, '197.178.213.19', 'Chrome on MacOS', '2023-05-27 21:56:26', 'success', NULL),
(885, 'customer', 8, '174.107.196.148', 'Edge on Windows', '2023-11-13 07:30:51', 'failed', NULL),
(886, 'customer', 14, '155.211.12.194', 'Firefox on Linux', '2023-02-04 03:16:31', 'success', NULL),
(887, 'customer', 2, '71.72.115.104', 'Firefox on Linux', '2023-12-02 01:53:11', 'success', NULL),
(888, 'customer', 4, '37.53.140.29', 'Mobile WebView', '2024-02-28 16:08:58', 'success', NULL),
(889, 'staff', 5, '5.32.146.124', 'Firefox on Linux', '2023-04-13 05:43:47', 'failed', NULL),
(891, 'customer', 11, '88.226.62.143', 'Chrome on Windows', '2025-07-26 00:31:16', 'success', 'too_many_attempts'),
(894, 'customer', 12, '63.19.132.95', 'Safari on iPhone', '2024-06-29 23:27:27', 'success', 'account_locked'),
(895, 'customer', 11, '29.119.244.94', 'Mobile WebView', '2026-02-23 00:03:40', 'success', NULL),
(896, 'customer', 7, '37.141.69.175', 'Edge on Windows', '2023-01-08 04:38:46', 'failed', NULL),
(897, 'customer', 5, '93.51.190.29', 'Safari on iPhone', '2024-06-09 18:43:52', 'failed', NULL),
(898, 'customer', 15, '10.65.36.238', 'Chrome on Android', '2024-10-11 11:30:30', 'success', 'account_locked'),
(899, 'customer', 12, '135.204.50.147', 'Safari on iPhone', '2025-11-24 18:08:32', 'success', NULL),
(901, 'staff', 4, '91.94.159.254', 'Chrome on Windows', '2025-06-12 16:50:12', 'success', NULL),
(902, 'customer', 7, '179.197.112.225', 'Chrome on Windows', '2026-03-16 17:51:55', 'success', NULL),
(903, 'staff', 1, '181.194.94.141', 'Firefox on Linux', '2025-07-09 04:23:16', 'success', NULL),
(904, 'staff', 4, '196.170.177.122', 'Safari on iPhone', '2023-06-08 14:49:22', 'success', 'session_expired'),
(905, 'customer', 9, '134.101.45.177', 'Mobile WebView', '2025-05-20 04:13:59', 'success', 'account_pending'),
(906, 'customer', 4, '135.62.100.59', 'Mobile WebView', '2023-09-03 22:19:45', 'success', 'account_locked'),
(908, 'customer', 9, '91.108.226.40', 'Chrome on Android', '2023-08-25 10:25:08', 'success', NULL),
(909, 'customer', 5, '53.86.249.222', 'Safari on iPad', '2024-12-02 03:38:22', 'success', NULL),
(911, 'staff', 14, '70.240.194.250', 'Edge on Windows', '2023-06-15 17:47:14', 'success', NULL),
(912, 'staff', 2, '165.2.210.24', 'Mobile WebView', '2025-09-06 09:20:32', 'failed', NULL),
(913, 'customer', 5, '182.140.74.204', 'Chrome on Windows', '2023-11-17 17:32:55', 'failed', NULL),
(914, 'staff', 14, '158.225.72.193', 'Mobile WebView', '2024-08-10 05:07:37', 'failed', NULL),
(917, 'customer', 10, '96.85.93.211', 'Chrome on Windows', '2025-09-28 08:00:46', 'success', NULL),
(918, 'customer', 3, '90.149.180.199', 'Chrome on MacOS', '2025-05-09 14:05:18', 'success', NULL),
(919, 'staff', 9, '4.108.14.1', 'Chrome on MacOS', '2024-02-03 19:04:37', 'success', NULL),
(920, 'customer', 7, '196.41.40.77', 'Chrome on Windows', '2024-03-02 08:15:10', 'failed', NULL),
(921, 'customer', 13, '12.177.81.126', 'Edge on Windows', '2023-06-22 00:48:06', 'failed', 'account_pending'),
(922, 'staff', 8, '47.89.26.118', 'Chrome on Windows', '2025-08-21 06:30:52', 'success', NULL),
(925, 'staff', 2, '181.130.26.252', 'Firefox on Linux', '2023-09-24 00:37:57', 'success', 'account_pending'),
(926, 'staff', 2, '190.153.112.100', 'Firefox on Linux', '2023-04-03 08:58:17', 'success', NULL),
(927, 'customer', 4, '146.218.77.240', 'Chrome on MacOS', '2023-08-04 08:40:05', 'success', NULL),
(928, 'customer', 11, '86.220.38.42', 'Safari on iPhone', '2024-05-07 14:11:33', 'failed', 'user_not_found'),
(929, 'staff', 11, '185.10.179.100', 'Chrome on MacOS', '2023-05-18 21:55:06', 'success', NULL),
(930, 'customer', 6, '45.207.115.208', 'Firefox on Linux', '2023-08-08 14:22:55', 'success', 'invalid_password'),
(931, 'customer', 10, '84.235.124.171', 'Mobile WebView', '2024-08-13 09:02:09', 'success', NULL),
(932, 'customer', 6, '184.58.168.157', 'Chrome on Windows', '2025-06-01 18:10:27', 'failed', NULL),
(933, 'customer', 14, '94.82.86.182', 'Edge on Windows', '2025-09-26 17:27:19', 'success', NULL),
(934, 'staff', 3, '126.104.84.110', 'Chrome on Android', '2025-03-14 05:54:46', 'success', NULL),
(935, 'customer', 2, '37.87.55.12', 'Edge on Windows', '2026-02-17 03:58:45', 'success', 'invalid_password'),
(937, 'customer', 9, '90.55.218.163', 'Edge on Windows', '2023-10-11 02:36:35', 'failed', NULL),
(938, 'customer', 14, '57.144.14.149', 'Chrome on MacOS', '2023-03-01 22:14:53', 'success', NULL),
(939, 'customer', 12, '45.156.117.116', 'Mobile WebView', '2023-06-02 20:17:28', 'failed', NULL),
(940, 'customer', 4, '135.144.3.90', 'Firefox on Linux', '2025-06-04 20:02:28', 'success', NULL),
(942, 'staff', 1, '170.192.121.29', 'Chrome on Android', '2024-04-27 06:08:07', 'success', NULL),
(943, 'customer', 7, '34.100.125.70', 'Mobile WebView', '2025-08-20 14:42:17', 'success', NULL),
(944, 'customer', 6, '184.252.117.82', 'Chrome on Android', '2023-09-20 05:13:09', 'success', NULL),
(945, 'staff', 2, '140.176.142.180', 'Chrome on MacOS', '2023-11-25 12:28:14', 'failed', NULL),
(947, 'customer', 10, '202.136.243.39', 'Mobile WebView', '2023-02-23 11:51:48', 'success', NULL),
(949, 'customer', 6, '125.143.31.235', 'Chrome on Android', '2024-10-28 13:15:35', 'success', NULL),
(950, 'customer', 3, '186.75.245.235', 'Firefox on Linux', '2026-04-15 23:08:21', 'success', 'account_pending'),
(951, 'customer', 5, '154.123.85.56', 'Chrome on Windows', '2026-04-29 20:50:52', 'failed', NULL),
(952, 'customer', 15, '89.13.17.42', 'Firefox on Linux', '2025-09-04 10:49:30', 'success', 'session_expired'),
(954, 'staff', 15, '181.17.231.85', 'Mobile WebView', '2025-11-05 17:38:25', 'success', NULL),
(955, 'staff', 2, '155.230.111.117', 'Mobile WebView', '2025-05-18 23:49:01', 'success', 'invalid_password'),
(956, 'customer', 2, '60.207.65.212', 'Safari on iPad', '2024-12-05 05:29:43', 'success', NULL),
(957, 'staff', 13, '197.226.198.56', 'Chrome on MacOS', '2023-11-07 17:47:17', 'success', NULL),
(958, 'customer', 7, '147.251.237.176', 'Firefox on Linux', '2024-02-09 09:04:41', 'success', NULL),
(959, 'customer', 6, '37.213.171.214', 'Chrome on Android', '2024-10-10 15:27:28', 'failed', NULL),
(961, 'customer', 12, '179.167.219.83', 'Chrome on Windows', '2024-02-14 06:02:44', 'success', NULL),
(962, 'customer', 6, '82.199.202.158', 'Firefox on Linux', '2025-12-29 14:00:37', 'success', NULL),
(963, 'customer', 6, '219.202.4.180', 'Safari on iPad', '2024-01-12 20:48:11', 'success', NULL),
(964, 'customer', 8, '68.238.190.234', 'Safari on iPhone', '2023-02-11 01:49:02', 'success', NULL),
(965, 'customer', 6, '99.71.16.119', 'Chrome on Android', '2024-05-12 06:16:34', 'success', NULL),
(966, 'customer', 3, '200.142.22.194', 'Edge on Windows', '2024-09-06 11:42:47', 'success', NULL),
(967, 'customer', 7, '70.55.37.19', 'Mobile WebView', '2024-09-23 08:56:46', 'success', NULL),
(968, 'staff', 12, '204.79.204.19', 'Mobile WebView', '2025-07-22 06:45:01', 'success', NULL),
(969, 'customer', 1, '94.187.106.221', 'Chrome on Windows', '2026-05-21 23:15:56', 'success', NULL),
(970, 'customer', 13, '177.141.96.57', 'Mobile WebView', '2024-01-04 07:32:23', 'failed', NULL),
(971, 'customer', 14, '21.188.101.199', 'Firefox on Linux', '2023-08-16 16:27:04', 'failed', NULL),
(972, 'staff', 10, '209.216.108.147', 'Edge on Windows', '2024-05-13 20:45:51', 'success', 'session_expired'),
(974, 'customer', 7, '129.66.143.7', 'Safari on iPad', '2023-09-30 13:47:54', 'success', 'account_locked'),
(975, 'staff', 8, '66.195.241.108', 'Safari on iPhone', '2023-08-06 21:30:07', 'success', NULL),
(976, 'customer', 8, '1.22.107.213', 'Mobile WebView', '2023-02-03 09:40:53', 'failed', NULL),
(977, 'staff', 2, '221.160.42.240', 'Chrome on Android', '2023-11-24 11:52:42', 'failed', NULL),
(978, 'customer', 12, '87.165.17.100', 'Firefox on Linux', '2025-04-28 15:47:02', 'success', NULL),
(981, 'customer', 4, '16.162.244.225', 'Edge on Windows', '2023-01-05 10:21:25', 'success', NULL),
(982, 'staff', 12, '185.233.23.179', 'Chrome on Android', '2023-04-07 15:10:46', 'failed', 'too_many_attempts'),
(983, 'staff', 2, '10.188.138.127', 'Chrome on MacOS', '2026-05-07 14:08:13', 'success', NULL),
(985, 'staff', 9, '76.7.30.128', 'Chrome on Android', '2024-02-29 23:25:59', 'success', NULL),
(986, 'customer', 10, '190.76.239.199', 'Chrome on Windows', '2023-06-29 08:07:23', 'success', NULL),
(988, 'staff', 13, '72.19.101.195', 'Firefox on Linux', '2026-05-11 07:46:54', 'success', NULL),
(989, 'customer', 15, '69.146.236.233', 'Chrome on MacOS', '2023-10-23 15:33:04', 'success', NULL),
(991, 'customer', 10, '5.52.243.39', 'Mobile WebView', '2023-03-13 13:02:00', 'success', NULL),
(992, 'customer', 12, '89.162.247.241', 'Chrome on MacOS', '2023-11-28 16:51:02', 'failed', NULL),
(994, 'staff', 1, '126.160.112.78', 'Chrome on Android', '2023-06-11 22:37:45', 'success', NULL),
(995, 'customer', 11, '62.59.79.220', 'Safari on iPad', '2024-03-20 09:22:47', 'success', NULL),
(996, 'customer', 15, '213.200.10.218', 'Chrome on Android', '2023-09-15 10:36:57', 'success', NULL),
(997, 'customer', 12, '52.198.48.155', 'Safari on iPad', '2025-04-06 09:31:47', 'success', NULL),
(998, 'customer', 3, '163.29.99.149', 'Chrome on MacOS', '2023-02-26 22:09:58', 'success', NULL),
(999, 'customer', 12, '200.39.19.231', 'Safari on iPhone', '2026-03-24 02:58:58', 'success', NULL),
(1000, 'customer', 5, '125.237.244.255', 'Chrome on Android', '2025-07-23 19:37:09', 'success', NULL),
(1001, 'customer', 4, '49.224.187.6', 'Mobile WebView', '2025-03-02 22:42:32', 'success', NULL),
(1002, 'customer', 15, '95.67.8.91', 'Firefox on Linux', '2024-09-10 00:31:19', 'failed', NULL),
(1003, 'customer', 11, '170.200.159.194', 'Mobile WebView', '2024-06-23 01:27:06', 'success', NULL),
(1004, 'customer', 8, '181.159.174.137', 'Firefox on Linux', '2025-04-24 23:33:30', 'success', 'invalid_password'),
(1005, 'customer', 10, '56.72.168.113', 'Chrome on Android', '2026-05-12 12:09:59', 'success', NULL),
(1006, 'customer', 8, '88.121.48.131', 'Chrome on Windows', '2024-12-02 09:22:47', 'success', NULL),
(1007, 'customer', 5, '180.104.159.225', 'Edge on Windows', '2023-02-05 12:36:14', 'success', NULL),
(1008, 'customer', 5, '35.22.246.141', 'Chrome on MacOS', '2025-09-22 19:26:27', 'success', NULL),
(1009, 'staff', 1, '58.46.28.2', 'Firefox on Linux', '2025-02-14 12:36:33', 'success', NULL),
(1010, 'staff', 1, '104.82.51.7', 'Edge on Windows', '2025-07-21 13:29:51', 'failed', NULL),
(1011, 'customer', 4, '20.194.135.93', 'Chrome on Android', '2023-05-30 19:03:59', 'success', 'too_many_attempts'),
(1012, 'staff', 7, '138.149.16.143', 'Edge on Windows', '2024-07-14 01:58:54', 'success', NULL),
(1013, 'customer', 5, '60.133.208.128', 'Chrome on Windows', '2026-03-18 20:02:23', 'success', NULL),
(1014, 'customer', 15, '3.54.6.122', 'Safari on iPhone', '2023-09-28 22:54:51', 'success', NULL),
(1015, 'customer', 2, '211.7.76.103', 'Chrome on Android', '2024-10-09 19:47:42', 'success', NULL),
(1016, 'customer', 4, '102.232.43.30', 'Chrome on Windows', '2023-03-09 23:50:44', 'failed', NULL),
(1017, 'customer', 5, '137.51.42.55', 'Edge on Windows', '2023-12-20 11:37:42', 'success', NULL),
(1019, 'customer', 7, '158.66.42.13', 'Chrome on MacOS', '2025-06-28 20:28:01', 'success', NULL),
(1020, 'staff', 4, '146.141.206.95', 'Safari on iPad', '2023-04-04 00:21:50', 'failed', NULL),
(1023, 'customer', 9, '196.155.102.45', 'Firefox on Linux', '2026-05-15 04:43:59', 'success', NULL),
(1024, 'customer', 15, '112.143.78.216', 'Safari on iPhone', '2023-03-20 07:27:33', 'success', NULL),
(1025, 'staff', 4, '98.238.90.245', 'Firefox on Linux', '2026-05-10 23:11:42', 'success', NULL),
(1026, 'customer', 1, '27.107.188.106', 'Chrome on MacOS', '2023-03-29 17:20:52', 'success', NULL),
(1027, 'customer', 6, '90.224.44.58', 'Edge on Windows', '2024-08-01 03:20:28', 'success', NULL),
(1028, 'customer', 13, '2.159.23.146', 'Edge on Windows', '2023-12-17 10:18:50', 'success', 'user_not_found'),
(1029, 'customer', 5, '170.71.27.176', 'Chrome on Android', '2025-04-20 11:50:57', 'success', NULL),
(1030, 'staff', 6, '205.110.100.169', 'Chrome on Android', '2025-09-27 00:39:06', 'success', NULL),
(1031, 'customer', 1, '155.97.208.236', 'Chrome on Android', '2023-07-15 03:04:12', 'success', 'account_locked'),
(1032, 'customer', 14, '148.138.180.232', 'Safari on iPad', '2024-06-23 14:18:04', 'failed', NULL),
(1033, 'customer', 3, '180.123.254.137', 'Firefox on Linux', '2026-05-06 02:50:52', 'success', NULL),
(1034, 'customer', 3, '157.246.184.180', 'Safari on iPhone', '2025-09-10 07:11:43', 'success', NULL),
(1036, 'customer', 10, '44.26.234.69', 'Edge on Windows', '2023-10-31 05:33:50', 'success', 'account_locked'),
(1037, 'customer', 12, '167.132.87.40', 'Firefox on Linux', '2024-02-02 02:53:27', 'success', NULL),
(1038, 'customer', 3, '57.89.248.210', 'Chrome on Android', '2024-11-13 18:47:01', 'success', NULL),
(1039, 'customer', 4, '28.34.73.10', 'Safari on iPhone', '2024-12-19 11:59:41', 'success', NULL),
(1041, 'customer', 5, '115.178.241.161', 'Safari on iPhone', '2025-11-11 14:45:03', 'failed', NULL),
(1043, 'customer', 3, '79.65.57.88', 'Chrome on Windows', '2023-11-19 22:53:51', 'success', NULL),
(1044, 'customer', 7, '17.35.117.225', 'Chrome on Windows', '2025-01-15 11:04:06', 'success', NULL),
(1045, 'customer', 6, '83.194.177.47', 'Chrome on MacOS', '2025-08-19 18:24:04', 'failed', 'account_pending'),
(1046, 'staff', 12, '23.36.99.134', 'Safari on iPad', '2025-08-16 22:48:29', 'success', NULL),
(1047, 'staff', 14, '178.82.56.35', 'Chrome on Windows', '2025-08-16 05:58:37', 'success', NULL),
(1048, 'customer', 6, '200.88.10.39', 'Firefox on Linux', '2026-02-04 22:26:08', 'success', 'too_many_attempts'),
(1049, 'staff', 4, '159.220.45.74', 'Mobile WebView', '2025-12-28 23:18:30', 'success', NULL),
(1050, 'staff', 1, '75.152.248.19', 'Safari on iPad', '2023-03-30 22:23:45', 'success', NULL),
(1051, 'customer', 4, '209.230.180.207', 'Mobile WebView', '2024-03-03 15:05:30', 'success', NULL),
(1052, 'customer', 5, '102.165.217.79', 'Mobile WebView', '2023-02-09 04:01:51', 'success', NULL),
(1053, 'customer', 3, '101.122.6.175', 'Safari on iPhone', '2025-12-31 15:59:34', 'success', NULL),
(1056, 'staff', 3, '164.24.68.10', 'Safari on iPad', '2026-05-09 00:37:23', 'success', 'invalid_password'),
(1057, 'customer', 12, '94.194.138.109', 'Safari on iPad', '2023-11-02 13:21:26', 'success', NULL),
(1059, 'customer', 9, '183.98.114.23', 'Chrome on Windows', '2023-12-29 22:25:34', 'failed', 'account_pending'),
(1062, 'customer', 3, '49.161.126.147', 'Safari on iPad', '2024-01-14 02:31:59', 'success', NULL),
(1063, 'staff', 1, '44.199.81.61', 'Chrome on Android', '2025-01-22 20:07:46', 'success', NULL),
(1064, 'customer', 10, '171.244.123.138', 'Safari on iPhone', '2025-07-26 10:56:23', 'success', NULL),
(1065, 'staff', 3, '174.86.86.172', 'Safari on iPhone', '2026-01-05 16:57:44', 'success', NULL),
(1067, 'customer', 1, '21.85.95.222', 'Chrome on Android', '2025-01-19 21:31:40', 'failed', NULL),
(1068, 'customer', 13, '91.145.159.103', 'Chrome on Android', '2025-02-02 04:15:17', 'success', NULL),
(1070, 'customer', 8, '118.14.174.63', 'Chrome on Android', '2023-09-16 08:08:21', 'success', 'session_expired'),
(1071, 'customer', 15, '202.168.146.224', 'Firefox on Linux', '2026-01-01 17:27:18', 'success', NULL),
(1072, 'customer', 3, '208.21.156.208', 'Chrome on Android', '2025-10-31 20:33:17', 'success', NULL),
(1073, 'customer', 9, '21.190.111.239', 'Safari on iPhone', '2023-04-11 05:17:15', 'failed', 'account_pending'),
(1074, 'customer', 8, '68.254.16.81', 'Safari on iPad', '2023-04-13 03:17:56', 'success', 'account_pending'),
(1075, 'customer', 11, '53.8.111.20', 'Chrome on Windows', '2023-10-18 17:42:54', 'success', NULL),
(1076, 'staff', 14, '21.177.44.201', 'Safari on iPad', '2025-12-20 10:52:09', 'success', 'user_not_found'),
(1077, 'customer', 1, '102.25.32.82', 'Chrome on Android', '2023-10-12 06:49:31', 'failed', NULL),
(1078, 'customer', 2, '67.64.93.14', 'Chrome on Android', '2026-01-29 07:01:05', 'success', 'user_not_found'),
(1081, 'customer', 2, '183.184.36.137', 'Safari on iPhone', '2025-10-11 16:37:42', 'success', 'user_not_found'),
(1082, 'customer', 7, '144.3.28.132', 'Safari on iPhone', '2025-12-17 22:17:22', 'success', NULL),
(1083, 'customer', 6, '64.81.182.159', 'Mobile WebView', '2023-01-18 03:09:30', 'success', NULL),
(1084, 'staff', 13, '196.247.50.21', 'Chrome on MacOS', '2026-03-30 15:05:18', 'success', NULL),
(1085, 'customer', 7, '146.178.136.145', 'Chrome on Android', '2024-11-22 15:58:44', 'failed', NULL),
(1086, 'staff', 8, '165.29.90.105', 'Chrome on Windows', '2026-03-17 23:47:17', 'success', NULL),
(1087, 'customer', 11, '120.146.64.139', 'Mobile WebView', '2023-10-04 01:19:31', 'success', NULL),
(1088, 'staff', 13, '62.234.190.250', 'Firefox on Linux', '2024-04-26 16:34:59', 'success', NULL),
(1089, 'staff', 7, '9.181.106.243', 'Edge on Windows', '2025-12-23 03:53:23', 'success', NULL),
(1090, 'customer', 6, '196.54.111.134', 'Safari on iPhone', '2023-03-27 07:33:23', 'success', NULL),
(1091, 'customer', 1, '221.236.163.107', 'Chrome on Android', '2025-08-04 16:46:50', 'success', NULL),
(1092, 'customer', 5, '192.81.2.22', 'Safari on iPad', '2025-12-26 12:51:22', 'success', NULL),
(1093, 'customer', 8, '182.128.18.212', 'Mobile WebView', '2023-11-17 06:35:56', 'success', NULL),
(1094, 'customer', 6, '106.116.213.209', 'Edge on Windows', '2024-12-05 15:37:52', 'failed', NULL),
(1095, 'customer', 7, '212.44.2.135', 'Edge on Windows', '2025-01-26 17:29:31', 'success', NULL),
(1096, 'customer', 14, '67.202.16.239', 'Safari on iPad', '2025-06-20 15:14:30', 'success', NULL),
(1097, 'customer', 3, '13.98.189.141', 'Edge on Windows', '2023-04-10 16:56:07', 'success', NULL),
(1099, 'customer', 6, '161.174.62.43', 'Chrome on Windows', '2023-03-08 21:37:53', 'success', NULL),
(1101, 'staff', 12, '193.248.70.113', 'Safari on iPad', '2025-08-28 03:04:18', 'success', 'account_locked'),
(1102, 'staff', 3, '221.17.91.148', 'Chrome on MacOS', '2024-09-04 14:29:03', 'success', 'session_expired'),
(1104, 'staff', 6, '158.111.10.230', 'Safari on iPad', '2023-11-03 21:41:00', 'failed', NULL),
(1105, 'staff', 6, '77.150.232.199', 'Chrome on Android', '2025-01-01 00:07:22', 'success', NULL),
(1108, 'staff', 15, '112.131.15.191', 'Edge on Windows', '2025-05-13 06:09:28', 'success', NULL),
(1109, 'customer', 3, '101.200.144.118', 'Edge on Windows', '2025-12-07 19:08:05', 'success', NULL),
(1110, 'customer', 7, '43.138.32.1', 'Firefox on Linux', '2023-10-07 00:55:32', 'success', 'invalid_password'),
(1111, 'customer', 14, '121.250.71.112', 'Safari on iPhone', '2024-12-04 08:03:17', 'success', NULL),
(1112, 'customer', 1, '210.101.39.144', 'Safari on iPhone', '2023-09-02 17:17:17', 'success', NULL),
(1113, 'customer', 6, '118.144.60.123', 'Firefox on Linux', '2023-02-17 01:55:38', 'success', NULL),
(1114, 'customer', 7, '100.236.72.160', 'Safari on iPhone', '2025-03-28 22:33:55', 'success', NULL),
(1116, 'customer', 6, '168.189.114.2', 'Firefox on Linux', '2024-10-05 03:10:22', 'success', NULL),
(1117, 'customer', 8, '94.147.156.84', 'Chrome on MacOS', '2023-05-22 00:48:25', 'failed', NULL),
(1118, 'staff', 6, '77.161.32.185', 'Chrome on Android', '2023-04-13 14:32:35', 'failed', NULL),
(1119, 'staff', 6, '163.144.161.118', 'Safari on iPad', '2025-08-25 02:08:27', 'success', NULL),
(1120, 'staff', 1, '64.70.128.175', 'Mobile WebView', '2025-05-16 04:14:26', 'success', 'session_expired'),
(1121, 'customer', 2, '11.132.112.164', 'Mobile WebView', '2025-03-31 02:48:44', 'failed', NULL),
(1122, 'customer', 7, '146.215.65.190', 'Mobile WebView', '2025-04-28 00:25:02', 'success', NULL),
(1123, 'customer', 5, '49.47.68.198', 'Chrome on Windows', '2023-05-02 04:06:21', 'success', NULL),
(1124, 'staff', 11, '178.253.141.201', 'Safari on iPhone', '2023-03-20 10:03:39', 'failed', NULL),
(1125, 'customer', 1, '117.151.98.38', 'Edge on Windows', '2024-10-19 12:28:43', 'success', NULL),
(1126, 'customer', 7, '50.222.175.209', 'Chrome on Windows', '2025-09-14 07:22:46', 'success', NULL),
(1127, 'customer', 8, '35.206.145.108', 'Safari on iPad', '2025-12-27 12:44:23', 'success', NULL),
(1128, 'customer', 14, '97.113.232.57', 'Safari on iPad', '2023-12-15 01:14:57', 'success', NULL),
(1129, 'customer', 12, '202.79.211.53', 'Edge on Windows', '2023-09-10 04:31:02', 'success', NULL),
(1130, 'customer', 12, '213.123.137.60', 'Edge on Windows', '2023-06-16 21:08:15', 'success', NULL),
(1131, 'customer', 4, '4.165.47.249', 'Safari on iPhone', '2025-09-13 10:08:21', 'success', NULL),
(1132, 'customer', 2, '55.213.111.170', 'Chrome on Windows', '2023-08-06 15:43:33', 'failed', NULL);
INSERT INTO `login_logs` (`id`, `user_type`, `user_id`, `ip_address`, `user_agent`, `login_at`, `status`, `fail_reason`) VALUES
(1133, 'customer', 10, '110.127.4.149', 'Chrome on MacOS', '2025-06-25 11:35:21', 'success', NULL),
(1134, 'staff', 10, '207.169.133.156', 'Safari on iPad', '2025-07-13 16:32:54', 'success', NULL),
(1135, 'staff', 9, '77.238.157.74', 'Edge on Windows', '2023-07-25 21:32:55', 'success', NULL),
(1136, 'customer', 8, '28.44.123.227', 'Chrome on Windows', '2024-05-11 16:42:58', 'success', NULL),
(1137, 'staff', 7, '187.227.238.252', 'Chrome on Android', '2026-02-24 11:45:47', 'success', 'session_expired'),
(1138, 'staff', 13, '194.202.90.99', 'Chrome on MacOS', '2023-10-10 08:37:59', 'success', NULL),
(1139, 'customer', 4, '112.35.45.118', 'Chrome on MacOS', '2025-04-17 11:48:17', 'success', NULL),
(1140, 'staff', 12, '207.66.129.193', 'Safari on iPhone', '2023-02-07 08:31:25', 'success', NULL),
(1141, 'customer', 4, '115.54.132.243', 'Chrome on Android', '2023-07-27 02:47:17', 'success', NULL),
(1142, 'customer', 3, '151.233.140.253', 'Safari on iPhone', '2025-04-11 22:13:24', 'failed', 'account_pending'),
(1143, 'customer', 14, '100.122.13.206', 'Mobile WebView', '2023-03-04 12:52:01', 'success', NULL),
(1145, 'staff', 1, '::1', 'Edge on Windows', '2026-06-02 13:28:04', 'failed', 'invalid_password'),
(1146, 'staff', 1, '::1', 'Edge on Windows', '2026-06-02 13:28:10', 'success', NULL),
(1147, 'staff', 1, '::1', 'Edge on Windows', '2026-06-02 13:39:54', 'failed', 'invalid_password'),
(1148, 'staff', 1, '::1', 'Edge on Windows', '2026-06-02 13:40:02', 'success', NULL),
(1149, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-02 13:41:03', 'success', NULL),
(1150, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-02 14:05:24', 'success', NULL),
(1151, 'staff', 1, '::1', 'Edge on Windows', '2026-06-02 14:07:52', 'success', NULL),
(1152, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-02 14:11:52', 'failed', 'invalid_password'),
(1153, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-02 14:12:06', 'failed', 'invalid_password'),
(1154, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-02 14:12:08', 'failed', 'invalid_password'),
(1155, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-02 14:16:38', 'failed', 'invalid_password'),
(1156, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-02 14:16:39', 'failed', 'invalid_password'),
(1157, 'staff', 1, '::1', 'Edge on Windows', '2026-06-02 14:20:24', 'success', NULL),
(1158, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-02 14:21:23', 'failed', 'invalid_password'),
(1159, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-02 14:21:29', 'success', NULL),
(1160, 'staff', 1, '::1', 'Edge on Windows', '2026-06-02 14:31:02', 'success', NULL),
(1161, 'staff', 1, '::1', 'Edge on Windows', '2026-06-02 14:35:33', 'success', NULL),
(1162, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-02 14:52:29', 'success', NULL),
(1163, 'staff', 1, '::1', 'Edge on Windows', '2026-06-02 17:09:30', 'success', NULL),
(1164, 'customer', 1, '::1', 'Browser on Windows', '2026-06-02 17:31:56', 'failed', 'invalid_password'),
(1165, 'customer', 1, '::1', 'Browser on Windows', '2026-06-02 17:32:25', 'success', NULL),
(1166, 'customer', 7, '::1', 'Edge on Windows', '2026-06-02 17:33:44', 'failed', 'account_rejected'),
(1167, 'customer', 1, '::1', 'Edge on Windows', '2026-06-02 17:33:54', 'success', NULL),
(1168, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:19', 'failed', 'account_pending'),
(1169, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:26', 'failed', 'account_pending'),
(1170, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:27', 'failed', 'account_pending'),
(1171, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:28', 'failed', 'account_pending'),
(1172, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:29', 'failed', 'account_pending'),
(1173, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:29', 'failed', 'account_pending'),
(1174, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:29', 'failed', 'account_pending'),
(1175, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:29', 'failed', 'account_pending'),
(1176, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:29', 'failed', 'account_pending'),
(1177, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:29', 'failed', 'account_pending'),
(1178, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:29', 'failed', 'account_pending'),
(1179, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:30', 'failed', 'account_pending'),
(1180, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:30', 'failed', 'account_pending'),
(1181, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:30', 'failed', 'account_pending'),
(1182, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:30', 'failed', 'account_pending'),
(1183, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:30', 'failed', 'account_pending'),
(1184, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:30', 'failed', 'account_pending'),
(1185, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:30', 'failed', 'account_pending'),
(1186, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:31', 'failed', 'account_pending'),
(1187, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:37', 'failed', 'account_pending'),
(1188, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:37', 'failed', 'account_pending'),
(1189, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:37', 'failed', 'account_pending'),
(1190, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:37', 'failed', 'account_pending'),
(1191, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:37', 'failed', 'account_pending'),
(1192, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:37', 'failed', 'account_pending'),
(1193, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:38', 'failed', 'account_pending'),
(1194, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:38', 'failed', 'account_pending'),
(1195, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:38', 'failed', 'account_pending'),
(1196, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:38', 'failed', 'account_pending'),
(1197, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:38', 'failed', 'account_pending'),
(1198, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:38', 'failed', 'account_pending'),
(1199, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:38', 'failed', 'account_pending'),
(1200, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:43:38', 'failed', 'account_pending'),
(1201, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-03 12:45:25', 'success', NULL),
(1202, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:46:11', 'failed', 'invalid_password'),
(1203, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 12:46:17', 'success', NULL),
(1204, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-03 13:45:32', 'failed', 'invalid_password'),
(1205, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-03 13:45:38', 'failed', 'invalid_password'),
(1206, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-03 13:45:42', 'success', NULL),
(1207, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 13:49:24', 'success', NULL),
(1208, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-03 14:10:56', 'success', NULL),
(1209, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 14:17:20', 'failed', 'invalid_password'),
(1210, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 14:17:26', 'success', NULL),
(1211, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 15:36:44', 'failed', 'invalid_password'),
(1212, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 15:36:48', 'success', NULL),
(1213, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-03 15:45:55', 'failed', 'invalid_password'),
(1214, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-03 15:46:00', 'success', NULL),
(1215, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 15:47:24', 'success', NULL),
(1216, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-03 19:45:50', 'success', NULL),
(1217, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-03 20:45:37', 'failed', 'invalid_password'),
(1218, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 21:02:46', 'success', NULL),
(1219, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 21:06:13', 'success', NULL),
(1220, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 21:26:21', 'failed', 'invalid_password'),
(1221, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 21:26:32', 'success', NULL),
(1222, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 21:26:48', 'success', NULL),
(1223, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 21:28:55', 'failed', 'invalid_password'),
(1224, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 21:29:07', 'failed', 'invalid_password'),
(1225, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 21:29:12', 'success', NULL),
(1226, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 21:29:59', 'success', NULL),
(1227, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 21:30:36', 'success', NULL),
(1228, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 21:31:33', 'success', NULL),
(1229, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 21:47:55', 'failed', 'invalid_password'),
(1230, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 21:48:01', 'success', NULL),
(1231, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-03 21:49:53', 'success', NULL),
(1232, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-03 22:04:00', 'failed', 'invalid_password'),
(1233, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-03 22:04:09', 'success', NULL),
(1234, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-03 23:04:55', 'success', NULL),
(1235, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-03 23:56:32', 'failed', 'invalid_password'),
(1236, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-03 23:56:41', 'success', NULL),
(1237, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-04 08:49:32', 'success', NULL),
(1238, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-04 08:54:54', 'failed', 'invalid_password'),
(1239, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-04 08:55:00', 'success', NULL),
(1240, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-04 10:37:26', 'success', NULL),
(1241, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-04 10:38:38', 'failed', 'invalid_password'),
(1242, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-04 10:38:49', 'success', NULL),
(1243, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-04 10:47:21', 'success', NULL),
(1244, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-04 11:14:50', 'success', NULL),
(1245, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-04 11:45:29', 'success', NULL),
(1246, 'customer', 16, '::ffff:127.0.0.1', 'Chrome on Windows', '2026-06-04 11:48:02', 'failed', 'invalid_password'),
(1247, 'customer', 16, '::ffff:127.0.0.1', 'Chrome on Windows', '2026-06-04 11:48:08', 'success', NULL),
(1248, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-04 12:22:06', 'failed', 'invalid_password'),
(1249, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-04 12:22:10', 'success', NULL),
(1250, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-04 12:32:30', 'success', NULL),
(1251, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-04 12:44:33', 'success', NULL),
(1252, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-04 12:52:42', 'failed', 'invalid_password'),
(1253, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-04 12:52:49', 'success', NULL),
(1254, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-04 12:54:06', 'success', NULL),
(1255, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-04 13:22:02', 'failed', 'invalid_password'),
(1256, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-04 13:22:10', 'success', NULL),
(1257, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-04 13:30:40', 'success', NULL),
(1258, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-04 13:41:29', 'success', NULL),
(1259, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-04 13:55:42', 'failed', 'invalid_password'),
(1260, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-04 13:55:47', 'success', NULL),
(1261, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-04 14:04:26', 'failed', 'invalid_password'),
(1262, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-04 14:04:30', 'success', NULL),
(1263, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-04 14:14:52', 'success', NULL),
(1264, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-04 14:21:37', 'success', NULL),
(1265, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-04 14:23:16', 'success', NULL),
(1266, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-04 14:23:20', 'success', NULL),
(1267, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-04 14:24:08', 'success', NULL),
(1268, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-04 14:24:41', 'success', NULL),
(1269, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-04 14:25:58', 'success', NULL),
(1270, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-04 14:28:04', 'success', NULL),
(1271, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-04 14:28:42', 'success', NULL),
(1272, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-04 14:30:19', 'success', NULL),
(1273, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-04 14:31:07', 'success', NULL),
(1274, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-04 14:31:47', 'failed', 'invalid_password'),
(1275, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-04 14:31:53', 'success', NULL),
(1276, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-04 14:32:48', 'success', NULL),
(1277, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-04 14:37:53', 'failed', 'invalid_password'),
(1278, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-04 14:37:59', 'success', NULL),
(1279, 'customer', 16, '::1', 'Chrome on Windows', '2026-06-04 14:38:21', 'success', NULL),
(1280, 'customer', 16, '::ffff:127.0.0.1', 'Chrome on Windows', '2026-06-04 14:48:29', 'success', NULL),
(1281, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-04 14:49:27', 'failed', 'invalid_password'),
(1282, 'staff', 1, '::1', 'Chrome on Windows', '2026-06-04 14:49:31', 'success', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `organizations`
--

CREATE TABLE `organizations` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('company','government','other') NOT NULL DEFAULT 'company',
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `organizations`
--

INSERT INTO `organizations` (`id`, `name`, `type`, `email`, `phone`, `status`, `created_at`, `updated_at`) VALUES
(1, 'NID Technology Co., Ltd.', 'company', 'you@gmail.com', '0245487878', 'active', '2026-05-01 09:05:00', '2026-05-15 16:27:16'),
(2, 'Bangkok Digital Service', 'government', '22trai2548@gmail.com', '0245487878', 'active', '2026-05-01 09:10:00', '2026-05-14 15:53:34'),
(3, 'ProTech Partner Group', 'company', 'you@gmail.com', '0245487878', 'active', '2026-05-01 09:15:00', '2026-05-22 14:19:44'),
(4, 'Other Customer Organization', 'other', '12123@gmail.com', '0245487878', 'active', '2026-05-01 09:20:00', '2026-05-22 14:19:40');

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
(4, 'staff', 4, '$2b$10$newstaffhash4', '2026-05-06 09:00:00'),
(5, 'staff', 1, '$2b$10$.q3S1InwVcaAE35LjUAgfuAzPvChHcPT1typRBmGaUVRKCOOoLrO6', '2026-05-22 16:41:10'),
(6, 'staff', 1, '$2b$10$zMel.Ua8xDnNoSx67Pty7uPob.oZh9JXgAOtepb6p6asoLkTjMLnu', '2026-05-25 17:14:21'),
(7, 'staff', 1, '$2b$10$obFR.bKr0RzhmGiYeF3bkeeuTrAQ3Cwh/Kv.8SYLDCxOuk/1YQyOq', '2026-05-26 09:30:46'),
(8, 'staff', 1, '$2b$10$usQcSm9il2X81BxE8zLkIOYHLxD.3mZmTEIUmO7yOg9oW3A90TKEu', '2026-05-26 13:35:44'),
(9, 'staff', 1, '$2b$10$XSk51mEdEP9JG1mEsMztYOMAn15fNmf51r92J1BVFIJ8fbbd5Cqmy', '2026-05-28 10:01:13'),
(10, 'staff', 1, '$2b$10$9bBRIkrkCHHsjoCzpkBiZ.zUO2GvInBEZdoNFHYcD3b7oO35ayvKG', '2026-05-28 10:58:02'),
(11, 'staff', 1, '$2b$10$WVls0mt8PYpX.Us6qV/KPOOrHfhsRkkSMOzadaHqKQhPYcqnvwzy.', '2026-05-28 11:04:34');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `code`, `name`, `created_at`) VALUES
(19, 'screening.issue.view', 'จัดการประเด็นปัญหา', '2026-05-15 15:11:44'),
(20, 'screening.complaint.view', 'จัดการข้อร้องเรียน', '2026-05-15 15:11:44'),
(21, 'assignment.ticket.approve', 'พิจารณาออกใบงาน', '2026-05-15 15:11:44'),
(22, 'assignment.request.approve', 'พิจารณาเปิดงาน', '2026-05-15 15:11:44'),
(23, 'tracking.status.view', 'ติดตามสถานะการดำเนินการ', '2026-05-15 15:11:44'),
(24, 'operation.result.view', 'ผลการปฏิบัติงาน', '2026-05-15 15:11:44'),
(25, 'report.dashboard.view', 'สำหรับผู้บริหาร', '2026-05-15 15:11:44'),
(26, 'report.operation.view', 'การปฏิบัติงาน', '2026-05-15 15:11:44'),
(27, 'report.history.view', 'ประวัติการแก้ไข', '2026-05-15 15:11:44'),
(28, 'report.login_log.view', 'รายงานประวัติการเข้าใช้งานระบบ', '2026-05-15 15:11:44'),
(29, 'admin.organization.manage', 'จัดการข้อมูลองค์กรที่เกี่ยวข้อง', '2026-05-15 15:11:44'),
(30, 'admin.system.manage', 'จัดการระบบโครงการและระบบงาน', '2026-05-15 15:11:44'),
(31, 'admin.customer.manage', 'บริหารจัดการข้อมูลลงทะเบียนผู้แจ้งประเด็น', '2026-05-15 15:11:44'),
(32, 'admin.staff.manage', 'จัดการข้อมูลลงทะเบียนทีมแก้ไข', '2026-05-15 15:11:44'),
(33, 'admin.team.manage', 'จัดการกลุ่มผู้ใช้งาน', '2026-05-15 15:11:44'),
(34, 'admin.permission.manage', 'จัดการสิทธิ์ผู้ใช้งานจำแนกตามกลุ่ม', '2026-05-15 15:11:44'),
(35, 'admin.user.manage', 'จัดการข้อมูลผู้ใช้งาน', '2026-05-15 15:11:44'),
(36, 'admin.problem_type.manage', 'จัดการรูปแบบประเด็นและข้อร้องเรียน', '2026-05-15 15:11:44');

-- --------------------------------------------------------

--
-- Table structure for table `prefixes`
--

CREATE TABLE `prefixes` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `prefixes`
--

INSERT INTO `prefixes` (`id`, `name`, `created_at`) VALUES
(1, 'เด็กชาย', '2026-05-12 14:42:17'),
(2, 'เด็กหญิง', '2026-05-12 14:42:17'),
(3, 'นาย', '2026-05-12 14:42:17'),
(4, 'นาง', '2026-05-12 14:42:17'),
(5, 'นางสาว', '2026-05-12 14:42:17'),
(6, 'ว่าที่ ร.ต.', '2026-05-12 14:42:17'),
(7, 'ว่าที่ ร.ท.', '2026-05-12 14:42:17'),
(8, 'ว่าที่ ร.อ.', '2026-05-12 14:42:17'),
(9, 'ร.ต.', '2026-05-12 14:42:17'),
(10, 'ร.ท.', '2026-05-12 14:42:17'),
(11, 'ร.อ.', '2026-05-12 14:42:17'),
(12, 'พ.ต.', '2026-05-12 14:42:17'),
(13, 'พ.ท.', '2026-05-12 14:42:17'),
(14, 'พ.อ.', '2026-05-12 14:42:17'),
(15, 'พล.ต.', '2026-05-12 14:42:17'),
(16, 'พล.ท.', '2026-05-12 14:42:17'),
(17, 'พล.อ.', '2026-05-12 14:42:17'),
(18, 'ร.ต.ต.', '2026-05-12 14:42:17'),
(19, 'ร.ต.ท.', '2026-05-12 14:42:17'),
(20, 'ร.ต.อ.', '2026-05-12 14:42:17'),
(21, 'พ.ต.ต.', '2026-05-12 14:42:17'),
(22, 'พ.ต.ท.', '2026-05-12 14:42:17'),
(23, 'พ.ต.อ.', '2026-05-12 14:42:17'),
(24, 'พล.ต.ต.', '2026-05-12 14:42:17'),
(25, 'พล.ต.ท.', '2026-05-12 14:42:17'),
(26, 'พล.ต.อ.', '2026-05-12 14:42:17'),
(27, 'พล.ต.อ.พิเศษ', '2026-05-12 14:42:17'),
(28, 'น.ต.', '2026-05-12 14:42:17'),
(29, 'น.ท.', '2026-05-12 14:42:17'),
(30, 'น.อ.', '2026-05-12 14:42:17'),
(31, 'พล.ร.ต.', '2026-05-12 14:42:17'),
(32, 'พล.ร.ท.', '2026-05-12 14:42:17'),
(33, 'พล.ร.อ.', '2026-05-12 14:42:17'),
(34, 'น.ต.ต.', '2026-05-12 14:42:17'),
(35, 'น.ต.ท.', '2026-05-12 14:42:17'),
(36, 'น.ต.อ.', '2026-05-12 14:42:17'),
(37, 'เรืออากาศตรี', '2026-05-12 14:42:17'),
(38, 'เรืออากาศโท', '2026-05-12 14:42:17'),
(39, 'เรืออากาศเอก', '2026-05-12 14:42:17'),
(40, 'นาวาอากาศตรี', '2026-05-12 14:42:17'),
(41, 'นาวาอากาศโท', '2026-05-12 14:42:17'),
(42, 'นาวาอากาศเอก', '2026-05-12 14:42:17'),
(43, 'พลอากาศตรี', '2026-05-12 14:42:17'),
(44, 'พลอากาศโท', '2026-05-12 14:42:17'),
(45, 'พลอากาศเอก', '2026-05-12 14:42:17'),
(46, 'จ.ต.', '2026-05-12 14:42:17'),
(47, 'จ.อ.', '2026-05-12 14:42:17'),
(48, 'ส.อ.', '2026-05-12 14:42:17'),
(49, 'ส.ท.', '2026-05-12 14:42:17'),
(50, 'ส.ต.', '2026-05-12 14:42:17'),
(51, 'ด.ต.', '2026-05-12 14:42:17'),
(52, 'จ.ส.ต.', '2026-05-12 14:42:17'),
(53, 'จ.ส.ท.', '2026-05-12 14:42:17'),
(54, 'จ.ส.อ.', '2026-05-12 14:42:17'),
(55, 'สิบตรี', '2026-05-12 14:42:17'),
(56, 'สิบโท', '2026-05-12 14:42:17'),
(57, 'สิบเอก', '2026-05-12 14:42:17'),
(58, 'สิบตำรวจตรี', '2026-05-12 14:42:17'),
(59, 'สิบตำรวจโท', '2026-05-12 14:42:17'),
(60, 'สิบตำรวจเอก', '2026-05-12 14:42:17'),
(61, 'พันจ่าอากาศตรี', '2026-05-12 14:42:17'),
(62, 'พันจ่าอากาศโท', '2026-05-12 14:42:17'),
(63, 'พันจ่าอากาศเอก', '2026-05-12 14:42:17'),
(64, 'ม.จ.', '2026-05-12 14:42:17'),
(65, 'ม.ร.ว.', '2026-05-12 14:42:17'),
(66, 'ม.ล.', '2026-05-12 14:42:17'),
(67, 'หม่อมเจ้า', '2026-05-12 14:42:17'),
(68, 'หม่อมราชวงศ์', '2026-05-12 14:42:17'),
(69, 'หม่อมหลวง', '2026-05-12 14:42:17'),
(70, 'นพ.', '2026-05-12 14:42:17'),
(71, 'พญ.', '2026-05-12 14:42:17'),
(72, 'ทพ.', '2026-05-12 14:42:17'),
(73, 'ทพญ.', '2026-05-12 14:42:17'),
(74, 'ภญ.', '2026-05-12 14:42:17'),
(75, 'สพ.', '2026-05-12 14:42:17'),
(76, 'สพญ.', '2026-05-12 14:42:17'),
(77, 'ดร.', '2026-05-12 14:42:17'),
(78, 'ศ.ดร.', '2026-05-12 14:42:17'),
(79, 'รศ.ดร.', '2026-05-12 14:42:17'),
(80, 'ผศ.ดร.', '2026-05-12 14:42:17'),
(81, 'ผศ.', '2026-05-12 14:42:17'),
(82, 'รศ.', '2026-05-12 14:42:17'),
(83, 'ศ.', '2026-05-12 14:42:17'),
(84, 'พระ', '2026-05-12 14:42:17'),
(85, 'พระมหา', '2026-05-12 14:42:17'),
(86, 'พระครู', '2026-05-12 14:42:17'),
(87, 'พระราช', '2026-05-12 14:42:17'),
(88, 'พระเทพ', '2026-05-12 14:42:17'),
(89, 'สามเณร', '2026-05-12 14:42:17'),
(90, 'แม่ชี', '2026-05-12 14:42:17');

-- --------------------------------------------------------

--
-- Table structure for table `problem_types`
--

CREATE TABLE `problem_types` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(10) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `request_type` enum('issue','complaint') NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `problem_types`
--

INSERT INTO `problem_types` (`id`, `code`, `name`, `request_type`, `status`, `created_at`, `updated_at`) VALUES
(1, 'IS001', 'เข้าสู่ระบบไม่ได้', 'issue', 'active', '2026-05-01 13:30:00', '2026-05-15 10:26:06'),
(2, 'IS002', 'ระบบช้า/โหลดไม่ขึ้น', 'issue', 'active', '2026-05-01 13:31:00', '2026-05-14 15:55:29'),
(3, 'IS003', 'เครือข่ายใช้งานไม่ได้', 'issue', 'active', '2026-05-01 13:32:00', '2026-05-14 15:55:39'),
(4, 'IS004', 'ข้อมูลแสดนนงผลผิดพลาด', 'issue', 'active', '2026-05-01 13:33:00', '2026-05-14 15:55:43'),
(5, 'CO001', 'ร้องเรียนการให้บริการล่าช้า', 'complaint', 'active', '2026-05-01 13:34:00', '2026-05-14 15:56:30'),
(6, 'CO002', 'ร้องเรียนพฤติกรรมเจ้าหน้าที่', 'complaint', 'active', '2026-05-01 13:35:00', '2026-05-14 15:56:42'),
(7, 'IS005', 'ประเภทปัญหาเก่า', 'issue', 'inactive', '2026-05-01 13:36:00', '2026-05-14 15:55:46'),
(8, 'IS006', 'รร่า', 'issue', 'inactive', '2026-05-14 15:24:10', '2026-05-14 15:55:49'),
(9, 'IS007', '1', 'issue', 'inactive', '2026-05-14 15:30:11', '2026-05-14 16:05:58'),
(12, 'IS010', 'บ', 'issue', 'active', '2026-05-14 16:05:19', '2026-05-14 16:05:19'),
(13, 'IS011', 'ฃฃฃฃ', 'issue', 'active', '2026-05-14 16:05:31', '2026-05-14 16:05:31'),
(14, 'IS012', 'บบบบ', 'issue', 'active', '2026-05-14 16:05:37', '2026-05-14 16:05:37'),
(15, 'CO003', '[[[[', 'complaint', 'inactive', '2026-05-15 09:02:16', '2026-05-15 10:25:14'),
(16, 'CO004', '[[[[', 'complaint', 'inactive', '2026-05-15 09:02:21', '2026-05-15 09:02:27'),
(18, 'IS013', 'บบบบ', 'issue', 'active', '2026-05-18 09:34:32', '2026-05-18 09:34:32'),
(19, 'IS014', 'ว', 'issue', 'active', '2026-05-18 09:45:42', '2026-05-18 09:45:42');

-- --------------------------------------------------------

--
-- Table structure for table `requests`
--

CREATE TABLE `requests` (
  `id` int(10) UNSIGNED NOT NULL,
  `request_no` varchar(50) NOT NULL,
  `customer_id` int(10) UNSIGNED DEFAULT NULL,
  `organization` varchar(30) DEFAULT NULL,
  `system_id` int(10) UNSIGNED DEFAULT NULL,
  `problem_type_id` int(10) UNSIGNED DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `detail` text NOT NULL,
  `status` enum('screening','assigned','in_progress','waiting_confirm','closed','rejected') DEFAULT 'screening',
  `score` tinyint(3) UNSIGNED DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `closed_at` datetime DEFAULT NULL,
  `due_at` date DEFAULT NULL,
  `resolved_at` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `requests`
--

INSERT INTO `requests` (`id`, `request_no`, `customer_id`, `organization`, `system_id`, `problem_type_id`, `title`, `detail`, `status`, `score`, `created_at`, `closed_at`, `due_at`, `resolved_at`) VALUES
(67, 'REQ-MOCK13-0001', 16, NULL, NULL, 1, 'ไม่สามารถเข้าสู่ระบบได้', 'ผู้ใช้งานไม่สามารถเข้าสู่ระบบได้หลังเปลี่ยนรหัสผ่าน โดยหน้าเว็บแจ้งว่าอีเมลหรือรหัสผ่านไม่ถูกต้อง ทั้งที่ยืนยันข้อมูลแล้วหลายครั้ง', 'rejected', NULL, '2026-06-04 09:10:00', NULL, NULL, NULL),
(68, 'REQ-MOCK13-0002', 16, NULL, 1, 2, 'ระบบบันทึกข้อมูลช้า', 'เมื่อกดบันทึกรายการขาย ระบบใช้เวลานานกว่า 30 วินาทีและบางครั้งค้างที่หน้าเดิม ทำให้ผู้ใช้งานต้องกดซ้ำหลายครั้ง', 'assigned', NULL, '2026-06-04 08:45:00', NULL, '2026-06-19', NULL),
(69, 'REQ-MOCK13-0003', 16, NULL, 2, 3, 'เครื่องพิมพ์ไม่สามารถพิมพ์ใบเสร็จได้', 'เครื่องพิมพ์เชื่อมต่อกับระบบได้แต่เมื่อสั่งพิมพ์จะขึ้นสถานะ pending ตลอดเวลา เจ้าหน้าที่สาขาทดลองปิดเปิดอุปกรณ์แล้วแต่ยังไม่สามารถใช้งานได้', 'in_progress', NULL, '2026-06-04 08:20:00', NULL, '2026-06-05', NULL),
(70, 'REQ-MOCK13-0004', 16, NULL, 3, 4, 'รายงานสรุปยอดขายไม่ออก PDF', 'เมนูรายงานสามารถค้นหาข้อมูลได้ตามปกติ แต่เมื่อกด Export PDF ระบบโหลดค้างและไม่ดาวน์โหลดไฟล์ออกมาให้ผู้ใช้งาน', 'assigned', NULL, '2026-06-04 07:50:00', NULL, '2026-06-05', '2026-06-04'),
(71, 'REQ-MOCK13-0005', 16, NULL, 1, 5, 'อัปโหลดเอกสารแล้วชื่อไฟล์เพี้ยน', 'หลังแนบไฟล์เอกสารภาษาไทยในหน้าแจ้งปัญหา ชื่อไฟล์ที่แสดงในหน้าติดตามกลายเป็นตัวอักษรเพี้ยน ทำให้ผู้ใช้งานไม่มั่นใจว่าแนบไฟล์ถูกต้องหรือไม่', 'closed', 2, '2026-06-03 15:10:00', '2026-06-04 09:00:00', '2026-06-04', '2026-06-03'),
(72, 'REQ-MOCK13-0006', 16, NULL, 2, 1, 'ข้อมูลหน้าแดชบอร์ดไม่อัปเดต', 'ยอดสรุปในหน้าแดชบอร์ดไม่ตรงกับรายการล่าสุดที่เพิ่มเข้ามา ต้องกดรีเฟรชหลายครั้งถึงจะเห็นข้อมูลใหม่', 'closed', 5, '2026-06-02 10:00:00', '2026-06-02 14:20:00', '2026-06-03', '2026-06-02'),
(73, 'REQ-MOCK13-0007', 16, NULL, 3, 3, 'ข้อความหัวข้อยาวมากเพื่อใช้ทดสอบการแสดงผลบนหน้า track และการตีกลับงานหลังจากส่งผลการแก้ไขกลับมาแล้ว', 'เคสนี้ใช้ทดสอบข้อความยาวบนหน้า track, การมีไฟล์แนบตั้งต้น, การมีไฟล์หลักฐานการแก้ไข, และการตีกลับงานพร้อมแนบไฟล์เพิ่มเติมของลูกค้า', 'assigned', NULL, '2026-06-01 13:00:00', NULL, '2026-06-03', NULL),
(74, 'RPT-20260604-0001', 16, NULL, NULL, 5, 'fc', 'ccc', 'rejected', NULL, '2026-06-04 14:33:00', NULL, NULL, NULL),
(75, 'REQ-20260604-0001', 16, NULL, 4, 1, 'พะพเ', 'เพเพเ', 'rejected', NULL, '2026-06-04 14:36:43', NULL, NULL, NULL),
(76, 'REQ-20260604-0002', 16, NULL, 4, 1, 'Test1', 'Test', 'assigned', NULL, '2026-06-04 14:51:26', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `request_confirmations`
--

CREATE TABLE `request_confirmations` (
  `id` int(10) UNSIGNED NOT NULL,
  `request_id` int(10) UNSIGNED NOT NULL,
  `customer_id` int(10) UNSIGNED NOT NULL,
  `result` enum('confirmed','reopened') NOT NULL,
  `comment` text DEFAULT NULL,
  `score` tinyint(3) UNSIGNED DEFAULT NULL,
  `confirmed_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `request_confirmations`
--

INSERT INTO `request_confirmations` (`id`, `request_id`, `customer_id`, `result`, `comment`, `score`, `confirmed_at`) VALUES
(18, 71, 13, 'confirmed', 'จตจจ', 2, '2026-06-04 09:00:00'),
(19, 72, 13, 'confirmed', 'ข้อมูลอัปเดตตรงแล้วและใช้งานได้ตามปกติ', 5, '2026-06-02 14:20:00'),
(20, 73, 13, 'reopened', 'ยังพบปัญหาเดิมบางส่วน กรุณาตรวจสอบอีกครั้ง พร้อมแนบภาพประกอบเพิ่มเติม', NULL, '2026-06-02 09:15:00'),
(21, 70, 16, 'reopened', 'po', NULL, '2026-06-04 12:24:15'),
(22, 73, 16, 'reopened', 'รีีี', NULL, '2026-06-04 14:19:18');

-- --------------------------------------------------------

--
-- Table structure for table `request_status_logs`
--

CREATE TABLE `request_status_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `request_id` int(10) UNSIGNED NOT NULL,
  `status` enum('screening','assigned','in_progress','waiting_confirm','closed','rejected') NOT NULL,
  `changed_by_type` enum('customer','staff','system') NOT NULL,
  `changed_by_id` int(10) UNSIGNED DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `request_status_logs`
--

INSERT INTO `request_status_logs` (`id`, `request_id`, `status`, `changed_by_type`, `changed_by_id`, `note`, `created_at`) VALUES
(43, 34, 'screening', 'staff', 1, 'รับเรื่องและรอคัดกรอง', '2026-06-04 09:18:00'),
(44, 35, 'screening', 'staff', 1, 'คัดกรองเรื่องแล้ว', '2026-06-04 09:00:00'),
(45, 35, 'assigned', 'staff', 1, 'มอบหมายงานให้เจ้าหน้าที่แล้ว', '2026-06-04 09:05:00'),
(46, 36, 'screening', 'staff', 1, 'คัดกรองเรื่องแล้ว', '2026-06-04 08:45:00'),
(47, 36, 'assigned', 'staff', 1, 'มอบหมายให้ทีมอุปกรณ์', '2026-06-04 08:55:00'),
(48, 36, 'in_progress', 'staff', 3, 'เจ้าหน้าที่เริ่มดำเนินการแก้ไข', '2026-06-04 09:40:00'),
(49, 37, 'screening', 'staff', 1, 'คัดกรองเรื่องแล้ว', '2026-06-04 08:10:00'),
(50, 37, 'assigned', 'staff', 1, 'มอบหมายให้เจ้าหน้าที่รายงาน', '2026-06-04 08:20:00'),
(51, 37, 'in_progress', 'staff', 4, 'เริ่มแก้ปัญหาการสร้าง PDF', '2026-06-04 10:15:00'),
(52, 37, 'waiting_confirm', 'staff', 1, 'ส่งผลการแก้ไขให้ลูกค้ายืนยัน', '2026-06-04 13:50:00'),
(53, 38, 'screening', 'staff', 1, 'คัดกรองเรื่องแล้ว', '2026-06-03 15:30:00'),
(54, 38, 'assigned', 'staff', 1, 'มอบหมายงานแล้ว', '2026-06-03 15:40:00'),
(55, 38, 'in_progress', 'staff', 2, 'เริ่มแก้ไขปัญหาชื่อไฟล์', '2026-06-03 16:00:00'),
(56, 38, 'waiting_confirm', 'staff', 1, 'ส่งผลการแก้ไขให้ลูกค้ายืนยัน', '2026-06-04 08:40:00'),
(57, 38, 'closed', 'customer', 13, 'ลูกค้ายืนยันปิดงานแล้ว', '2026-06-04 09:00:00'),
(58, 39, 'screening', 'staff', 1, 'คัดกรองเรื่องแล้ว', '2026-06-02 10:25:00'),
(59, 39, 'assigned', 'staff', 1, 'มอบหมายงานแล้ว', '2026-06-02 10:30:00'),
(60, 39, 'in_progress', 'staff', 3, 'เริ่มแก้ไข cache ของ dashboard', '2026-06-02 11:10:00'),
(61, 39, 'waiting_confirm', 'staff', 1, 'ส่งให้ลูกค้ายืนยัน', '2026-06-02 13:50:00'),
(62, 39, 'closed', 'customer', 13, 'ลูกค้ายืนยันและให้คะแนนแล้ว', '2026-06-02 14:20:00'),
(63, 40, 'screening', 'staff', 1, 'คัดกรองเรื่องแล้ว', '2026-06-01 13:20:00'),
(64, 40, 'assigned', 'staff', 1, 'มอบหมายงานรอบแรก', '2026-06-01 13:30:00'),
(65, 40, 'in_progress', 'staff', 4, 'เริ่มดำเนินการแก้ไข', '2026-06-01 14:15:00'),
(66, 40, 'waiting_confirm', 'staff', 1, 'ส่งให้ลูกค้ายืนยันรอบแรก', '2026-06-01 17:00:00'),
(67, 40, 'assigned', 'customer', 13, 'ลูกค้าตีกลับงานและแนบไฟล์เพิ่มเติม', '2026-06-02 09:15:00'),
(158, 67, 'screening', 'staff', 1, 'รับเรื่องและรอคัดกรอง', '2026-06-04 09:18:00'),
(159, 68, 'screening', 'staff', 1, 'คัดกรองเรื่องแล้ว', '2026-06-04 09:00:00'),
(160, 68, 'assigned', 'staff', 1, 'มอบหมายงานให้เจ้าหน้าที่แล้ว', '2026-06-04 09:05:00'),
(161, 69, 'screening', 'staff', 1, 'คัดกรองเรื่องแล้ว', '2026-06-04 08:45:00'),
(162, 69, 'assigned', 'staff', 1, 'มอบหมายให้ทีมอุปกรณ์', '2026-06-04 08:55:00'),
(163, 69, 'in_progress', 'staff', 3, 'เจ้าหน้าที่เริ่มดำเนินการแก้ไข', '2026-06-04 09:40:00'),
(164, 70, 'screening', 'staff', 1, 'คัดกรองเรื่องแล้ว', '2026-06-04 08:10:00'),
(165, 70, 'assigned', 'staff', 1, 'มอบหมายให้เจ้าหน้าที่รายงาน', '2026-06-04 08:20:00'),
(166, 70, 'in_progress', 'staff', 4, 'เริ่มแก้ปัญหาการสร้าง PDF', '2026-06-04 10:15:00'),
(167, 70, 'waiting_confirm', 'staff', 1, 'ส่งผลการแก้ไขให้ลูกค้ายืนยัน', '2026-06-04 13:50:00'),
(168, 71, 'screening', 'staff', 1, 'คัดกรองเรื่องแล้ว', '2026-06-03 15:30:00'),
(169, 71, 'assigned', 'staff', 1, 'มอบหมายงานแล้ว', '2026-06-03 15:40:00'),
(170, 71, 'in_progress', 'staff', 2, 'เริ่มแก้ไขปัญหาชื่อไฟล์', '2026-06-03 16:00:00'),
(171, 71, 'waiting_confirm', 'staff', 1, 'ส่งผลการแก้ไขให้ลูกค้ายืนยัน', '2026-06-04 08:40:00'),
(172, 71, 'closed', 'customer', 13, 'ลูกค้ายืนยันปิดงานแล้ว', '2026-06-04 09:00:00'),
(173, 72, 'screening', 'staff', 1, 'คัดกรองเรื่องแล้ว', '2026-06-02 10:25:00'),
(174, 72, 'assigned', 'staff', 1, 'มอบหมายงานแล้ว', '2026-06-02 10:30:00'),
(175, 72, 'in_progress', 'staff', 3, 'เริ่มแก้ไข cache ของ dashboard', '2026-06-02 11:10:00'),
(176, 72, 'waiting_confirm', 'staff', 1, 'ส่งให้ลูกค้ายืนยัน', '2026-06-02 13:50:00'),
(177, 72, 'closed', 'customer', 13, 'ลูกค้ายืนยันและให้คะแนนแล้ว', '2026-06-02 14:20:00'),
(178, 73, 'screening', 'staff', 1, 'คัดกรองเรื่องแล้ว', '2026-06-01 13:20:00'),
(179, 73, 'assigned', 'staff', 1, 'มอบหมายงานรอบแรก', '2026-06-01 13:30:00'),
(180, 73, 'in_progress', 'staff', 4, 'เริ่มดำเนินการแก้ไข', '2026-06-01 14:15:00'),
(181, 73, 'waiting_confirm', 'staff', 1, 'ส่งให้ลูกค้ายืนยันรอบแรก', '2026-06-01 17:00:00'),
(182, 73, 'assigned', 'customer', 13, 'ลูกค้าตีกลับงานและแนบไฟล์เพิ่มเติม', '2026-06-02 09:15:00'),
(183, 70, 'assigned', 'customer', 16, 'po', '2026-06-04 12:24:15'),
(184, 73, 'assigned', 'customer', 16, 'รีีี', '2026-06-04 14:19:18'),
(185, 74, 'screening', 'system', NULL, NULL, '2026-06-04 14:33:00'),
(186, 75, 'screening', 'system', NULL, NULL, '2026-06-04 14:36:43'),
(187, 76, 'screening', 'system', NULL, NULL, '2026-06-04 14:51:27'),
(188, 76, 'screening', 'staff', 0, NULL, '2026-06-04 14:51:47');

-- --------------------------------------------------------

--
-- Table structure for table `screenings`
--

CREATE TABLE `screenings` (
  `id` int(10) UNSIGNED NOT NULL,
  `request_id` int(10) UNSIGNED NOT NULL,
  `screened_by` int(10) UNSIGNED DEFAULT NULL,
  `result` enum('accepted','rejected','need_more_info') NOT NULL,
  `note` text DEFAULT NULL,
  `screened_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `screenings`
--

INSERT INTO `screenings` (`id`, `request_id`, `screened_by`, `result`, `note`, `screened_at`) VALUES
(1, 1, 2, 'need_more_info', 'ขอภาพหน้าจอ error เพิ่มเติม', '2026-05-08 08:05:00'),
(2, 2, 2, 'accepted', 'รับเรื่องและส่งต่อให้ผู้มอบหมายงาน', '2026-05-08 08:20:00'),
(3, 3, 2, 'accepted', 'เป็นปัญหาเครือข่าย ส่งทีม Network', '2026-05-08 08:35:00'),
(4, 4, 7, 'accepted', 'ตรวจสอบแล้วเป็นปัญหาข้อมูลรายงาน', '2026-05-08 08:50:00'),
(5, 5, 2, 'accepted', 'รับเป็นข้อร้องเรียนด้านบริการ', '2026-05-08 09:05:00'),
(6, 6, 2, 'rejected', 'ข้อมูลไม่เพียงพอและไม่พบหลักฐานประกอบ', '2026-05-08 09:20:00'),
(7, 7, 7, 'accepted', 'เป็นงานเปิดซ้ำหลังลูกค้าปฏิเสธการปิดงาน', '2026-05-08 09:35:00'),
(8, 8, 2, 'need_more_info', 'ขอรายละเอียดรหัสผู้ใช้และช่วงเวลาที่เกิดปัญหา', '2026-05-08 09:50:00'),
(9, 9, 2, 'accepted', 'รับเรื่องก่อนลูกค้าขอยกเลิก', '2026-05-08 10:05:00'),
(10, 74, NULL, 'rejected', '', '2026-06-04 14:33:48'),
(11, 67, NULL, 'rejected', 'ะะะะะะ', '2026-06-04 14:35:43'),
(12, 75, NULL, 'rejected', '', '2026-06-04 14:41:32'),
(13, 76, NULL, 'accepted', '', '2026-06-04 14:51:47');

-- --------------------------------------------------------

--
-- Table structure for table `staffs`
--

CREATE TABLE `staffs` (
  `id` int(10) UNSIGNED NOT NULL,
  `prefix_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `surname` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `citizen_id` varchar(13) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `staffs`
--

INSERT INTO `staffs` (`id`, `prefix_id`, `name`, `surname`, `email`, `phone`, `citizen_id`, `password_hash`, `status`, `created_at`, `updated_at`) VALUES
(1, 3, 'อดิศักดิ์', 'ผู้ดูแล', '22trai2548@gmail.com', '0900000001', '1111111111111', '$2b$10$WVls0mt8PYpX.Us6qV/KPOOrHfhsRkkSMOzadaHqKQhPYcqnvwzy.', 'active', '2026-05-01 11:00:00', '2026-05-28 11:04:34'),
(2, NULL, 'ปวีณา', 'คัดกรอง', 'screening@protech.com', '0900000002', NULL, '$2b$10$mockhashstaff2', 'active', '2026-05-01 11:05:00', '2026-05-01 11:05:00'),
(3, NULL, 'กิตติ', 'มอบหมาย', 'assignment@protech.com', '0900000003', NULL, '$2b$10$mockhashstaff3', 'active', '2026-05-01 11:10:00', '2026-05-01 11:10:00'),
(4, NULL, 'ณัฐพล', 'ไอที', 'operator.it@protech.com', '0900000004', NULL, '$2b$10$mockhashstaff4', 'active', '2026-05-01 11:15:00', '2026-05-01 11:15:00'),
(5, NULL, 'รัตนา', 'เน็ตเวิร์ก', 'operator.network@protech.com', '0900000005', NULL, '$2b$10$mockhashstaff5', 'active', '2026-05-01 11:20:00', '2026-05-01 11:20:00'),
(6, NULL, 'วิชัย', 'ซัพพอร์ต', 'operator.support@protech.com', '0900000006', NULL, '$2b$10$mockhashstaff6', 'active', '2026-05-01 11:25:00', '2026-05-01 11:25:00'),
(7, NULL, 'มานพ', 'หลายบทบาท', 'multi.role@protech.com', '0900000007', NULL, '$2b$10$mockhashstaff7', 'active', '2026-05-01 11:30:00', '2026-05-01 11:30:00'),
(8, NULL, 'พนักงานเก่า', 'ปิดใช้งาน', 'inactive.staff@protech.com', '0900000008', NULL, '$2b$10$mockhashstaff8', 'inactive', '2026-05-01 11:35:00', '2026-05-01 11:35:00'),
(14, 1, 'ggg', 'ggg', '22trai2546@gmail.com', '5555555555', '8888888888888', '$2b$10$owmQLuG0Yo7j9LV0AXso3emgHfgeKE.PxUC.EYaEKJ2BtT08DNuRO', 'active', '2026-05-25 11:27:14', '2026-05-25 11:27:14'),
(15, 1, 'ggg', 'rrrr', 'trw@gmail.com', '4444444444', '5278527248525', '$2b$10$maprgvkisr6mIWnOhTGFoOZm5/BOmPtJLDqeqP/oLJVFbpd.M6cQm', 'active', '2026-05-25 11:29:06', '2026-05-25 11:29:06'),
(16, 3, 'ggfgfg', 'fgfg', '22tstst@gmail.com', '8777787848', '4546464644654', '$2b$10$jQ4kG7/SglTHpXYN0bW4.eOHfegoJV9rdxtnV2Syt7aHBwU7NoQjW', 'active', '2026-05-25 16:00:36', '2026-05-25 16:00:36'),
(17, NULL, 'ลบwwwwww', 'wwwww', '22tr@gmail.com', '2222222222', '2222222222222', '$2b$10$MkqfLPLM0H0ghb.LHU24ae0zjHi2UIt4aICeO81NZ6wFKxLPCkufW', 'active', '2026-05-25 16:25:16', '2026-05-25 16:25:16'),
(18, 2, 'ดดดด', 'ดดด', 'e@gmail.com', '7777777777', '7777777777777', '$2b$10$n8lVNRv6RmZY7P4CxOkT0eWfVH3yywDW5EWQY/aQ52BP2RUuTLApW', 'active', '2026-05-26 11:28:30', '2026-05-26 11:28:30'),
(19, NULL, 'ttt', 'ttt', '123@gmail.com', '5555555555', '5555555555555', '$2b$10$OKxS3A/DEC79MI6JZrcBtuNlWeyJOGnDKFTMljZ09DwNqOLK9oCDm', 'active', '2026-05-26 11:40:32', '2026-05-26 11:40:32'),
(20, NULL, 'ffff', 'ffff', '22@gmail.com', '7777777777', '1234565789777', '$2b$10$mLf7/.9FcXi6zg8.mJiUm.b.Jd8vTXB3BFceDTZml5/jKASZK4Num', 'active', '2026-05-26 11:48:29', '2026-05-26 11:48:29');

-- --------------------------------------------------------

--
-- Table structure for table `staff_team_roles`
--

CREATE TABLE `staff_team_roles` (
  `id` int(10) UNSIGNED NOT NULL,
  `staff_id` int(10) UNSIGNED NOT NULL,
  `team_id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `staff_team_roles`
--

INSERT INTO `staff_team_roles` (`id`, `staff_id`, `team_id`, `created_at`) VALUES
(1, 1, 1, '2026-05-01 12:30:00'),
(2, 2, 4, '2026-05-01 12:31:00'),
(4, 4, 1, '2026-05-01 12:33:00'),
(5, 5, 2, '2026-05-01 12:34:00'),
(6, 6, 4, '2026-05-01 12:35:00'),
(7, 7, 1, '2026-05-01 12:36:00'),
(8, 7, 1, '2026-05-01 12:37:00'),
(9, 7, 3, '2026-05-01 12:38:00'),
(11, 1, 3, '2026-05-18 11:03:00'),
(18, 3, 1, '2026-05-18 11:04:40'),
(19, 3, 2, '2026-05-18 11:04:40'),
(34, 14, 1, '2026-05-25 11:27:14'),
(35, 15, 3, '2026-05-25 11:29:06'),
(36, 15, 1, '2026-05-25 11:29:06'),
(37, 15, 4, '2026-05-25 11:29:06'),
(38, 15, 6, '2026-05-25 11:29:06'),
(39, 15, 11, '2026-05-25 11:29:06'),
(40, 15, 5, '2026-05-25 11:29:06'),
(41, 16, 6, '2026-05-25 16:00:36'),
(42, 17, 2, '2026-05-25 16:25:16'),
(43, 18, 4, '2026-05-26 11:28:30'),
(44, 19, 1, '2026-05-26 11:40:32'),
(45, 20, 3, '2026-05-26 11:48:29');

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
(1, 2, 'ระบบ ProTech Support', 'active', '2026-05-01 13:00:00', '2026-06-03 13:03:13'),
(2, 4, 'ระบบ HR Portal', 'active', '2026-05-01 13:05:00', '2026-05-22 12:06:07'),
(3, 3, 'ระบบ E-Service', 'active', '2026-05-01 13:10:00', '2026-05-22 12:06:11'),
(4, 2, 'ระบบเก่า Legacyl', 'active', '2026-05-01 13:15:00', '2026-05-28 10:03:10');

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
(1, 'admin', 'active', '2026-05-01 12:00:00', '2026-05-26 11:18:20'),
(2, 'ทีม Network', 'active', '2026-05-01 12:05:00', '2026-05-01 12:05:00'),
(3, 'ทีม Application', 'active', '2026-05-01 12:10:00', '2026-05-01 12:10:00'),
(4, 'ทีม Customer Service', 'active', '2026-05-01 12:15:00', '2026-05-01 12:15:00'),
(5, 'ทีมเก่า', 'inactive', '2026-05-01 12:20:00', '2026-05-01 12:20:00'),
(6, 'ะะะะ', 'inactive', '2026-05-18 10:57:11', '2026-05-18 11:15:15'),
(10, '1', 'active', '2026-05-18 13:48:32', '2026-05-18 13:48:32'),
(11, '2', 'active', '2026-05-18 13:48:35', '2026-05-18 13:48:35'),
(12, '3', 'active', '2026-05-18 13:48:37', '2026-05-18 13:48:37'),
(14, '5', 'active', '2026-05-18 13:48:43', '2026-05-18 13:48:43');

-- --------------------------------------------------------

--
-- Table structure for table `team_permissions`
--

CREATE TABLE `team_permissions` (
  `id` int(10) UNSIGNED NOT NULL,
  `team_id` int(10) UNSIGNED NOT NULL,
  `permission_id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `team_permissions`
--

INSERT INTO `team_permissions` (`id`, `team_id`, `permission_id`, `created_at`) VALUES
(21, 3, 19, '2026-05-18 10:09:31'),
(56, 4, 24, '2026-05-22 11:23:12'),
(57, 4, 29, '2026-05-22 11:23:12'),
(58, 5, 29, '2026-05-22 11:23:19'),
(59, 5, 31, '2026-05-22 11:23:19'),
(60, 5, 33, '2026-05-22 11:23:19'),
(61, 5, 35, '2026-05-22 11:23:19'),
(62, 2, 30, '2026-05-22 11:23:40'),
(63, 2, 32, '2026-05-22 11:23:40'),
(64, 2, 34, '2026-05-22 11:23:40'),
(65, 2, 36, '2026-05-22 11:23:40'),
(168, 1, 19, '2026-06-04 14:31:19'),
(169, 1, 20, '2026-06-04 14:31:19'),
(170, 1, 21, '2026-06-04 14:31:19'),
(171, 1, 22, '2026-06-04 14:31:19'),
(172, 1, 23, '2026-06-04 14:31:19'),
(173, 1, 24, '2026-06-04 14:31:19'),
(174, 1, 25, '2026-06-04 14:31:19'),
(175, 1, 26, '2026-06-04 14:31:19'),
(176, 1, 27, '2026-06-04 14:31:19'),
(177, 1, 28, '2026-06-04 14:31:19'),
(178, 1, 32, '2026-06-04 14:31:19'),
(179, 1, 34, '2026-06-04 14:31:19'),
(180, 1, 35, '2026-06-04 14:31:19'),
(181, 1, 36, '2026-06-04 14:31:19'),
(182, 1, 33, '2026-06-04 14:31:19'),
(183, 1, 31, '2026-06-04 14:31:19'),
(184, 1, 29, '2026-06-04 14:31:19'),
(185, 1, 30, '2026-06-04 14:31:19');

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` int(10) UNSIGNED NOT NULL,
  `ticket_no` varchar(50) NOT NULL,
  `request_id` int(10) UNSIGNED NOT NULL,
  `assigned_staff_id` int(10) UNSIGNED DEFAULT NULL,
  `assigned_by` int(10) UNSIGNED DEFAULT NULL,
  `due_at` datetime DEFAULT NULL,
  `assigned_note` text DEFAULT NULL,
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

INSERT INTO `tickets` (`id`, `ticket_no`, `request_id`, `assigned_staff_id`, `assigned_by`, `due_at`, `assigned_note`, `title`, `description`, `status`, `created_at`, `resolved_at`, `customer_confirm_due_at`, `closed_at`) VALUES
(38, 'TK-MOCK13-0002', 68, 2, 1, '2026-06-06 17:00:00', 'มอบหมายตรวจสอบประสิทธิภาพการบันทึกข้อมูล', 'ตรวจสอบระบบบันทึกข้อมูลช้า', 'อยู่ระหว่างตรวจสอบ query และ application log', 'assigned', '2026-06-04 09:05:00', NULL, NULL, NULL),
(39, 'TK-MOCK13-0003', 69, 3, 1, '2026-06-05 17:00:00', 'ตรวจสอบ printer spooler และ driver', 'แก้ปัญหาเครื่องพิมพ์ใบเสร็จ', 'กำลังรีเซ็ต print spooler และติดตั้ง driver ใหม่', 'in_progress', '2026-06-04 08:55:00', NULL, NULL, NULL),
(40, 'TK-MOCK13-0004', 70, 4, 1, '2026-06-05 17:00:00', 'ตรวจสอบการ export PDF และสิทธิ์โฟลเดอร์', 'แก้ปัญหารายงาน PDF', 'ปรับสิทธิ์โฟลเดอร์ปลายทางและทดสอบการสร้างไฟล์ PDF ใหม่เรียบร้อยแล้ว', 'assigned', '2026-06-04 08:20:00', '2026-06-04 13:40:00', '2026-06-07 13:50:00', NULL),
(41, 'TK-MOCK13-0005', 71, 2, 1, '2026-06-04 17:00:00', 'แก้ปัญหาการเข้ารหัสชื่อไฟล์ภาษาไทย', 'แก้ปัญหาชื่อไฟล์เพี้ยน', 'ปรับการถอดรหัสชื่อไฟล์ภาษาไทยทั้งตอนบันทึกและตอนแสดงผล รวมถึงทดสอบกับไฟล์เดิมที่เคยเพี้ยนแล้ว', 'closed', '2026-06-03 15:40:00', '2026-06-04 08:20:00', '2026-06-07 08:40:00', '2026-06-04 09:00:00'),
(42, 'TK-MOCK13-0006', 72, 3, 1, '2026-06-03 17:00:00', 'ตรวจสอบ dashboard summary cache', 'แก้ปัญหาหน้าแดชบอร์ดไม่อัปเดต', 'แก้ cache key ของ dashboard summary และเพิ่มการ refresh หลังบันทึกรายการสำเร็จ', 'closed', '2026-06-02 10:30:00', '2026-06-02 13:30:00', '2026-06-05 13:50:00', '2026-06-02 14:20:00'),
(43, 'TK-MOCK13-0007', 73, 4, 1, '2026-06-03 17:00:00', 'รอรับข้อเสนอแนะล่าสุดจากลูกค้า', 'แก้ไขตามข้อเสนอแนะหลังตีกลับงาน', 'รอเจ้าหน้าที่รับงานใหม่ตามข้อเสนอแนะล่าสุดของลูกค้า', 'assigned', '2026-06-01 13:30:00', NULL, NULL, NULL),
(44, 'TK-330604', 68, 1, NULL, '0000-00-00 00:00:00', NULL, '', 'uhhy', 'in_progress', '2026-06-04 13:42:10', NULL, NULL, NULL),
(45, 'TK-334998', 68, 1, NULL, '0000-00-00 00:00:00', NULL, '', 'uhygygyyg', 'in_progress', '2026-06-04 13:42:14', NULL, NULL, NULL),
(46, 'TK-342603', 68, 2, NULL, '0000-00-00 00:00:00', NULL, '', 'hhhh', 'in_progress', '2026-06-04 13:42:22', NULL, NULL, NULL),
(47, 'TK-356543', 68, 2, NULL, '2026-06-05 00:00:00', NULL, '', 'hhh', 'in_progress', '2026-06-04 13:42:36', NULL, NULL, NULL),
(48, 'TK-360688', 68, 2, NULL, '0000-00-00 00:00:00', NULL, '', 'u', 'in_progress', '2026-06-04 13:42:40', NULL, NULL, NULL),
(49, 'TK-387732', 68, 1, NULL, '0000-00-00 00:00:00', NULL, '', '888u8uu8u8', 'in_progress', '2026-06-04 13:43:07', NULL, NULL, NULL),
(50, 'TK-697238', 68, 1, NULL, '2026-06-05 00:00:00', NULL, 'กTest', 'Yest', 'in_progress', '2026-06-04 14:54:57', NULL, NULL, NULL),
(51, 'TK-745444', 68, 1, NULL, '0000-00-00 00:00:00', NULL, '', 'lll', 'in_progress', '2026-06-04 14:55:45', NULL, NULL, NULL),
(52, 'TK-555842', 68, 1, NULL, '2026-06-11 00:00:00', NULL, 'ธำหะ', 'กกกกก', 'in_progress', '2026-06-04 15:09:15', NULL, NULL, NULL),
(53, 'TK-569476', 68, 1, NULL, '2026-06-05 00:00:00', NULL, 'กกก', 'กกก', 'in_progress', '2026-06-04 15:09:29', NULL, NULL, NULL);

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
(9, 1, 1, 4, 3, 'ระบุผู้รับผิดชอบหลักหลังตรวจสอบเบื้องต้น', '2026-05-08 10:45:00'),
(10, 10, 1, 2, 1, 'มอบหมายให้เจ้าหน้าที่หลักรับงาน', '2026-06-04 09:05:00'),
(11, 11, 2, 3, 1, 'มอบหมายให้เจ้าหน้าที่อุปกรณ์รับผิดชอบ', '2026-06-04 08:55:00'),
(12, 12, 1, 4, 1, 'มอบหมายให้เจ้าหน้าที่รายงาน', '2026-06-04 08:20:00'),
(13, 13, 1, 2, 1, 'มอบหมายให้ตรวจสอบ encoding ชื่อไฟล์', '2026-06-03 15:40:00'),
(14, 14, 2, 3, 1, 'มอบหมายให้ทีมแอปพลิเคชัน', '2026-06-02 10:30:00'),
(15, 15, 1, 4, 1, 'มอบหมายงานรอบใหม่หลังลูกค้าตีกลับ', '2026-06-02 09:20:00'),
(20, 84, 1, 2, 1, 'เธกเธญเธเธซเธกเธฒเธขเนเธซเนเนเธเนเธฒเธซเธเนเธฒเธเธตเนเธซเธฅเธฑเธเธฃเธฑเธเธเธฒเธ', '2026-06-04 09:05:00'),
(21, 86, 2, 3, 1, 'เธกเธญเธเธซเธกเธฒเธขเนเธซเนเนเธเนเธฒเธซเธเนเธฒเธเธตเนเธญเธธเธเธเธฃเธเนเธฃเธฑเธเธเธดเธเธเธญเธ', '2026-06-04 08:55:00'),
(22, 89, 1, 4, 1, 'เธกเธญเธเธซเธกเธฒเธขเนเธซเนเนเธเนเธฒเธซเธเนเธฒเธเธตเนเธฃเธฒเธขเธเธฒเธ', '2026-06-04 08:20:00'),
(23, 93, 1, 2, 1, 'เธกเธญเธเธซเธกเธฒเธขเนเธซเนเธเธฃเธงเธเธชเธญเธ encoding เธเธทเนเธญเนเธเธฅเน', '2026-06-03 15:40:00'),
(24, 98, 2, 3, 1, 'เธกเธญเธเธซเธกเธฒเธขเนเธซเนเธเธตเธกเนเธญเธเธเธฅเธดเนเธเธเธฑเธ', '2026-06-02 10:30:00'),
(25, 103, 1, 4, 1, 'เธกเธญเธเธซเธกเธฒเธขเธเธฒเธเธฃเธญเธเนเธซเธกเนเธซเธฅเธฑเธเธฅเธนเธเธเนเธฒเธเธตเธเธฅเธฑเธ', '2026-06-02 09:20:00'),
(38, 38, 1, 2, 1, 'มอบหมายให้เจ้าหน้าที่หลักรับงาน', '2026-06-04 09:05:00'),
(39, 39, 2, 3, 1, 'มอบหมายให้เจ้าหน้าที่อุปกรณ์รับผิดชอบ', '2026-06-04 08:55:00'),
(40, 40, 1, 4, 1, 'มอบหมายให้เจ้าหน้าที่รายงาน', '2026-06-04 08:20:00'),
(41, 41, 1, 2, 1, 'มอบหมายให้ตรวจสอบ encoding ชื่อไฟล์', '2026-06-03 15:40:00'),
(42, 42, 2, 3, 1, 'มอบหมายให้ทีมแอปพลิเคชัน', '2026-06-02 10:30:00'),
(43, 43, 1, 4, 1, 'มอบหมายงานรอบใหม่หลังลูกค้าตีกลับ', '2026-06-02 09:20:00');

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
(4, 7, 5, 'ไม่พบปัญหาเครือข่าย จึงขอปิดงานย่อย', 'rejected', 3, '2026-05-08 10:45:00', 'ยังไม่มีหลักฐานเพียงพอ ต้องแนบผลทดสอบเพิ่ม', '2026-05-08 10:25:00'),
(5, 12, 4, 'ปลดล็อกสิทธิ์การสร้างไฟล์และทดสอบดาวน์โหลด PDF สำเร็จแล้ว กรุณาลองดาวน์โหลดอีกครั้ง', 'approved', 1, '2026-06-04 13:40:00', NULL, '2026-06-04 13:30:00'),
(6, 13, 2, 'ปรับการถอดรหัสชื่อไฟล์ภาษาไทยทั้งตอนบันทึกและตอนแสดงผล รวมถึงทดสอบกับไฟล์เดิมที่เคยเพี้ยนแล้ว', 'approved', 1, '2026-06-04 08:20:00', NULL, '2026-06-04 08:05:00'),
(7, 14, 3, 'แก้ cache key ของ dashboard summary และเพิ่มการ refresh หลังบันทึกรายการสำเร็จ', 'approved', 1, '2026-06-02 13:30:00', NULL, '2026-06-02 13:10:00'),
(8, 15, 4, 'ทดสอบแก้ไขรอบแรกและส่งผลให้ลูกค้ายืนยันแล้ว', 'approved', 1, '2026-06-01 16:50:00', NULL, '2026-06-01 16:40:00'),
(10, 89, 4, 'เธเธฅเธเธฅเนเธญเธเธชเธดเธเธเธดเนเธเธฒเธฃเธชเธฃเนเธฒเธเนเธเธฅเนเนเธฅเธฐเธเธเธชเธญเธเธเธฒเธงเธเนเนเธซเธฅเธ PDF เธชเธณเนเธฃเนเธเนเธฅเนเธง เธเธฃเธธเธเธฒเธฅเธญเธเธเธฒเธงเธเนเนเธซเธฅเธเธญเธตเธเธเธฃเธฑเนเธ', 'approved', 1, '2026-06-04 13:40:00', NULL, '2026-06-04 13:30:00'),
(11, 93, 2, 'เธเธฃเธฑเธเธเธฒเธฃเธเธญเธเธฃเธซเธฑเธชเธเธทเนเธญเนเธเธฅเนเธ�เธฒเธฉเธฒเนเธเธขเธเธฑเนเธเธเธญเธเธเธฑเธเธเธถเธเนเธฅเธฐเธเธญเธเนเธชเธเธเธเธฅ เธฃเธงเธกเธเธถเธเธเธเธชเธญเธเธเธฑเธเนเธเธฅเนเนเธเธดเธกเธเธตเนเนเธเธขเนเธเธตเนเธขเธเนเธฅเนเธง', 'approved', 1, '2026-06-04 08:20:00', NULL, '2026-06-04 08:05:00'),
(12, 98, 3, 'เนเธเน cache key เธเธญเธ dashboard summary เนเธฅเธฐเนเธเธดเนเธกเธเธฒเธฃ refresh เธซเธฅเธฑเธเธเธฑเธเธเธถเธเธฃเธฒเธขเธเธฒเธฃเธชเธณเนเธฃเนเธ', 'approved', 1, '2026-06-02 13:30:00', NULL, '2026-06-02 13:10:00'),
(13, 103, 4, 'เธเธเธชเธญเธเนเธเนเนเธเธฃเธญเธเนเธฃเธเนเธฅเธฐเธชเนเธเธเธฅเนเธซเนเธฅเธนเธเธเนเธฒเธขเธทเธเธขเธฑเธเนเธฅเนเธง', 'approved', 1, '2026-06-01 16:50:00', NULL, '2026-06-01 16:40:00'),
(22, 40, 4, 'ปลดล็อกสิทธิ์การสร้างไฟล์และทดสอบดาวน์โหลด PDF สำเร็จแล้ว กรุณาลองดาวน์โหลดอีกครั้ง', 'approved', 1, '2026-06-04 13:40:00', NULL, '2026-06-04 13:30:00'),
(23, 41, 2, 'ปรับการถอดรหัสชื่อไฟล์ภาษาไทยทั้งตอนบันทึกและตอนแสดงผล รวมถึงทดสอบกับไฟล์เดิมที่เคยเพี้ยนแล้ว', 'approved', 1, '2026-06-04 08:20:00', NULL, '2026-06-04 08:05:00'),
(24, 42, 3, 'แก้ cache key ของ dashboard summary และเพิ่มการ refresh หลังบันทึกรายการสำเร็จ', 'approved', 1, '2026-06-02 13:30:00', NULL, '2026-06-02 13:10:00'),
(25, 43, 4, 'ทดสอบแก้ไขรอบแรกและส่งผลให้ลูกค้ายืนยันแล้ว', 'approved', 1, '2026-06-01 16:50:00', NULL, '2026-06-01 16:40:00');

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
(23, 3, 'waiting_confirm', 'closed', NULL, 'System auto-closed after customer confirmation deadline expired', '2026-05-08 13:36:46'),
(24, 9, NULL, 'in_progress', NULL, 'สร้าง ticket และมอบหมายทีม', '2026-06-03 13:46:46'),
(54, 84, NULL, 'assigned', 1, 'เธชเธฃเนเธฒเธ ticket เนเธฅเธฐเธกเธญเธเธซเธกเธฒเธขเธเธฒเธ', '2026-06-04 09:05:00'),
(55, 86, NULL, 'assigned', 1, 'เธชเธฃเนเธฒเธ ticket', '2026-06-04 08:55:00'),
(56, 86, 'assigned', 'in_progress', 3, 'เนเธฃเธดเนเธกเธเธณเนเธเธดเธเธเธฒเธฃเนเธเนเนเธ', '2026-06-04 09:40:00'),
(57, 89, NULL, 'assigned', 1, 'เธชเธฃเนเธฒเธ ticket', '2026-06-04 08:20:00'),
(58, 89, 'assigned', 'in_progress', 4, 'เนเธฃเธดเนเธกเธเธณเนเธเธดเธเธเธฒเธฃเนเธเนเนเธ', '2026-06-04 10:15:00'),
(59, 89, 'in_progress', 'resolved', 4, 'เนเธเนเนเธเนเธชเธฃเนเธเนเธฅเธฐเธเธญเธญเธเธธเธกเธฑเธเธดเธเธดเธเธเธฒเธ', '2026-06-04 13:35:00'),
(60, 89, 'resolved', 'waiting_confirm', 1, 'เธญเธเธธเธกเธฑเธเธดเนเธฅเธฐเธชเนเธเนเธซเนเธฅเธนเธเธเนเธฒเธขเธทเธเธขเธฑเธ', '2026-06-04 13:50:00'),
(61, 93, NULL, 'assigned', 1, 'เธชเธฃเนเธฒเธ ticket', '2026-06-03 15:40:00'),
(62, 93, 'assigned', 'in_progress', 2, 'เนเธฃเธดเนเธกเธเธณเนเธเธดเธเธเธฒเธฃเนเธเนเนเธ', '2026-06-03 16:00:00'),
(63, 93, 'in_progress', 'resolved', 2, 'เนเธเนเนเธเนเธชเธฃเนเธเนเธฅเธฐเธชเนเธเธเธญเธญเธเธธเธกเธฑเธเธด', '2026-06-04 08:10:00'),
(64, 93, 'resolved', 'waiting_confirm', 1, 'เธชเนเธเนเธซเนเธฅเธนเธเธเนเธฒเธขเธทเธเธขเธฑเธ', '2026-06-04 08:40:00'),
(65, 93, 'waiting_confirm', 'closed', 13, 'เธฅเธนเธเธเนเธฒเธขเธทเธเธขเธฑเธเธเธฒเธเนเธฃเธตเธขเธเธฃเนเธญเธข', '2026-06-04 09:00:00'),
(66, 98, NULL, 'assigned', 1, 'เธชเธฃเนเธฒเธ ticket', '2026-06-02 10:30:00'),
(67, 98, 'assigned', 'in_progress', 3, 'เนเธฃเธดเนเธกเนเธเนเนเธ', '2026-06-02 11:10:00'),
(68, 98, 'in_progress', 'resolved', 3, 'เนเธเนเนเธเนเธชเธฃเนเธเนเธฅเธฐเธชเนเธเธเธญเธญเธเธธเธกเธฑเธเธด', '2026-06-02 13:20:00'),
(69, 98, 'resolved', 'waiting_confirm', 1, 'เธชเนเธเนเธซเนเธฅเธนเธเธเนเธฒเธขเธทเธเธขเธฑเธ', '2026-06-02 13:50:00'),
(70, 98, 'waiting_confirm', 'closed', 13, 'เธฅเธนเธเธเนเธฒเธขเธทเธเธขเธฑเธเนเธฅเธฐเธเธฃเธฐเนเธกเธดเธเนเธฅเนเธง', '2026-06-02 14:20:00'),
(71, 103, NULL, 'assigned', 1, 'เธชเธฃเนเธฒเธ ticket', '2026-06-01 13:30:00'),
(72, 103, 'assigned', 'in_progress', 4, 'เนเธฃเธดเนเธกเนเธเนเนเธเธฃเธญเธเนเธฃเธ', '2026-06-01 14:15:00'),
(73, 103, 'in_progress', 'resolved', 4, 'เธชเนเธเธเธฅเธเธฒเธฃเนเธเนเนเธเธฃเธญเธเนเธฃเธ', '2026-06-01 16:45:00'),
(74, 103, 'resolved', 'waiting_confirm', 1, 'เธชเนเธเนเธซเนเธฅเธนเธเธเนเธฒเธขเธทเธเธขเธฑเธ', '2026-06-01 17:00:00'),
(75, 103, 'waiting_confirm', 'assigned', 13, 'เธฅเธนเธเธเนเธฒเธเธตเธเธฅเธฑเธเธเธฒเธ', '2026-06-02 09:15:00'),
(120, 38, NULL, 'assigned', 1, 'สร้าง ticket และมอบหมายงาน', '2026-06-04 09:05:00'),
(121, 39, NULL, 'assigned', 1, 'สร้าง ticket', '2026-06-04 08:55:00'),
(122, 39, 'assigned', 'in_progress', 3, 'เริ่มดำเนินการแก้ไข', '2026-06-04 09:40:00'),
(123, 40, NULL, 'assigned', 1, 'สร้าง ticket', '2026-06-04 08:20:00'),
(124, 40, 'assigned', 'in_progress', 4, 'เริ่มดำเนินการแก้ไข', '2026-06-04 10:15:00'),
(125, 40, 'in_progress', 'resolved', 4, 'แก้ไขเสร็จและขออนุมัติปิดงาน', '2026-06-04 13:35:00'),
(126, 40, 'resolved', 'waiting_confirm', 1, 'อนุมัติและส่งให้ลูกค้ายืนยัน', '2026-06-04 13:50:00'),
(127, 41, NULL, 'assigned', 1, 'สร้าง ticket', '2026-06-03 15:40:00'),
(128, 41, 'assigned', 'in_progress', 2, 'เริ่มดำเนินการแก้ไข', '2026-06-03 16:00:00'),
(129, 41, 'in_progress', 'resolved', 2, 'แก้ไขเสร็จและส่งขออนุมัติ', '2026-06-04 08:10:00'),
(130, 41, 'resolved', 'waiting_confirm', 1, 'ส่งให้ลูกค้ายืนยัน', '2026-06-04 08:40:00'),
(131, 41, 'waiting_confirm', 'closed', 13, 'ลูกค้ายืนยันงานเรียบร้อย', '2026-06-04 09:00:00'),
(132, 42, NULL, 'assigned', 1, 'สร้าง ticket', '2026-06-02 10:30:00'),
(133, 42, 'assigned', 'in_progress', 3, 'เริ่มแก้ไข', '2026-06-02 11:10:00'),
(134, 42, 'in_progress', 'resolved', 3, 'แก้ไขเสร็จและส่งขออนุมัติ', '2026-06-02 13:20:00'),
(135, 42, 'resolved', 'waiting_confirm', 1, 'ส่งให้ลูกค้ายืนยัน', '2026-06-02 13:50:00'),
(136, 42, 'waiting_confirm', 'closed', 13, 'ลูกค้ายืนยันและประเมินแล้ว', '2026-06-02 14:20:00'),
(137, 43, NULL, 'assigned', 1, 'สร้าง ticket', '2026-06-01 13:30:00'),
(138, 43, 'assigned', 'in_progress', 4, 'เริ่มแก้ไขรอบแรก', '2026-06-01 14:15:00'),
(139, 43, 'in_progress', 'resolved', 4, 'ส่งผลการแก้ไขรอบแรก', '2026-06-01 16:45:00'),
(140, 43, 'resolved', 'waiting_confirm', 1, 'ส่งให้ลูกค้ายืนยัน', '2026-06-01 17:00:00'),
(141, 43, 'waiting_confirm', 'assigned', 13, 'ลูกค้าตีกลับงาน', '2026-06-02 09:15:00'),
(142, 40, 'waiting_confirm', 'assigned', NULL, 'po', '2026-06-04 12:24:15'),
(143, 44, NULL, 'in_progress', NULL, 'สร้าง ticket และมอบหมายทีม', '2026-06-04 13:42:10'),
(144, 45, NULL, 'in_progress', NULL, 'สร้าง ticket และมอบหมายทีม', '2026-06-04 13:42:15'),
(145, 46, NULL, 'in_progress', NULL, 'สร้าง ticket และมอบหมายทีม', '2026-06-04 13:42:22'),
(146, 47, NULL, 'in_progress', NULL, 'สร้าง ticket และมอบหมายทีม', '2026-06-04 13:42:36'),
(147, 48, NULL, 'in_progress', NULL, 'สร้าง ticket และมอบหมายทีม', '2026-06-04 13:42:40'),
(148, 49, NULL, 'in_progress', NULL, 'สร้าง ticket และมอบหมายทีม', '2026-06-04 13:43:07'),
(149, 50, NULL, 'in_progress', NULL, 'สร้าง ticket และมอบหมายทีม', '2026-06-04 14:54:57'),
(150, 51, NULL, 'in_progress', NULL, 'สร้าง ticket และมอบหมายทีม', '2026-06-04 14:55:45'),
(151, 52, NULL, 'in_progress', NULL, 'สร้าง ticket และมอบหมายทีม', '2026-06-04 15:09:15'),
(152, 53, NULL, 'in_progress', NULL, 'สร้าง ticket และมอบหมายทีม', '2026-06-04 15:09:29');

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
  ADD KEY `report_id` (`request_id`),
  ADD KEY `ticket_id` (`ticket_id`),
  ADD KEY `idx_attachments_request_confirmation` (`request_confirmation_id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `uk_customers_citizen_id` (`citizen_id`),
  ADD KEY `idx_customers_status_created` (`status`,`created_at`),
  ADD KEY `fk_customers_prefix` (`prefix_id`),
  ADD KEY `fk_customers_organization` (`organization_id`);

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
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `prefixes`
--
ALTER TABLE `prefixes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_prefix_name` (`name`);

--
-- Indexes for table `problem_types`
--
ALTER TABLE `problem_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_problem_types_type_status` (`request_type`,`status`);

--
-- Indexes for table `requests`
--
ALTER TABLE `requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `report_no` (`request_no`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `system_id` (`system_id`),
  ADD KEY `problem_type_id` (`problem_type_id`),
  ADD KEY `idx_reports_status_created` (`status`,`created_at`),
  ADD KEY `idx_reports_customer_status_created` (`customer_id`,`status`,`created_at`),
  ADD KEY `idx_reports_problem_status` (`problem_type_id`,`status`);

--
-- Indexes for table `request_confirmations`
--
ALTER TABLE `request_confirmations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `report_id` (`request_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `request_status_logs`
--
ALTER TABLE `request_status_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `report_id` (`request_id`),
  ADD KEY `idx_report_status_logs_report_created` (`request_id`,`created_at`);

--
-- Indexes for table `screenings`
--
ALTER TABLE `screenings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `report_id` (`request_id`),
  ADD KEY `screened_by` (`screened_by`);

--
-- Indexes for table `staffs`
--
ALTER TABLE `staffs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `uk_staffs_citizen_id` (`citizen_id`),
  ADD KEY `idx_staffs_status_created` (`status`,`created_at`),
  ADD KEY `fk_staffs_prefix` (`prefix_id`);

--
-- Indexes for table `staff_team_roles`
--
ALTER TABLE `staff_team_roles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `team_id` (`team_id`),
  ADD KEY `staff_id` (`staff_id`);

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
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `team_permissions`
--
ALTER TABLE `team_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_team_permission` (`team_id`,`permission_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ticket_no` (`ticket_no`),
  ADD KEY `report_id` (`request_id`),
  ADD KEY `assigned_staff_id` (`assigned_staff_id`),
  ADD KEY `assigned_by` (`assigned_by`),
  ADD KEY `idx_tickets_status_created` (`status`,`created_at`),
  ADD KEY `idx_tickets_team_status_created` (`status`,`created_at`),
  ADD KEY `idx_tickets_staff_status_created` (`assigned_staff_id`,`status`,`created_at`),
  ADD KEY `idx_tickets_parent_status` (`status`);

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
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=162;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `login_logs`
--
ALTER TABLE `login_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1283;

--
-- AUTO_INCREMENT for table `organizations`
--
ALTER TABLE `organizations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `password_logs`
--
ALTER TABLE `password_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `prefixes`
--
ALTER TABLE `prefixes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT for table `problem_types`
--
ALTER TABLE `problem_types`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `requests`
--
ALTER TABLE `requests`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- AUTO_INCREMENT for table `request_confirmations`
--
ALTER TABLE `request_confirmations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `request_status_logs`
--
ALTER TABLE `request_status_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=189;

--
-- AUTO_INCREMENT for table `screenings`
--
ALTER TABLE `screenings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `staffs`
--
ALTER TABLE `staffs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `staff_team_roles`
--
ALTER TABLE `staff_team_roles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `systems`
--
ALTER TABLE `systems`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `teams`
--
ALTER TABLE `teams`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `team_permissions`
--
ALTER TABLE `team_permissions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=186;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `ticket_assignments`
--
ALTER TABLE `ticket_assignments`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `ticket_resolution_requests`
--
ALTER TABLE `ticket_resolution_requests`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `ticket_status_logs`
--
ALTER TABLE `ticket_status_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=153;

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
  ADD CONSTRAINT `attachments_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `requests` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `attachments_ibfk_2` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_attachments_request_confirmation` FOREIGN KEY (`request_confirmation_id`) REFERENCES `request_confirmations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `fk_customers_organization` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_customers_prefix` FOREIGN KEY (`prefix_id`) REFERENCES `prefixes` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `requests`
--
ALTER TABLE `requests`
  ADD CONSTRAINT `requests_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `requests_ibfk_2` FOREIGN KEY (`system_id`) REFERENCES `systems` (`id`),
  ADD CONSTRAINT `requests_ibfk_3` FOREIGN KEY (`problem_type_id`) REFERENCES `problem_types` (`id`);

--
-- Constraints for table `request_confirmations`
--
ALTER TABLE `request_confirmations`
  ADD CONSTRAINT `request_confirmations_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `requests` (`id`),
  ADD CONSTRAINT `request_confirmations_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);

--
-- Constraints for table `request_status_logs`
--
ALTER TABLE `request_status_logs`
  ADD CONSTRAINT `request_status_logs_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `requests` (`id`);

--
-- Constraints for table `screenings`
--
ALTER TABLE `screenings`
  ADD CONSTRAINT `screenings_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `requests` (`id`),
  ADD CONSTRAINT `screenings_ibfk_2` FOREIGN KEY (`screened_by`) REFERENCES `staffs` (`id`);

--
-- Constraints for table `staffs`
--
ALTER TABLE `staffs`
  ADD CONSTRAINT `fk_staffs_prefix` FOREIGN KEY (`prefix_id`) REFERENCES `prefixes` (`id`);

--
-- Constraints for table `staff_team_roles`
--
ALTER TABLE `staff_team_roles`
  ADD CONSTRAINT `staff_team_roles_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staffs` (`id`),
  ADD CONSTRAINT `staff_team_roles_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`);

--
-- Constraints for table `systems`
--
ALTER TABLE `systems`
  ADD CONSTRAINT `fk_systems_organization` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `team_permissions`
--
ALTER TABLE `team_permissions`
  ADD CONSTRAINT `team_permissions_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `team_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `fk_ticket_assigner` FOREIGN KEY (`assigned_by`) REFERENCES `staffs` (`id`),
  ADD CONSTRAINT `fk_ticket_staff` FOREIGN KEY (`assigned_staff_id`) REFERENCES `staffs` (`id`),
  ADD CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `requests` (`id`);

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
