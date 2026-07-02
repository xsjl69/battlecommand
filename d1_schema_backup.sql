-- D1 Database Schema Backup
-- Generated: 2026-07-02
-- For Cloudflare D1 (SQLite dialect)

-- 1. User table (existing)
CREATE TABLE user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Chat message table (without is_read)
CREATE TABLE chat_message (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  is_pinned INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX idx_chat_sender ON chat_message(sender_id, created_at);
CREATE INDEX idx_chat_receiver ON chat_message(receiver_id, is_pinned, created_at);

-- Sample data for reference
/*
-- User table sample
INSERT INTO user (username, password, role) VALUES 
  ('admin', 'admin', 'commander'),
  ('刀手1', 'pass123', 'executor'),
  ('刀手2', 'pass456', 'executor');

-- Chat message sample
INSERT INTO chat_message (sender_id, receiver_id, content, is_pinned) VALUES
  (1, 2, '全体注意，准备战斗！', 1),
  (2, 1, '收到，已就位', 0),
  (3, 1, '我也准备好了', 0);
*/

-- Notes:
-- 1. No foreign key constraints (D1 may not enforce them)
-- 2. created_at uses TEXT with datetime('now') for SQLite compatibility
-- 3. is_pinned: 0 = normal, 1 = pinned (only one per receiver at a time)
-- 4. To drop and recreate: DROP TABLE IF EXISTS chat_message; DROP TABLE IF EXISTS user;