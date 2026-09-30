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
