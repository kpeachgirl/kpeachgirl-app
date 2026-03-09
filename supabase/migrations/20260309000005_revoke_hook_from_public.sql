-- Revoke hook execution from public roles (defense in depth)
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
