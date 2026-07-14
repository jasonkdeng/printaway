create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  material text not null,
  weight_grams integer not null check (weight_grams > 0),
  provisional_price_minor integer not null check (provisional_price_minor >= 0),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_published_idx on public.products (published) where published;

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company text,
  consented_at timestamptz not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index quote_requests_expires_at_idx on public.quote_requests (expires_at);

create table public.reference_uploads (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid references public.quote_requests (id) on delete cascade,
  object_path text not null unique,
  original_file_name text not null,
  byte_length integer not null check (byte_length > 0 and byte_length <= 10485760),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index reference_uploads_expires_at_idx on public.reference_uploads (expires_at);

alter table public.products enable row level security;
alter table public.quote_requests enable row level security;
alter table public.reference_uploads enable row level security;

create policy "published products are publicly readable"
on public.products for select to anon, authenticated
using (published = true);

insert into storage.buckets (id, name, public)
values ('reference-uploads', 'reference-uploads', false)
on conflict (id) do update set public = excluded.public;

-- No direct client policies are created for quote data or uploads. Server-side
-- operations issue narrowly scoped signed upload URLs after validating metadata.
