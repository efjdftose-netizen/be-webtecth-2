CREATE DATABASE IF NOT EXISTS `web-tech-2`;
USE `web-tech-2`;

CREATE TABLE IF NOT EXISTS `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) UNIQUE NOT NULL,
  `age` INT NOT NULL,
  `course` VARCHAR(100) NOT NULL,
  `year_level` INT NOT NULL,
  `gpa` DECIMAL(3,2) NOT NULL,
  `enrollment_status` ENUM('Active', 'Inactive') DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (`email`),
  INDEX idx_enrollment_status (`enrollment_status`)
);
