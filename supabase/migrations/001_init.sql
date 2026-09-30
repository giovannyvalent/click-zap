-- ClickZap V1
-- Supabase/PostgreSQL

create extension if not exists pgcrypto;

create type public.business_role as enum ('owner','admin','member');
create type public.order_status as enum ('new','conversation','completed');
create type public.order_outcome as enum ('sold','not_sold');
create type public.fulfillment_type as enum ('pickup','delivery');
create type public.shipping_mode as enum ('global','neighborhood');
create type public.store_layout as enum ('grid','list','showcase');
create type public.store_theme as enum ('light','dark','soft');
create type public.card_style as enum ('soft','bordered','minimal');
create type public.image_ratio as enum ('landscape','square','portrait');
create type public.button_style as enum ('rounded','pill','square');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  whatsapp text not null,
  published boolean not null default false,
  plan_key text not null default 'start',
  allow_pickup boolean not null default true,
  allow_delivery boolean not null default false,
  shipping_mode public.shipping_mode not null default 'global',
  global_shipping_fee numeric(12,2) not null default 0 check (global_shipping_fee >= 0),
  currency char(3) not null default 'BRL',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint businesses_slug_format check (slug ~ '^[a-z0-9-]{3,60}$')
);

create table public.business_members (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.business_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (business_id,user_id)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  slug text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id,slug)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category_id uuid not null references public.categories(id),
  name text not null,
  internal_code text,
  description text not null default '',
  price numeric(12,2) not null check (price >= 0),
  tags text[] not null default '{}',
  featured boolean not null default false,
  active boolean not null default true,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_business_idx on public.products(business_id);
create index products_category_idx on public.products(category_id);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  public_url text,
  sort_order smallint not null default 0 check (sort_order between 0 and 4),
  created_at timestamptz not null default now(),
  unique(product_id,sort_order)
);

create table public.store_settings (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  accent_color text not null default '#16c784',
  logo_path text,
  logo_url text,
  layout public.store_layout not null default 'grid',
  theme public.store_theme not null default 'light',
  card_style public.card_style not null default 'soft',
  image_ratio public.image_ratio not null default 'landscape',
  button_style public.button_style not null default 'rounded',
  headline text not null default 'Escolha seus favoritos e peça pelo WhatsApp.',
  description text not null default '',
  show_search boolean not null default true,
  show_categories boolean not null default true,
  show_descriptions boolean not null default true,
  show_promo_bar boolean not null default false,
  promo_text text not null default '',
  updated_at timestamptz not null default now()
);

create table public.shipping_zones (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  fee numeric(12,2) not null default 0 check (fee >= 0),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index shipping_zones_business_idx on public.shipping_zones(business_id);

create sequence if not exists public.order_number_seq;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  order_number bigint not null default nextval('public.order_number_seq'),
  status public.order_status not null default 'new',
  outcome public.order_outcome,
  customer_name text not null,
  customer_phone text not null,
  fulfillment public.fulfillment_type not null,
  shipping_zone_id uuid references public.shipping_zones(id),
  neighborhood_name_snapshot text,
  delivery_address text,
  delivery_complement text,
  notes text not null default '',
  subtotal numeric(12,2) not null check (subtotal >= 0),
  shipping_fee numeric(12,2) not null default 0 check (shipping_fee >= 0),
  total numeric(12,2) not null check (total >= 0),
  source text not null default 'public_store',
  whatsapp_opened_at timestamptz,
  status_updated_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(business_id,order_number),
  constraint completed_outcome_rule check (
    (status <> 'completed' and outcome is null)
    or
    (status = 'completed')
  )
);

create index orders_business_created_idx on public.orders(business_id,created_at desc);
create index orders_business_status_idx on public.orders(business_id,status);
create index orders_customer_phone_idx on public.orders(business_id,customer_phone);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name_snapshot text not null,
  product_image_snapshot text,
  unit_price_snapshot numeric(12,2) not null check (unit_price_snapshot >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(12,2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create index order_items_order_idx on public.order_items(order_id);

create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  orders_view text not null default 'kanban' check (orders_view in ('kanban','list')),
  updated_at timestamptz not null default now()
);

-- Timestamp helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger businesses_updated_at before update on public.businesses
for each row execute function public.set_updated_at();

create trigger categories_updated_at before update on public.categories
for each row execute function public.set_updated_at();

create trigger products_updated_at before update on public.products
for each row execute function public.set_updated_at();

create trigger store_settings_updated_at before update on public.store_settings
for each row execute function public.set_updated_at();

create trigger shipping_zones_updated_at before update on public.shipping_zones
for each row execute function public.set_updated_at();

create trigger orders_updated_at before update on public.orders
for each row execute function public.set_updated_at();

-- Auto profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id,full_name)
  values(new.id, coalesce(new.raw_user_meta_data->>'full_name',''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
