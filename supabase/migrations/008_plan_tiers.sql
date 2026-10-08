-- Reestrutura os planos pagos em dois níveis (antes só existia "pro" sem limite):
-- start (grátis, até 10 produtos) · plus (R$29,90/mês, até 100) · pro (R$59,90/mês, até 1000).
-- pending_plan_key guarda qual plano foi escolhido no checkout do Asaas até o
-- webhook confirmar o primeiro pagamento e promover businesses.plan_key de fato.
alter table public.businesses add column if not exists pending_plan_key text;

create or replace function public.guard_product_limit() returns trigger
language plpgsql security definer set search_path=public as $$
declare plan text; n int; cap int;
begin
 if tg_op='UPDATE' then
   if old.archived_at is null and new.archived_at is null and old.business_id=new.business_id then
     return new; -- Permite editar produtos existentes mesmo acima do limite atual.
   end if;
 end if;
 select plan_key into plan from businesses where id=new.business_id for update;
 cap := case plan when 'start' then 10 when 'plus' then 100 when 'pro' then 1000 else null end;
 if new.archived_at is null and cap is not null then
   select count(*) into n from products where business_id=new.business_id and archived_at is null and id<>new.id;
   if n>=cap then raise exception 'Seu plano atual permite até % produtos. Faça upgrade para cadastrar mais.', cap; end if;
 end if;
 return new;
end $$;
