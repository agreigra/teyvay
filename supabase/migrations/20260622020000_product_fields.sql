-- ============================================================================
-- 0009 product_fields — optional French content + quantity
-- Module: announcements
-- Listings carry a primary title/description plus an optional French
-- translation, and an optional quantity.
-- ============================================================================

alter table public.announcements add column if not exists title_fr       text;
alter table public.announcements add column if not exists description_fr text;
alter table public.announcements add column if not exists quantity       int;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'announcements_quantity_nonneg'
  ) then
    alter table public.announcements
      add constraint announcements_quantity_nonneg check (quantity is null or quantity >= 0);
  end if;
end$$;
