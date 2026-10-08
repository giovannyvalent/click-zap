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
