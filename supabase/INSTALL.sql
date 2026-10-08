-- ClickZap: instalação completa em projeto novo.
-- Banco já instalado: aplique somente as migrations posteriores à última aplicada.
begin;
-- 001_init.sql
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


-- 002_rls.sql
-- ClickZap V1 RLS

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.store_settings enable row level security;
alter table public.shipping_zones enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.user_preferences enable row level security;

create or replace function public.is_business_member(target_business uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.business_members bm
    where bm.business_id = target_business
      and bm.user_id = auth.uid()
  );
$$;

create or replace function public.is_business_admin(target_business uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.business_members bm
    where bm.business_id = target_business
      and bm.user_id = auth.uid()
      and bm.role in ('owner','admin')
  );
$$;

-- Profiles
create policy "profile_select_self"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "profile_update_self"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Businesses: private member access + public published select
create policy "business_member_select"
on public.businesses for select
to authenticated
using (public.is_business_member(id));

create policy "business_public_select"
on public.businesses for select
to anon
using (published = true);

create policy "business_member_update"
on public.businesses for update
to authenticated
using (public.is_business_admin(id))
with check (public.is_business_admin(id));

-- Business members
create policy "members_select_same_business"
on public.business_members for select
to authenticated
using (public.is_business_member(business_id));

create policy "members_admin_insert"
on public.business_members for insert
to authenticated
with check (public.is_business_admin(business_id) or user_id = auth.uid());

create policy "members_admin_update"
on public.business_members for update
to authenticated
using (public.is_business_admin(business_id))
with check (public.is_business_admin(business_id));

-- Categories
create policy "categories_member_all_select"
on public.categories for select
to authenticated
using (public.is_business_member(business_id));

create policy "categories_public_active"
on public.categories for select
to anon
using (
  active = true
  and exists (
    select 1 from public.businesses b
    where b.id = business_id and b.published = true
  )
);

create policy "categories_admin_insert"
on public.categories for insert
to authenticated
with check (public.is_business_admin(business_id));

create policy "categories_admin_update"
on public.categories for update
to authenticated
using (public.is_business_admin(business_id))
with check (public.is_business_admin(business_id));

create policy "categories_admin_delete"
on public.categories for delete
to authenticated
using (public.is_business_admin(business_id));

-- Products
create policy "products_member_select"
on public.products for select
to authenticated
using (public.is_business_member(business_id));

create policy "products_public_active"
on public.products for select
to anon
using (
  active = true
  and archived_at is null
  and exists (
    select 1 from public.businesses b
    where b.id = business_id and b.published = true
  )
  and exists (
    select 1 from public.categories c
    where c.id = category_id and c.active = true
  )
);

create policy "products_admin_insert"
on public.products for insert
to authenticated
with check (public.is_business_admin(business_id));

create policy "products_admin_update"
on public.products for update
to authenticated
using (public.is_business_admin(business_id))
with check (public.is_business_admin(business_id));

-- Prefer soft archive instead of delete.

-- Product images
create policy "product_images_member_select"
on public.product_images for select
to authenticated
using (public.is_business_member(business_id));

create policy "product_images_public_select"
on public.product_images for select
to anon
using (
  exists (
    select 1 from public.businesses b
    where b.id = business_id and b.published = true
  )
);

create policy "product_images_admin_insert"
on public.product_images for insert
to authenticated
with check (public.is_business_admin(business_id));

create policy "product_images_admin_update"
on public.product_images for update
to authenticated
using (public.is_business_admin(business_id))
with check (public.is_business_admin(business_id));

create policy "product_images_admin_delete"
on public.product_images for delete
to authenticated
using (public.is_business_admin(business_id));

-- Store settings
create policy "store_settings_member_select"
on public.store_settings for select
to authenticated
using (public.is_business_member(business_id));

create policy "store_settings_public_select"
on public.store_settings for select
to anon
using (
  exists (
    select 1 from public.businesses b
    where b.id = business_id and b.published = true
  )
);

create policy "store_settings_admin_insert"
on public.store_settings for insert
to authenticated
with check (public.is_business_admin(business_id));

create policy "store_settings_admin_update"
on public.store_settings for update
to authenticated
using (public.is_business_admin(business_id))
with check (public.is_business_admin(business_id));

-- Shipping zones
create policy "shipping_zones_member_select"
on public.shipping_zones for select
to authenticated
using (public.is_business_member(business_id));

create policy "shipping_zones_public_active"
on public.shipping_zones for select
to anon
using (
  active = true
  and exists (
    select 1 from public.businesses b
    where b.id = business_id and b.published = true
  )
);

