-- Paste this complete file into the Supabase SQL Editor once.
-- It is intentionally non-idempotent so a conflicting schema is reviewed.
begin;

create table public.shop_checkout_orders (
  id uuid primary key,
  account_id text not null,
  idempotency_key uuid not null,
  square_order_id text not null unique,
  square_payment_link_id text not null,
  payment_link_url text not null,
  status text not null check (status in ('pending', 'paid', 'cancelled', 'failed', 'refunded')),
  cart_snapshot jsonb not null check (jsonb_typeof(cart_snapshot) = 'object'),
  fulfillment_kind text not null check (fulfillment_kind in ('pickup', 'shipping')),
  fulfillment_details jsonb not null check (jsonb_typeof(fulfillment_details) = 'object'),
  merchandise_subtotal_minor integer not null check (merchandise_subtotal_minor >= 0),
  shipping_minor integer not null check (shipping_minor >= 0),
  currency text not null check (currency = 'CAD'),
  square_payment_id text unique,
  paid_at timestamptz,
  fulfilled_at timestamptz,
  retention_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, idempotency_key)
);

create index shop_checkout_orders_account_created_idx
  on public.shop_checkout_orders (account_id, created_at desc);

create index shop_checkout_orders_retention_idx
  on public.shop_checkout_orders (retention_expires_at)
  where retention_expires_at is not null;

alter table public.shop_checkout_orders enable row level security;
revoke all on table public.shop_checkout_orders from anon, authenticated;
grant select, insert, update, delete on table public.shop_checkout_orders to service_role;

create table public.square_webhook_events (
  event_id text primary key,
  event_type text not null,
  square_order_id text,
  square_payment_id text,
  payment_status text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create index square_webhook_events_order_idx
  on public.square_webhook_events (square_order_id)
  where square_order_id is not null;

alter table public.square_webhook_events enable row level security;
revoke all on table public.square_webhook_events from anon, authenticated;
grant select, insert, update, delete on table public.square_webhook_events to service_role;

create function public.record_square_payment_event(
  p_event_id text,
  p_event_type text,
  p_square_order_id text,
  p_square_payment_id text,
  p_payment_status text,
  p_occurred_at timestamptz
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_inserted integer;
  v_account_id text;
  v_snapshot jsonb;
begin
  insert into public.square_webhook_events (
    event_id,
    event_type,
    square_order_id,
    square_payment_id,
    payment_status
  )
  values (
    p_event_id,
    p_event_type,
    p_square_order_id,
    p_square_payment_id,
    p_payment_status
  )
  on conflict (event_id) do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return false;
  end if;

  if p_payment_status = 'COMPLETED' then
    update public.shop_checkout_orders
    set
      status = 'paid',
      square_payment_id = p_square_payment_id,
      paid_at = p_occurred_at,
      updated_at = now()
    where square_order_id = p_square_order_id
      and status in ('pending', 'paid')
    returning account_id, cart_snapshot into v_account_id, v_snapshot;

    if v_account_id is not null then
      delete from public.account_cart_lines as cart
      using jsonb_to_recordset(v_snapshot -> 'lines') as purchased(id text, quantity smallint)
      where cart.account_id = v_account_id
        and cart.line_id = purchased.id
        and cart.quantity = purchased.quantity;
    end if;
  elsif p_payment_status = 'CANCELED' then
    update public.shop_checkout_orders
    set status = 'cancelled', updated_at = now()
    where square_order_id = p_square_order_id
      and status = 'pending';
  elsif p_payment_status = 'FAILED' then
    update public.shop_checkout_orders
    set status = 'failed', updated_at = now()
    where square_order_id = p_square_order_id
      and status = 'pending';
  end if;

  update public.square_webhook_events
  set processed_at = now()
  where event_id = p_event_id;

  return true;
end;
$$;

revoke all on function public.record_square_payment_event(text, text, text, text, text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.record_square_payment_event(text, text, text, text, text, timestamptz)
  to service_role;

create function public.mark_shop_checkout_fulfilled(
  p_checkout_id uuid,
  p_fulfilled_at timestamptz
)
returns boolean
language sql
security invoker
set search_path = public
as $$
  update public.shop_checkout_orders
  set
    fulfilled_at = p_fulfilled_at,
    retention_expires_at = p_fulfilled_at + interval '10 days',
    updated_at = now()
  where id = p_checkout_id
    and status = 'paid'
  returning true;
$$;

revoke all on function public.mark_shop_checkout_fulfilled(uuid, timestamptz)
  from public, anon, authenticated;
grant execute on function public.mark_shop_checkout_fulfilled(uuid, timestamptz)
  to service_role;

create function public.remove_expired_shop_checkout_orders(p_now timestamptz)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_removed integer;
begin
  delete from public.square_webhook_events
  where square_order_id in (
    select square_order_id
    from public.shop_checkout_orders
    where retention_expires_at < p_now
  );

  delete from public.shop_checkout_orders
  where retention_expires_at < p_now;

  get diagnostics v_removed = row_count;
  return v_removed;
end;
$$;

revoke all on function public.remove_expired_shop_checkout_orders(timestamptz)
  from public, anon, authenticated;
grant execute on function public.remove_expired_shop_checkout_orders(timestamptz)
  to service_role;

commit;

select
  to_regclass('public.shop_checkout_orders') is not null as checkout_orders_exists,
  to_regclass('public.square_webhook_events') is not null as webhook_events_exists,
  (select relrowsecurity from pg_class where oid = 'public.shop_checkout_orders'::regclass) as checkout_rls_enabled,
  (select relrowsecurity from pg_class where oid = 'public.square_webhook_events'::regclass) as webhook_rls_enabled,
  has_table_privilege('service_role', 'public.shop_checkout_orders', 'select,insert,update,delete') as service_role_checkout_access,
  has_table_privilege('service_role', 'public.square_webhook_events', 'select,insert,update,delete') as service_role_webhook_access,
  has_function_privilege(
    'service_role',
    'public.record_square_payment_event(text, text, text, text, text, timestamptz)',
    'execute'
  ) as service_role_webhook_function_access,
  has_function_privilege(
    'service_role',
    'public.mark_shop_checkout_fulfilled(uuid, timestamptz)',
    'execute'
  ) as service_role_fulfillment_function_access,
  has_function_privilege(
    'service_role',
    'public.remove_expired_shop_checkout_orders(timestamptz)',
    'execute'
  ) as service_role_retention_function_access,
  not has_table_privilege('anon', 'public.shop_checkout_orders', 'select')
    and not has_table_privilege('authenticated', 'public.shop_checkout_orders', 'select') as checkout_client_access_revoked,
  not has_table_privilege('anon', 'public.square_webhook_events', 'select')
    and not has_table_privilege('authenticated', 'public.square_webhook_events', 'select') as webhook_client_access_revoked;
