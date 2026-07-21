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
