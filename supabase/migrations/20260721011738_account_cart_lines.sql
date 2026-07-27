-- Paste this complete file into the Supabase SQL Editor once for a fresh project.
-- It is intentionally non-idempotent: a conflicting existing schema must be reviewed,
-- not silently changed.
begin;

create table public.account_cart_lines (
  account_id text not null,
  line_id text not null,
  product_id text not null,
  product_name text not null,
  finish text not null,
  colour text not null,
  quantity smallint not null check (quantity between 1 and 10),
  maximum_quantity smallint not null check (maximum_quantity >= 0),
  unit_price_minor integer not null check (unit_price_minor >= 0),
  currency text not null check (currency = 'CAD'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (account_id, line_id)
);

alter table public.account_cart_lines enable row level security;

revoke all on table public.account_cart_lines from anon, authenticated;
grant select, insert, update, delete on table public.account_cart_lines to service_role;

create function public.replace_account_cart_lines(p_account_id text, p_lines jsonb)
returns setof public.account_cart_lines
language plpgsql
security invoker
set search_path = public
as $$
begin
  delete from public.account_cart_lines where account_id = p_account_id;

  insert into public.account_cart_lines (
    account_id,
    line_id,
    product_id,
    product_name,
    finish,
    colour,
    quantity,
    maximum_quantity,
    unit_price_minor,
    currency,
    updated_at
  )
  select
    p_account_id,
    line_id,
    product_id,
    product_name,
    finish,
    colour,
    quantity,
    maximum_quantity,
    unit_price_minor,
    currency,
    now()
  from jsonb_to_recordset(p_lines) as line(
    line_id text,
    product_id text,
    product_name text,
    finish text,
    colour text,
    quantity smallint,
    maximum_quantity smallint,
    unit_price_minor integer,
    currency text
  );

  return query
  select * from public.account_cart_lines where account_id = p_account_id order by line_id;
end;
$$;

revoke all on function public.replace_account_cart_lines(text, jsonb) from public, anon, authenticated;
grant execute on function public.replace_account_cart_lines(text, jsonb) to service_role;

commit;

-- Read-only verification output for the SQL Editor.
select
  to_regclass('public.account_cart_lines') is not null as account_cart_lines_exists,
  (select relrowsecurity from pg_class where oid = 'public.account_cart_lines'::regclass) as rls_enabled,
  has_table_privilege('service_role', 'public.account_cart_lines', 'select')
    and has_table_privilege('service_role', 'public.account_cart_lines', 'insert')
    and has_table_privilege('service_role', 'public.account_cart_lines', 'update')
    and has_table_privilege('service_role', 'public.account_cart_lines', 'delete') as service_role_table_access,
  has_function_privilege('service_role', 'public.replace_account_cart_lines(text, jsonb)', 'execute') as service_role_function_access,
  not has_table_privilege('anon', 'public.account_cart_lines', 'select')
    and not has_table_privilege('authenticated', 'public.account_cart_lines', 'select') as client_table_access_revoked,
  not has_function_privilege('anon', 'public.replace_account_cart_lines(text, jsonb)', 'execute')
    and not has_function_privilege('authenticated', 'public.replace_account_cart_lines(text, jsonb)', 'execute') as client_function_access_revoked;
