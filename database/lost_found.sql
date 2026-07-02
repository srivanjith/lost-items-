-- Create database if it does not exist
CREATE DATABASE IF NOT EXISTS `lost_found_db`;
USE `lost_found_db`;

-- Drop tables if they exist in reverse order of dependencies
DROP TABLE IF EXISTS `matches`;
DROP TABLE IF EXISTS `found_items`;
DROP TABLE IF EXISTS `lost_items`;
DROP TABLE IF EXISTS `users`;

-- Create users table
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `role` ENUM('student', 'admin') DEFAULT 'student',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create lost_items table
CREATE TABLE `lost_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `item_name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `location` VARCHAR(150) NOT NULL,
  `date_lost` DATE NOT NULL,
  `status` ENUM('lost', 'resolved') DEFAULT 'lost',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create found_items table
CREATE TABLE `found_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `item_name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `location` VARCHAR(150) NOT NULL,
  `date_found` DATE NOT NULL,
  `status` ENUM('found', 'resolved') DEFAULT 'found',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create matches table
CREATE TABLE `matches` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `lost_item_id` INT NOT NULL,
  `found_item_id` INT NOT NULL,
  `match_score` DECIMAL(5,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`lost_item_id`) REFERENCES `lost_items` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`found_item_id`) REFERENCES `found_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert Seed Users
-- The bcrypt hash for 'password123' is '$2a$10$D/jW673.K1XfV8iM4q2h4OuH29Z8Cg7rX9.K2j0E2L1G.bS4X1rL2'
INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `role`) VALUES
(1, 'Alice Johnson', 'alice@college.edu', '$2a$10$D/jW673.K1XfV8iM4q2h4OuH29Z8Cg7rX9.K2j0E2L1G.bS4X1rL2', '1234567890', 'student'),
(2, 'Bob Smith', 'bob@college.edu', '$2a$10$D/jW673.K1XfV8iM4q2h4OuH29Z8Cg7rX9.K2j0E2L1G.bS4X1rL2', '9876543210', 'student'),
(3, 'Admin User', 'admin@college.edu', '$2a$10$D/jW673.K1XfV8iM4q2h4OuH29Z8Cg7rX9.K2j0E2L1G.bS4X1rL2', '5555555555', 'admin');

-- Insert Seed Lost Items
INSERT INTO `lost_items` (`id`, `user_id`, `item_name`, `category`, `description`, `image`, `location`, `date_lost`, `status`) VALUES
(1, 1, 'iPhone 13 Black', 'Electronics', 'Black iPhone 13 with a cracked screen protector and a blue silicone case.', NULL, 'Library Study Room B', '2026-06-01', 'lost'),
(2, 2, 'Organic Chemistry Textbook', 'Books & Stationery', 'Wade 9th Edition, has my name Bob written on the inside cover.', NULL, 'Science Hall Room 204', '2026-06-03', 'lost'),
(3, 1, 'Silver Keychain with 3 keys', 'Keys & Cards', 'Keychain with a silver key, bronze key, and a little blue plastic tag.', NULL, 'Student Center Gym', '2026-06-04', 'lost');

-- Insert Seed Found Items
INSERT INTO `found_items` (`id`, `user_id`, `item_name`, `category`, `description`, `image`, `location`, `date_found`, `status`) VALUES
(1, 2, 'iPhone 13 with blue case', 'Electronics', 'Found a black iPhone 13 in a blue case on the floor. Screen protector is cracked.', NULL, 'Library Second Floor', '2026-06-02', 'found'),
(2, 1, 'Chemistry Textbook Wade', 'Books & Stationery', 'Organic Chemistry textbook found on a desk. Looks like Wade edition.', NULL, 'Science Hall Corridor', '2026-06-03', 'found'),
(3, 2, 'Black Leather Wallet', 'Keys & Cards', 'Found a black wallet with some cash and a student ID. Please contact to identify.', NULL, 'Cafeteria', '2026-06-05', 'found');

-- Insert Seed Matches
INSERT INTO `matches` (`id`, `lost_item_id`, `found_item_id`, `match_score`) VALUES
(1, 1, 1, 85.00),
(2, 2, 2, 75.00);
