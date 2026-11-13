/*
# Remove profile link from tutorial completions

1. Problem
- `user_tutorial_completions.user_id` had a foreign key requiring each value to exist in `profiles`.
- The app stores the device's installation ID there, which is not a profile ID, so every save was rejected.

2. Changes
- Drop the foreign key constraint `user_tutorial_completions_user_id_fkey`. The column, table and existing rows are kept.
- The unique rule on (user_id, tutorial_type) is kept, so each device keeps one completion per tutorial.

3. Idempotency
- Uses IF EXISTS, so re-running is safe.
*/

ALTER TABLE user_tutorial_completions DROP CONSTRAINT IF EXISTS user_tutorial_completions_user_id_fkey;
