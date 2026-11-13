/*
# Add completed flag to tutorial completions

1. Problem
- The app saves a `completed` flag with each tutorial completion, but the table has no such column, so every save was rejected.

2. Changes
- Add column `completed` (boolean, not null, default true) to `user_tutorial_completions`.
- Existing rows (if any) are treated as completed.

3. Idempotency
- Uses IF NOT EXISTS, so re-running is safe.
*/

ALTER TABLE user_tutorial_completions ADD COLUMN IF NOT EXISTS completed boolean NOT NULL DEFAULT true;
