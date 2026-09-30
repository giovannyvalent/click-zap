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
