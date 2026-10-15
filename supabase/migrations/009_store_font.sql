-- Permite escolher a fonte da vitrine pública (antes só existia Inter, fixo).
alter table public.store_settings add column if not exists font text not null default 'inter';
alter table public.store_settings drop constraint if exists store_settings_font_check;
alter table public.store_settings add constraint store_settings_font_check
  check (font in ('inter','poppins','playfair','dm_sans'));
