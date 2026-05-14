-- ============================================================
-- IPD Paperless Project Tracking System
-- Cloud Schema (MySQL 8.0 compatible)
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `gateway_installations`;
DROP TABLE IF EXISTS `yearly_targets`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `site_team_members`;
DROP TABLE IF EXISTS `sites`;
DROP TABLE IF EXISTS `hospitals`;
DROP TABLE IF EXISTS `provinces`;
DROP TABLE IF EXISTS `teams`;
DROP TABLE IF EXISTS `user_sessions`;
DROP TABLE IF EXISTS `system_config`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- users
CREATE TABLE `users` (
  `id`            VARCHAR(50)  NOT NULL,
  `username`      VARCHAR(50)  NOT NULL,
  `password_hash` VARCHAR(64)  NOT NULL,
  `password_salt` VARCHAR(32)  NOT NULL,
  `display_name`  VARCHAR(100) NOT NULL,
  `role`          ENUM('admin','user') NOT NULL DEFAULT 'user',
  `email`         VARCHAR(100) DEFAULT NULL,
  `phone`         VARCHAR(20)  DEFAULT NULL,
  `is_active`     TINYINT(1)   NOT NULL DEFAULT 1,
  `last_login_at` DATETIME     DEFAULT NULL,
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by`    VARCHAR(50)  DEFAULT NULL,
  `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- user_sessions
CREATE TABLE `user_sessions` (
  `id`            VARCHAR(64)  NOT NULL,
  `user_id`       VARCHAR(50)  NOT NULL,
  `ip_address`    VARCHAR(45)  DEFAULT NULL,
  `user_agent`    VARCHAR(255) DEFAULT NULL,
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at`    DATETIME     NOT NULL,
  `last_activity` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sessions_user` (`user_id`),
  KEY `idx_sessions_expires` (`expires_at`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- provinces
CREATE TABLE `provinces` (
  `id`        SMALLINT    NOT NULL AUTO_INCREMENT,
  `name_th`   VARCHAR(50) NOT NULL,
  `name_en`   VARCHAR(50) DEFAULT NULL,
  `region`    VARCHAR(20) DEFAULT NULL,
  `is_active` TINYINT(1)  NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_provinces_name` (`name_th`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- hospitals
CREATE TABLE `hospitals` (
  `id`            VARCHAR(50)  NOT NULL,
  `name`          VARCHAR(200) NOT NULL,
  `province_id`   SMALLINT     NOT NULL,
  `district`      VARCHAR(100) DEFAULT NULL,
  `address`       TEXT         DEFAULT NULL,
  `phone`         VARCHAR(20)  DEFAULT NULL,
  `contact_name`  VARCHAR(100) DEFAULT NULL,
  `contact_phone` VARCHAR(20)  DEFAULT NULL,
  `note`          TEXT         DEFAULT NULL,
  `is_active`     TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by`    VARCHAR(50)  DEFAULT NULL,
  `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_hospitals_province` (`province_id`),
  CONSTRAINT `fk_hospitals_province` FOREIGN KEY (`province_id`) REFERENCES `provinces` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- teams
CREATE TABLE `teams` (
  `id`            SMALLINT    NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(50) NOT NULL,
  `leader_id`     VARCHAR(50) DEFAULT NULL,
  `capacity`      SMALLINT    NOT NULL DEFAULT 4,
  `description`   VARCHAR(255) DEFAULT NULL,
  `is_active`     TINYINT(1)  NOT NULL DEFAULT 1,
  `display_order` SMALLINT    NOT NULL DEFAULT 0,
  `created_at`    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_teams_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- sites
CREATE TABLE `sites` (
  `id`                  VARCHAR(50)    NOT NULL,
  `hospital_id`         VARCHAR(50)    NOT NULL,
  `month`               ENUM('ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.') NOT NULL,
  `year`                SMALLINT       NOT NULL DEFAULT 2569,
  `install_type`        ENUM('onsite','online') NOT NULL DEFAULT 'onsite',
  `wards`               SMALLINT       NOT NULL DEFAULT 1,
  `unit_price`          DECIMAL(10,2)  NOT NULL,
  `amount`              DECIMAL(12,2)  NOT NULL,
  `team_id`             SMALLINT       NOT NULL,
  `responsible_user_id` VARCHAR(50)    DEFAULT NULL,
  `responsible_name`    VARCHAR(100)   DEFAULT NULL,
  `status`              ENUM('อยู่ในแผน','รอเข้าปฏิบัติงาน','กำลังปฏิบัติงาน','ติดตั้งแล้ว','แถม','ยกเลิก') NOT NULL DEFAULT 'อยู่ในแผน',
  `date_start`          DATE           DEFAULT NULL,
  `date_end`            DATE           DEFAULT NULL,
  `note`                TEXT           DEFAULT NULL,
  `owner_id`            VARCHAR(50)    NOT NULL,
  `created_at`          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by`          VARCHAR(50)    NOT NULL,
  `updated_at`          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by`          VARCHAR(50)    DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sites_hospital` (`hospital_id`),
  KEY `idx_sites_team` (`team_id`),
  KEY `idx_sites_status` (`status`),
  KEY `idx_sites_month_year` (`year`, `month`),
  KEY `idx_sites_owner` (`owner_id`),
  CONSTRAINT `fk_sites_hospital` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`),
  CONSTRAINT `fk_sites_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`),
  CONSTRAINT `fk_sites_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- site_team_members
CREATE TABLE `site_team_members` (
  `id`          INT         NOT NULL AUTO_INCREMENT,
  `site_id`     VARCHAR(50) NOT NULL,
  `user_id`     VARCHAR(50) DEFAULT NULL,
  `member_name` VARCHAR(100) NOT NULL,
  `member_role` VARCHAR(50)  DEFAULT NULL,
  `joined_at`   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `added_by`    VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_stm_site` (`site_id`),
  CONSTRAINT `fk_stm_site` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- system_config
CREATE TABLE `system_config` (
  `config_key`   VARCHAR(50)  NOT NULL,
  `config_value` TEXT         NOT NULL,
  `data_type`    ENUM('number','string','boolean','json') NOT NULL DEFAULT 'string',
  `description`  VARCHAR(255) DEFAULT NULL,
  `updated_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by`   VARCHAR(50)  DEFAULT NULL,
  PRIMARY KEY (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- audit_logs
CREATE TABLE `audit_logs` (
  `id`          BIGINT      NOT NULL AUTO_INCREMENT,
  `user_id`     VARCHAR(50) DEFAULT NULL,
  `action`      ENUM('create','update','delete','login','logout','import','export') NOT NULL,
  `entity_type` VARCHAR(50) NOT NULL,
  `entity_id`   VARCHAR(50) DEFAULT NULL,
  `changes`     LONGTEXT    DEFAULT NULL,
  `ip_address`  VARCHAR(45) DEFAULT NULL,
  `created_at`  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- yearly_targets
CREATE TABLE `yearly_targets` (
  `year`          SMALLINT    NOT NULL,
  `target_amount` BIGINT      NOT NULL DEFAULT 0,
  `note`          VARCHAR(255) DEFAULT NULL,
  `updated_by`    VARCHAR(50) DEFAULT NULL,
  `created_at`    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- gateway_installations
CREATE TABLE `gateway_installations` (
  `id`                   VARCHAR(50)  NOT NULL,
  `gateway_type`         VARCHAR(100) NOT NULL DEFAULT 'HOSxPLineOfficialGateway',
  `hospital_id`          VARCHAR(50)  NOT NULL,
  `hamin`                VARCHAR(100) DEFAULT NULL,
  `installer_name`       VARCHAR(100) NOT NULL,
  `contact_name`         VARCHAR(100) NOT NULL,
  `contact_position`     VARCHAR(100) DEFAULT NULL,
  `contact_phone`        VARCHAR(50)  NOT NULL,
  `contact_email`        VARCHAR(150) DEFAULT NULL,
  `db_ip`                VARCHAR(100) NOT NULL,
  `db_name`              VARCHAR(100) NOT NULL,
  `db_user`              VARCHAR(100) NOT NULL,
  `db_pass`              VARCHAR(255) NOT NULL,
  `remote_ip`            VARCHAR(100) NOT NULL,
  `remote_computer_name` VARCHAR(100) DEFAULT NULL,
  `anydesk_user`         VARCHAR(100) DEFAULT NULL,
  `anydesk_pass`         VARCHAR(255) DEFAULT NULL,
  `telegram_token`       TEXT         DEFAULT NULL,
  `date_contact`         DATE         DEFAULT NULL,
  `date_completed`       DATE         DEFAULT NULL,
  `status`               VARCHAR(30)  NOT NULL DEFAULT 'รอดำเนินการ',
  `note`                 TEXT         DEFAULT NULL,
  `created_by`           VARCHAR(50)  DEFAULT NULL,
  `created_at`           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_gateway_hospital` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- VIEWS
-- ============================================================
CREATE OR REPLACE VIEW `v_sites_full` AS
SELECT s.id, s.month, s.year, s.install_type, s.wards, s.unit_price, s.amount,
  s.status, s.date_start, s.date_end, s.note,
  h.id AS hospital_id, h.name AS hospital_name,
  p.id AS province_id, p.name_th AS province_name, p.region,
  t.id AS team_id, t.name AS team_name, t.capacity AS team_capacity,
  s.responsible_name,
  ru.display_name AS responsible_display_name,
  s.owner_id, o.display_name AS owner_name, o.role AS owner_role,
  s.created_at, s.updated_at,
  (SELECT COUNT(*) FROM site_team_members WHERE site_id = s.id) AS member_count
FROM sites s
JOIN hospitals h ON h.id = s.hospital_id
JOIN provinces p ON p.id = h.province_id
JOIN teams t ON t.id = s.team_id
JOIN users o ON o.id = s.owner_id
LEFT JOIN users ru ON ru.id = s.responsible_user_id;

CREATE OR REPLACE VIEW `v_monthly_summary` AS
SELECT year, month,
  COUNT(*) AS site_count,
  SUM(wards) AS total_wards,
  SUM(amount) AS total_amount,
  SUM(CASE WHEN status IN ('ติดตั้งแล้ว','กำลังปฏิบัติงาน') THEN amount ELSE 0 END) AS installed_amount
FROM sites
WHERE status != 'ยกเลิก'
GROUP BY year, month;

CREATE OR REPLACE VIEW `v_team_workload` AS
SELECT t.id AS team_id, t.name AS team_name, t.capacity,
  s.year, s.month,
  COUNT(s.id) AS site_count,
  COALESCE(SUM(s.wards), 0) AS total_wards,
  COALESCE(SUM(s.amount), 0) AS total_amount,
  (t.capacity - COALESCE(SUM(s.wards), 0)) AS remaining_capacity
FROM teams t
LEFT JOIN sites s ON s.team_id = t.id AND s.status != 'ยกเลิก'
WHERE t.is_active = 1
GROUP BY t.id, t.name, t.capacity, s.year, s.month;

-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO `provinces` (`id`, `name_th`, `region`) VALUES
  (1,'กรุงเทพมหานคร','กลาง'),(2,'กระบี่','ใต้'),(3,'กาญจนบุรี','ตะวันตก'),
  (4,'กาฬสินธุ์','อีสาน'),(5,'กำแพงเพชร','กลาง'),(6,'ขอนแก่น','อีสาน'),
  (7,'จันทบุรี','ตะวันออก'),(8,'ฉะเชิงเทรา','ตะวันออก'),(9,'ชลบุรี','ตะวันออก'),
  (10,'ชัยนาท','กลาง'),(11,'ชัยภูมิ','อีสาน'),(12,'ชุมพร','ใต้'),
  (13,'เชียงราย','เหนือ'),(14,'เชียงใหม่','เหนือ'),(15,'ตรัง','ใต้'),
  (16,'ตราด','ตะวันออก'),(17,'ตาก','เหนือ'),(18,'นครนายก','กลาง'),
  (19,'นครปฐม','กลาง'),(20,'นครพนม','อีสาน'),(21,'นครราชสีมา','อีสาน'),
  (22,'นครศรีธรรมราช','ใต้'),(23,'นครสวรรค์','กลาง'),(24,'นนทบุรี','กลาง'),
  (25,'นราธิวาส','ใต้'),(26,'น่าน','เหนือ'),(27,'บึงกาฬ','อีสาน'),
  (28,'บุรีรัมย์','อีสาน'),(29,'ปทุมธานี','กลาง'),(30,'ประจวบคีรีขันธ์','ตะวันตก'),
  (31,'ปราจีนบุรี','ตะวันออก'),(32,'ปัตตานี','ใต้'),(33,'พระนครศรีอยุธยา','กลาง'),
  (34,'พังงา','ใต้'),(35,'พัทลุง','ใต้'),(36,'พิจิตร','กลาง'),
  (37,'พิษณุโลก','กลาง'),(38,'เพชรบุรี','ตะวันตก'),(39,'เพชรบูรณ์','กลาง'),
  (40,'แพร่','เหนือ'),(41,'พะเยา','เหนือ'),(42,'ภูเก็ต','ใต้'),
  (43,'มหาสารคาม','อีสาน'),(44,'มุกดาหาร','อีสาน'),(45,'แม่ฮ่องสอน','เหนือ'),
  (46,'ยโสธร','อีสาน'),(47,'ยะลา','ใต้'),(48,'ร้อยเอ็ด','อีสาน'),
  (49,'ระนอง','ใต้'),(50,'ระยอง','ตะวันออก'),(51,'ราชบุรี','ตะวันตก'),
  (52,'ลพบุรี','กลาง'),(53,'ลำปาง','เหนือ'),(54,'ลำพูน','เหนือ'),
  (55,'เลย','อีสาน'),(56,'ศรีสะเกษ','อีสาน'),(57,'สกลนคร','อีสาน'),
  (58,'สงขลา','ใต้'),(59,'สตูล','ใต้'),(60,'สมุทรปราการ','กลาง'),
  (61,'สมุทรสงคราม','กลาง'),(62,'สมุทรสาคร','กลาง'),(63,'สระแก้ว','ตะวันออก'),
  (64,'สระบุรี','กลาง'),(65,'สิงห์บุรี','กลาง'),(66,'สุโขทัย','กลาง'),
  (67,'สุพรรณบุรี','กลาง'),(68,'สุราษฎร์ธานี','ใต้'),(69,'สุรินทร์','อีสาน'),
  (70,'หนองคาย','อีสาน'),(71,'หนองบัวลำภู','อีสาน'),(72,'อ่างทอง','กลาง'),
  (73,'อำนาจเจริญ','อีสาน'),(74,'อุดรธานี','อีสาน'),(75,'อุตรดิตถ์','เหนือ'),
  (76,'อุทัยธานี','กลาง'),(77,'อุบลราชธานี','อีสาน');

-- admin user (password: admin123)
-- hash = SHA256('admin123:default_salt_change_me')
INSERT INTO `users` (`id`, `username`, `password_hash`, `password_salt`, `display_name`, `role`) VALUES
  ('u_admin_default', 'admin', '16ab457d6f19096bfdb55d72a2500c4b90fd5c678820762b3846953dd595c47a', 'default_salt_change_me', 'ผู้ดูแลระบบ', 'admin');

INSERT INTO `teams` (`id`, `name`, `capacity`, `display_order`) VALUES
  (1,'ทีม 1',4,1),(2,'ทีม 2',4,2),(3,'ทีม 3',4,3),(4,'ทีม 4',4,4);

INSERT INTO `system_config` (`config_key`, `config_value`, `data_type`, `description`) VALUES
  ('yearly_target','86000000','number','เป้าหมายยอดทั้งปี (บาท)'),
  ('onsite_price','590000','number','ราคาติดตั้งแบบ onsite ต่อ ward (บาท)'),
  ('online_price','490000','number','ราคาติดตั้งแบบ online ต่อ ward (บาท)'),
  ('team_capacity','4','number','จำนวน ward สูงสุดที่ทีมหนึ่งรับได้ต่อเดือน'),
  ('current_year','2569','number','ปีปัจจุบันที่ใช้ในระบบ (พ.ศ.)'),
  ('session_days','30','number','อายุของ session login (วัน)');

INSERT INTO `yearly_targets` (`year`, `target_amount`, `note`) VALUES
  (2569, 86000000, 'เป้าหมายปี 2569');

SELECT 'Schema created successfully' AS status;
