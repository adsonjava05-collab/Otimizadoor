/*
# Allow tutorial completions to be saved by the app

1. Problem
- The app has no sign-in. Each device is identified by an installation ID, and the app uses the anonymous database role.
- The policies on `user_tutorial_completions` only allowed rows where `user_id = auth.uid()`. For the anonymous role that is always null, so saving a completion was rejected and reading it back returned nothing. The "Concluir tutorial" button therefore never stuck and the tutorial kept showing.

2. Changes to `user_tutorial_completions`
- Drop the four policies that required `auth.uid()`.
- Grant SELECT, INSERT and UPDATE to `anon` and `authenticated`. UPDATE is needed because saving uses an upsert on (user_id, tutorial_type).
- Revoke DELETE, which the app does not use.
- Create SELECT, INSERT and UPDATE policies for `anon` and `authenticated`.

3. Security notes
- The installation ID is generated on the device, so the database cannot verify ownership of a row. Access is open to the anon role, matching the other tables of this no-sign-in app.
- Existing rows are kept. The table is not dropped or altered in structure.

4. Idempotency
- Policies are dropped with IF EXISTS before being recreated, so the migration can be re-run safely.
*/

GRANT SELECT, INSERT, UPDATE ON user_tutorial_completions TO anon, authenticated;
REVOKE DELETE ON user_tutorial_completions FROM anon, authenticated;

DROP POLICY IF EXISTS "insert_own_completions" ON user_tutorial_completions;
DROP POLICY IF EXISTS "select_own_completions" ON user_tutorial_completions;
DROP POLICY IF EXISTS "update_own_completions" ON user_tutorial_completions;
DROP POLICY IF EXISTS "select_tutorial_completions" ON user_tutorial_completions;
DROP POLICY IF EXISTS "insert_tutorial_completions" ON user_tutorial_completions;
DROP POLICY IF EXISTS "update_tutorial_completions" ON user_tutorial_completions;

CREATE POLICY "select_tutorial_completions" ON user_tutorial_completions
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "insert_tutorial_completions" ON user_tutorial_completions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "update_tutorial_completions" ON user_tutorial_completions
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
