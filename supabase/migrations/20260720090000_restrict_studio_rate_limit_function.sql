-- The rate-limit function is called only by the server-side Supabase client.
-- Do not expose this SECURITY DEFINER function through the Data API.
revoke all on function public.consume_studio_rate_limit(text, integer) from public, anon, authenticated;
grant execute on function public.consume_studio_rate_limit(text, integer) to service_role;
