-- HARMONI Hospital Information System
-- Migrasi database untuk perbaikan status pengguna

BEGIN;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

COMMIT;