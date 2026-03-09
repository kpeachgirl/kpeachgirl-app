-- Migration: Custom Access Token Hook for injecting is_admin claim into JWT
-- Run order: 4 of 4
--
-- This function is called by Supabase Auth on every token refresh.
-- It reads is_admin from auth.users.raw_app_meta_data and injects it
-- into the JWT claims so RLS policies can check (auth.jwt() ->> 'is_admin').
--
-- After running this migration, enable the hook in Supabase Dashboard:
--   Authentication > Hooks > Custom Access Token > Enable
--   Schema: public, Function: custom_access_token_hook

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE
  claims jsonb;
  is_admin boolean;
BEGIN
  claims := event->'claims';

  SELECT COALESCE((raw_app_meta_data->>'is_admin')::boolean, false)
  INTO is_admin
  FROM auth.users
  WHERE id = (event->>'user_id')::uuid;

  claims := jsonb_set(claims, '{is_admin}', to_jsonb(is_admin));
  event := jsonb_set(event, '{claims}', claims);

  RETURN event;
END;
$$;

-- Grant supabase_auth_admin access to execute the hook
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- Revoke from all other roles (security: only auth system should call this)
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;

-- The hook reads from auth.users, so grant SELECT to supabase_auth_admin
GRANT SELECT ON TABLE auth.users TO supabase_auth_admin;
