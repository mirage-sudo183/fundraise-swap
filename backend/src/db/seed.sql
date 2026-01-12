-- Seed data for demo: default workspace and two users

-- Default workspace (idempotent insert)
INSERT OR IGNORE INTO workspaces (id, name, seed, invite_code, created_at)
VALUES ('ws-default', 'Demo Workspace', 'demo-seed-2024', 'DEMO2024', datetime('now'));

-- User: Altan
INSERT OR IGNORE INTO users (id, name, display_name, workspace_id, created_at)
VALUES ('user-altan', 'altan', 'Altan', 'ws-default', datetime('now'));

-- User: Firat
INSERT OR IGNORE INTO users (id, name, display_name, workspace_id, created_at)
VALUES ('user-firat', 'firat', 'Firat', 'ws-default', datetime('now'));
