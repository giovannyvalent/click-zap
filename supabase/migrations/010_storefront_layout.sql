-- Variações de layout da vitrine pública (Minha Loja): grade de 2 ou 3 colunas,
-- lista, cards grandes e destaque. A coluna `layout` (enum grid/list/showcase)
-- continua sendo gravada com o equivalente, então o app funciona sem esta
-- migration (grid3/cards caem para a grade padrão até ela ser aplicada).
-- store_settings não tem grant por coluna: o update do lojista continua
-- liberado pela policy store_settings_admin_update.
alter table public.store_settings
  add column if not exists storefront jsonb not null default '{}'::jsonb;
alter table public.store_settings drop constraint if exists store_settings_storefront_check;
alter table public.store_settings add constraint store_settings_storefront_check
  check (
    jsonb_typeof(storefront) = 'object'
    and (
      not (storefront ? 'layout')
      or storefront->>'layout' in ('grid2','grid3','list','cards','showcase')
    )
  );
