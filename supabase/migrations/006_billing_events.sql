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
