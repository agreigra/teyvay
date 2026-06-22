-- ============================================================================
-- 0010 product_en — optional English content
-- Module: announcements
-- Arabic (title/description) is the required primary content; French and now
-- English are optional translations. Display falls back en -> fr -> ar.
-- ============================================================================

alter table public.announcements add column if not exists title_en       text;
alter table public.announcements add column if not exists description_en text;
