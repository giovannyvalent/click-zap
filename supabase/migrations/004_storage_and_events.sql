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
