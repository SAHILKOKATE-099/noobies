-- Create DB
CREATE DATABASE IF NOT EXISTS typing_app;
USE typing_app;

-- users table: one user can have many typing results
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  is_admin TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migration safety: adds admin flag when upgrading older projects.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_admin TINYINT(1) NOT NULL DEFAULT 0;

-- results table: stores every typing attempt
CREATE TABLE IF NOT EXISTS results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  wpm INT NOT NULL,
  accuracy DECIMAL(5,2) NOT NULL,
  time_taken INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_results_user FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- Indexes for faster leaderboard/history queries
CREATE INDEX idx_results_user_id ON results(user_id);
CREATE INDEX idx_results_wpm ON results(wpm DESC);
CREATE INDEX idx_results_created_at ON results(created_at DESC);

-- Sample users (password hash placeholders)
INSERT INTO users (username, email, password, is_admin) VALUES
('ava', 'ava@example.com', '$2a$10$dummyhash1', 0),
('noah', 'noah@example.com', '$2a$10$dummyhash2', 0),
('mia', 'mia@example.com', '$2a$10$dummyhash3', 0),
('admin', 'admin@typeflow.local', '$2b$10$bEvED5calRoxfY9lCoWct.6deMm396nYC/8Ka9oJj3rORrp7gRLVu', 1);

-- Sample results
INSERT INTO results (user_id, wpm, accuracy, time_taken) VALUES
(1, 88, 97.40, 60),
(1, 91, 98.10, 60),
(2, 84, 95.30, 30),
(2, 87, 96.00, 60),
(3, 93, 98.50, 120),
(3, 90, 97.60, 60);

-- Leaderboard query: top 10 users by highest WPM (best attempt)
SELECT
  u.id AS user_id,
  u.username,
  MAX(r.wpm) AS best_wpm,
  ROUND(AVG(r.accuracy), 2) AS avg_accuracy
FROM users u
INNER JOIN results r ON r.user_id = u.id
GROUP BY u.id, u.username
ORDER BY best_wpm DESC, avg_accuracy DESC
LIMIT 10;

-- User performance history query
SELECT
  r.id,
  r.wpm,
  r.accuracy,
  r.time_taken,
  r.created_at
FROM results r
WHERE r.user_id = 1
ORDER BY r.created_at DESC;
