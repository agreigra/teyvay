-- ============================================================================
-- 0002 settings — app_settings key/value store
-- Module: settings
-- Holds runtime-configurable values (e.g. the admin WhatsApp number) so they
-- can change without an app release. RLS is added in the 0004 hardening step
-- (read: any authenticated user; write: admin only).
-- ============================================================================

create table if not exists public.app_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);

comment on table public.app_settings is 'Runtime app configuration (key/value).';

-- Keep updated_at fresh on writes.
create or replace function public.touch_app_settings()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists app_settings_touch on public.app_settings;
create trigger app_settings_touch
  before update on public.app_settings
  for each row execute function public.touch_app_settings();

-- Default admin WhatsApp number (E.164, Mauritania +222). Override via Studio /
-- admin UI; seed.sql may also set this for local dev.
insert into public.app_settings (key, value)
values ('admin_whatsapp_number', '+22200000000')
on conflict (key) do nothing;