create policy "shipping_zones_admin_insert"
on public.shipping_zones for insert
to authenticated
with check (public.is_business_admin(business_id));

create policy "shipping_zones_admin_update"
on public.shipping_zones for update
to authenticated
using (public.is_business_admin(business_id))
with check (public.is_business_admin(business_id));

create policy "shipping_zones_admin_delete"
on public.shipping_zones for delete
to authenticated
using (public.is_business_admin(business_id));

-- Orders: no direct anon insert.
-- Public creation must happen through trusted server endpoint.
create policy "orders_member_select"
on public.orders for select
to authenticated
using (public.is_business_member(business_id));

create policy "orders_member_update"
on public.orders for update
to authenticated
using (public.is_business_member(business_id))
with check (public.is_business_member(business_id));

create policy "order_items_member_select"
on public.order_items for select
to authenticated
using (public.is_business_member(business_id));

-- User preferences
create policy "prefs_self_select"
on public.user_preferences for select
to authenticated
using (user_id = auth.uid());

create policy "prefs_self_insert"
on public.user_preferences for insert
to authenticated
with check (user_id = auth.uid());

create policy "prefs_self_update"
on public.user_preferences for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- NOTE:
-- business creation + initial owner membership should run in a server-side transaction/RPC
-- because the member policy cannot safely self-bootstrap ownership with arbitrary business ids.


-- 003_security_and_transactions.sql
-- Required hardening of the supplied 001/002. Apply all migrations in order.
drop policy members_admin_insert on public.business_members;
drop policy members_admin_update on public.business_members;
-- V1 has no invitations. Memberships are created only by onboarding RPC.
revoke insert,update,delete on public.business_members from anon,authenticated;
revoke update on public.businesses from authenticated;
grant update(name,slug,whatsapp,published,allow_pickup,allow_delivery,shipping_mode,global_shipping_fee) on public.businesses to authenticated;
revoke update on public.orders from authenticated;
grant update(status,outcome) on public.orders to authenticated;
alter table public.categories add constraint categories_tenant_unique unique(business_id,id);
alter table public.products add constraint product_category_tenant foreign key(business_id,category_id) references public.categories(business_id,id);
alter table public.products add constraint products_tenant_unique unique(business_id,id);
alter table public.product_images add constraint image_product_tenant foreign key(business_id,product_id) references public.products(business_id,id);
alter table public.orders drop constraint completed_outcome_rule;
alter table public.orders add constraint completed_outcome_rule check ((status='completed' and outcome is not null) or (status<>'completed' and outcome is null));
alter table public.businesses add constraint reserved_slug check(slug not in ('app','entrar','cadastro','precos','api','admin','loja','suporte','onboarding'));
alter table public.businesses add constraint valid_whatsapp check(whatsapp ~ '^[1-9][0-9]{9,14}$');
alter table public.businesses add constraint fulfillment_enabled check(allow_pickup or allow_delivery);
alter table public.store_settings add constraint valid_accent check(accent_color ~ '^#[0-9a-fA-F]{6}$');
alter table public.orders add column request_key uuid;
alter table public.orders add column request_hash text;
create unique index orders_request_key on public.orders(business_id,request_key);

create or replace function public.create_business(p_name text,p_slug text,p_whatsapp text)
returns uuid language plpgsql security definer set search_path=public as $$
declare bid uuid;
begin
 if auth.uid() is null then raise exception 'Faça login para criar a loja.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
 if exists(select 1 from business_members where user_id=auth.uid()) then raise exception 'Sua conta já possui uma loja.'; end if;
 if length(trim(p_name)) not between 2 and 100 then raise exception 'Nome inválido.'; end if;
 insert into businesses(name,slug,whatsapp) values(trim(p_name),p_slug,p_whatsapp) returning id into bid;
 insert into business_members(business_id,user_id,role) values(bid,auth.uid(),'owner');
 insert into store_settings(business_id) values(bid);
 return bid;
end $$;
revoke all on function public.create_business(text,text,text) from public,anon,authenticated;
grant execute on function public.create_business(text,text,text) to authenticated;

create or replace function public.guard_product_limit() returns trigger language plpgsql security definer set search_path=public as $$
declare plan text; n int;
begin
 select plan_key into plan from businesses where id=new.business_id for update;
 if new.archived_at is null and plan='start' then
 select count(*) into n from products where business_id=new.business_id and archived_at is null and id<>new.id;
 if n>=15 then raise exception 'O plano Start permite até 15 produtos. Arquive um produto para liberar espaço.'; end if;
 end if;
 return new;
