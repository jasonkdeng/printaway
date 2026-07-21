alter table public.quote_requests
  add column public_reference text unique,
  add column idempotency_key uuid unique,
  add column status text not null default 'pending_upload' check (status in ('pending_upload', 'submitted')),
  add column configuration jsonb,
  add column estimate_status text not null default 'manual_review' check (estimate_status in ('manual_review', 'unavailable')),
  add column privacy_policy_version text,
  add column submitted_at timestamptz;

alter table public.reference_uploads
  add column reference_id text,
  add column status text not null default 'pending_upload' check (status in ('pending_upload', 'quarantined'));

alter table public.reference_uploads
  add constraint reference_uploads_quote_request_reference_id_key unique (quote_request_id, reference_id);

create table public.studio_rate_limits (
  key_hash text not null,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count >= 0),
  primary key (key_hash, window_started_at)
);

alter table public.studio_rate_limits enable row level security;

create or replace function public.consume_studio_rate_limit(p_key text, p_limit integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  bucket_start timestamptz := date_trunc('hour', now());
  current_count integer;
begin
  insert into public.studio_rate_limits (key_hash, window_started_at, request_count)
  values (p_key, bucket_start, 1)
  on conflict (key_hash, window_started_at)
  do update set request_count = public.studio_rate_limits.request_count + 1
  returning request_count into current_count;
  return current_count <= p_limit;
end;
$$;

revoke all on function public.consume_studio_rate_limit(text, integer) from public;
