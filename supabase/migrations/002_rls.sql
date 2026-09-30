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