end $$;
create trigger product_limit before insert or update on public.products for each row execute function public.guard_product_limit();
create or replace function public.guard_publication() returns trigger language plpgsql set search_path=public as $$
begin
 if new.published then
 if not exists(select 1 from products p join categories c on c.id=p.category_id and c.business_id=p.business_id where p.business_id=new.id and p.active and p.archived_at is null and c.active) then raise exception 'Crie uma categoria e um produto ativos antes de publicar.'; end if;
 if new.allow_delivery and new.shipping_mode='neighborhood' and not exists(select 1 from shipping_zones where business_id=new.id and active) then raise exception 'Cadastre ao menos um bairro ativo.'; end if;
 end if;
 return new;
end $$;
create trigger publication_guard before update on public.businesses for each row execute function public.guard_publication();
create or replace function public.order_status_times() returns trigger language plpgsql as $$
begin
 if new.status is distinct from old.status or new.outcome is distinct from old.outcome then
 new.status_updated_at=now();
 new.completed_at=case when new.status='completed' then now() else null end;
 if new.status<>'completed' then new.outcome=null; end if;
 end if;
 return new;
end $$;
create trigger order_status_change before update on public.orders for each row execute function public.order_status_times();

-- Persistent fixed-window rate limit (no in-memory dependency on serverless instances).
create table public.request_limits(key text primary key,window_start timestamptz not null default now(),hits int not null default 1);
alter table public.request_limits enable row level security;
create index request_limits_expiration on public.request_limits(window_start);
create or replace function public.consume_limit(p_key text,p_max int,p_seconds int) returns boolean language plpgsql security definer set search_path=public as $$
declare n int;
begin
 insert into request_limits(key) values(p_key) on conflict(key) do update set
 hits=case when request_limits.window_start < now()-make_interval(secs=>p_seconds) then 1 else request_limits.hits+1 end,
 window_start=case when request_limits.window_start < now()-make_interval(secs=>p_seconds) then now() else request_limits.window_start end returning hits into n;
 delete from request_limits where window_start < now()-interval '2 days';
 return n<=p_max;
end $$;
revoke all on function public.consume_limit(text,int,int) from public,anon,authenticated;
grant execute on function public.consume_limit(text,int,int) to service_role;

-- One transaction: validate current products/categories/freight, snapshot and persist.
create or replace function public.place_order(p jsonb) returns jsonb language plpgsql security definer set search_path=public as $$
declare b businesses; o orders; pr products; z shipping_zones; it jsonb; q int; sub numeric(12,2):=0; fee numeric(12,2):=0; arr jsonb:='[]'; oid uuid; hash text;
begin
 select * into b from businesses where slug=p->>'slug' and published for share;
 if not found then raise exception 'Loja indisponível.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(b.id::text || (p->>'request_key'),0));
 hash=md5((p-'request_key')::text);
 select * into o from orders where business_id=b.id and request_key=(p->>'request_key')::uuid;
 if found then
 if o.request_hash<>hash then raise exception 'Tentativa de pedido alterada. Atualize a página.'; end if;
 return jsonb_build_object('order',to_jsonb(o),'items',(select jsonb_agg(to_jsonb(i)) from order_items i where order_id=o.id),'whatsapp',b.whatsapp,'business_name',b.name);
 end if;
 if length(trim(p->>'customer_name')) not between 2 and 100 or (p->>'customer_phone') !~ '^[1-9][0-9]{9,14}$' then raise exception 'Dados do cliente inválidos.'; end if;
 if jsonb_typeof(p->'items')<>'array' or jsonb_array_length(p->'items') not between 1 and 50 then raise exception 'Carrinho inválido.'; end if;
 if (select count(distinct x->>'product_id') from jsonb_array_elements(p->'items') x)<>jsonb_array_length(p->'items') then raise exception 'Itens duplicados.'; end if;
 for it in select * from jsonb_array_elements(p->'items') loop
 q=(it->>'quantity')::int;
 if q not between 1 and 99 then raise exception 'Quantidade inválida.'; end if;
 select prd.* into pr from products prd join categories c on c.id=prd.category_id and c.business_id=prd.business_id where prd.id=(it->>'product_id')::uuid and prd.business_id=b.id and prd.active and prd.archived_at is null and c.active for share of prd,c;
 if not found then raise exception 'Um produto ficou indisponível. Revise o carrinho.'; end if;
 sub=sub+pr.price*q;
 arr=arr||jsonb_build_object('product_id',pr.id,'product_name_snapshot',pr.name,'unit_price_snapshot',pr.price,'quantity',q,'line_total',pr.price*q,'product_image_snapshot',(select public_url from product_images where product_id=pr.id order by sort_order limit 1));
 end loop;
 if p->>'fulfillment'='pickup' then
 if not b.allow_pickup then raise exception 'Retirada indisponível.'; end if;
 elsif p->>'fulfillment'='delivery' then
 if not b.allow_delivery or length(trim(coalesce(p->>'delivery_address',''))) not between 5 and 500 then raise exception 'Entrega ou endereço inválido.'; end if;
 if b.shipping_mode='global' then fee=b.global_shipping_fee;
 else
 select * into z from shipping_zones where id=(p->>'shipping_zone_id')::uuid and business_id=b.id and active for share;
 if not found then raise exception 'Selecione um bairro disponível.'; end if;
 fee=z.fee;
 end if;
 else raise exception 'Modalidade inválida.';
 end if;
 insert into orders(business_id,customer_name,customer_phone,fulfillment,shipping_zone_id,neighborhood_name_snapshot,delivery_address,delivery_complement,notes,subtotal,shipping_fee,total,request_key,request_hash)
 values(b.id,trim(p->>'customer_name'),p->>'customer_phone',(p->>'fulfillment')::fulfillment_type,z.id,z.name,case when p->>'fulfillment'='delivery' then p->>'delivery_address' end,left(p->>'delivery_complement',200),left(coalesce(p->>'notes',''),1000),sub,fee,sub+fee,(p->>'request_key')::uuid,hash) returning * into o;
 for it in select * from jsonb_array_elements(arr) loop
 insert into order_items(order_id,business_id,product_id,product_name_snapshot,unit_price_snapshot,quantity,line_total,product_image_snapshot) values(o.id,b.id,(it->>'product_id')::uuid,it->>'product_name_snapshot',(it->>'unit_price_snapshot')::numeric,(it->>'quantity')::int,(it->>'line_total')::numeric,it->>'product_image_snapshot');
 end loop;
 return jsonb_build_object('order',to_jsonb(o),'items',arr,'whatsapp',b.whatsapp,'business_name',b.name);
