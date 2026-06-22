-- ============================================================================
-- 0012 support_whatsapp — separate support number from the orders number
-- Module: settings
-- The existing `admin_whatsapp_number` stays the orders / listing-contact line.
-- This adds a distinct `support_whatsapp_number` for help & problem reports.
-- Both are admin-editable (app_settings RLS: read all, write admin).
-- ============================================================================

-- Seed the support number from the existing orders number when present, so the
-- support flow keeps working until an admin sets a dedicated line.
insert into public.app_settings (key, value)
select 'support_whatsapp_number',
       coalesce((select value from public.app_settings
                  where key = 'admin_whatsapp_number'), '+22200000000')
on conflict (key) do nothing;
