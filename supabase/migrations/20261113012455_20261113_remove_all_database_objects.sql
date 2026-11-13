/*
# Remove the entire application database

1. Summary
- The app now stores all of its data on the device itself, so the online database is no longer used.
- This migration deletes every table, function and trigger in the public schema of this project.

2. Removed objects
- Tables: active_sessions, announcement_confirmations, app_settings, device_fingerprints, global_announcements, import_history, licenses, payments, pix_settings, profiles, referral_bonuses, referral_codes, referrals, trigger_logs, user_devices, user_tutorial_completions.
- Functions: add_days_to_all_users, clear_import_history_all, create_referral_code_for_user, generate_referral_code, handle_new_user, is_admin, update_updated_at, validate_referral_code.
- Trigger on the login accounts table (auth.users) that created a profile for each new account. Removed so that account creation does not depend on the deleted tables. The accounts themselves are not deleted.

3. Data safety
- Deleting these tables permanently removes all rows stored in them. This was confirmed by the project owner.

4. Idempotency
- Every statement uses IF EXISTS, so re-running is safe.
*/

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP TABLE IF EXISTS public.active_sessions CASCADE;
DROP TABLE IF EXISTS public.announcement_confirmations CASCADE;
DROP TABLE IF EXISTS public.app_settings CASCADE;
DROP TABLE IF EXISTS public.device_fingerprints CASCADE;
DROP TABLE IF EXISTS public.global_announcements CASCADE;
DROP TABLE IF EXISTS public.import_history CASCADE;
DROP TABLE IF EXISTS public.licenses CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.pix_settings CASCADE;
DROP TABLE IF EXISTS public.referral_bonuses CASCADE;
DROP TABLE IF EXISTS public.referral_codes CASCADE;
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.trigger_logs CASCADE;
DROP TABLE IF EXISTS public.user_devices CASCADE;
DROP TABLE IF EXISTS public.user_tutorial_completions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP FUNCTION IF EXISTS public.add_days_to_all_users(integer) CASCADE;
DROP FUNCTION IF EXISTS public.clear_import_history_all() CASCADE;
DROP FUNCTION IF EXISTS public.create_referral_code_for_user() CASCADE;
DROP FUNCTION IF EXISTS public.generate_referral_code() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.validate_referral_code(text) CASCADE;
