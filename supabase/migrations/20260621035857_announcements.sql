-- ============================================================================
-- 0003 announcements — listings table
-- Module: announcements
-- A merchant creates listings; clients browse active ones. RLS is added in the
-- 0006 hardening step (merchant manages own, public reads active, admin all).
-- ============================================================================

create table if not exists public.announcements (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  price       numeric(12, 2) not null default 0,
  status      public.announcement_status not null default 'active',
  created_by  uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.announcements is 'Marketplace listings (price in MRU).';

create index if not exists announcements_status_idx on public.announcements (status);
create index if not exists announcements_created_by_idx on public.announcements (created_by);

-- Keep updated_at fresh on writes.
create or replace function public.touch_announcements()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists announcements_touch on public.announcements;
create trigger announcements_touch
  before update on public.announcements
  for each row execute function public.touch_announcements();