end $$;
revoke all on function public.place_order(jsonb) from public,anon,authenticated;
grant execute on function public.place_order(jsonb) to service_role;

create or replace function public.replace_product_images(p_product uuid,p_images jsonb) returns void language plpgsql security definer set search_path=public as $$
declare bid uuid; img jsonb; n int:=0;
begin
 select business_id into bid from products where id=p_product for update;
 if not public.is_business_admin(bid) then raise exception 'Sem permissão.'; end if;
 if jsonb_typeof(p_images)<>'array' or jsonb_array_length(p_images)>5 then raise exception 'Use até 5 fotos.'; end if;
 for img in select * from jsonb_array_elements(p_images) loop
 if not starts_with(img->>'storage_path',bid::text||'/'||p_product::text||'/') then raise exception 'Caminho de imagem inválido.'; end if;
 if not exists(select 1 from storage.objects where bucket_id='product-images' and name=img->>'storage_path') then raise exception 'Arquivo não encontrado.'; end if;
 end loop;
 delete from product_images where product_id=p_product;
 for img in select * from jsonb_array_elements(p_images) loop
 insert into product_images(business_id,product_id,storage_path,public_url,sort_order) values(bid,p_product,img->>'storage_path',img->>'public_url',n); n=n+1;
 end loop;
end $$;
revoke all on function public.replace_product_images(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.replace_product_images(uuid,jsonb) to authenticated;


-- 004_storage_and_events.sql
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp']),
('business-assets','business-assets',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy assets_read on storage.objects for select to public using(bucket_id in ('product-images','business-assets'));
create policy assets_insert on storage.objects for insert to authenticated with check(bucket_id in ('product-images','business-assets') and public.is_business_admin(((storage.foldername(name))[1])::uuid));
create policy assets_delete on storage.objects for delete to authenticated using(bucket_id in ('product-images','business-assets') and public.is_business_admin(((storage.foldername(name))[1])::uuid));
create table public.analytics_events(id bigint generated always as identity primary key,business_id uuid references public.businesses(id) on delete cascade,event text not null check(event in ('store_view','product_view','add_to_cart','begin_order','order_created','whatsapp_opened','order_sold','store_published')),created_at timestamptz not null default now());
create index analytics_business_date on public.analytics_events(business_id,created_at);
alter table public.analytics_events enable row level security;
create policy analytics_owner on public.analytics_events for select to authenticated using(public.is_business_member(business_id));
-- No public inserts. Public events accepted by rate-limited server endpoint.

create or replace function public.track_business_events() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if tg_table_name='orders' then
 if tg_op='INSERT' then insert into analytics_events(business_id,event) values(new.business_id,'order_created');
 elsif new.outcome='sold' and old.outcome is distinct from new.outcome then insert into analytics_events(business_id,event) values(new.business_id,'order_sold'); end if;
 elsif new.published and not old.published then insert into analytics_events(business_id,event) values(new.id,'store_published');
 end if;
 return new;
end $$;
create trigger record_order_event after insert or update on public.orders for each row execute function public.track_business_events();
create trigger record_publication_event after update on public.businesses for each row execute function public.track_business_events();


-- 005_updated_start_plan.sql
-- Planos aprovados na landing V5.2: Start 10 produtos; Pro R$54,90/mês.
-- A contratação online permanece desativada até implementação do billing.
-- Não remove ou oculta produtos preexistentes acima do novo limite.
create or replace function public.guard_product_limit() returns trigger
language plpgsql security definer set search_path=public as $$
declare plan text; n int;
begin
 if tg_op='UPDATE' then
   if old.archived_at is null and new.archived_at is null and old.business_id=new.business_id then
     return new; -- Permite editar produtos existentes, inclusive lojas com 11–15.
   end if;
 end if;
 select plan_key into plan from businesses where id=new.business_id for update;
 if new.archived_at is null and plan='start' then
   select count(*) into n from products where business_id=new.business_id and archived_at is null and id<>new.id;
   if n>=10 then raise exception 'O plano Start permite até 10 produtos. Arquive um produto para liberar espaço.'; end if;
 end if;
 return new;
end $$;

-- 006_billing_events.sql
-- Registro de cobrança para o painel de gestão (Portfólio MicroSaaS):
-- status de pagamento da loja + histórico de mudanças de plano.
-- Alimenta MRR, lojas pagantes, conversão grátis→pago, churn e inadimplência.

alter table public.businesses
  add column if not exists billing_status text not null default 'ok'
    check (billing_status in ('ok','past_due','canceled')),
  add column if not exists billing_status_updated_at timestamptz;

create table if not exists public.plan_events (
  id bigint generated always as identity primary key,
  business_id uuid not null references public.businesses(id) on delete cascade,
  kind text not null check (kind in ('upgrade','downgrade','change','cancel','past_due','recovered')),
  from_plan text,
  to_plan text,
  created_at timestamptz not null default now()
);
create index if not exists plan_events_created_idx on public.plan_events (created_at desc);
create index if not exists plan_events_business_idx on public.plan_events (business_id);

-- Só o service role lê/escreve (sem policies = nenhum acesso via anon/authenticated).
alter table public.plan_events enable row level security;

create or replace function public.log_plan_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.plan_key is distinct from old.plan_key then
    insert into public.plan_events(business_id, kind, from_plan, to_plan)
    values (new.id,
      case when old.plan_key = 'start' then 'upgrade'      -- grátis → pago (conversão)
           when new.plan_key = 'start' then 'downgrade'    -- pago → grátis (churn)
           else 'change' end,
      old.plan_key, new.plan_key);
  end if;
  if new.billing_status is distinct from old.billing_status then
    new.billing_status_updated_at := now();
    insert into public.plan_events(business_id, kind, from_plan, to_plan)
    values (new.id,
      case new.billing_status when 'past_due' then 'past_due'
                              when 'canceled' then 'cancel'
                              else 'recovered' end,
      old.plan_key, new.plan_key);
  end if;
  return new;
end $$;

drop trigger if exists businesses_log_plan_change on public.businesses;
create trigger businesses_log_plan_change
  before update of plan_key, billing_status on public.businesses
  for each row execute function public.log_plan_change();

-- 007_asaas_billing.sql
-- Liga cada loja ao cliente/assinatura correspondente no Asaas.
-- O status de pagamento (ok/past_due/canceled) e o historico ja existem
-- desde a migration 006 (billing_status + plan_events); esta migration so
-- guarda os identificadores do Asaas usados pelo webhook pra encontrar a loja.
alter table public.businesses add column if not exists asaas_customer_id text;
alter table public.businesses add column if not exists asaas_subscription_id text;
create unique index if not exists businesses_asaas_subscription_id
  on public.businesses(asaas_subscription_id)
  where asaas_subscription_id is not null;

-- Log bruto dos webhooks do Asaas, pra nao processar o mesmo evento duas vezes
-- (Asaas pode reenviar). So o service_role mexe aqui.
create table if not exists public.asaas_webhook_events (
  id text primary key,
  business_id uuid references public.businesses(id) on delete set null,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz not null default now()
);
alter table public.asaas_webhook_events enable row level security;

commit;
