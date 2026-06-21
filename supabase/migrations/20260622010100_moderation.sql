-- ============================================================================
-- 0008 moderation — new listings require admin validation before going live
-- Module: announcements (moderation)
--
-- Flow: a merchant creates a listing -> it starts 'pending' (not public). An
-- admin approves it ('active') or rejects it ('rejected'). Merchants can edit
-- and resubmit, but can never set 'active' on a not-yet-approved listing.
-- Enforced server-side so the rule can't be bypassed via the API.
-- ============================================================================

-- New listings await validation by default.
alter table public.announcements alter column status set default 'pending';

-- ----------------------------------------------------------------------------
-- Moderation guard. Admins are unrestricted. For everyone else:
--   * inserts are forced to 'pending'
--   * a listing may not be moved INTO 'active' from 'pending'/'rejected'
--     (i.e. only an admin can approve); reactivating an already-approved
--     listing (sold/inactive -> active) is still allowed
--   * only an admin may set 'rejected'
-- ----------------------------------------------------------------------------
create or replace function public.enforce_moderation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'pending';
    return new;
  end if;

  -- UPDATE by a non-admin
  if new.status = 'active' and old.status in ('pending', 'rejected') then
    raise exception 'Only an administrator can approve a listing';
  end if;
  if new.status = 'rejected' and old.status <> 'rejected' then
    raise exception 'Only an administrator can reject a listing';
  end if;

  return new;
end;
$$;

drop trigger if exists announcements_moderation on public.announcements;
create trigger announcements_moderation
  before insert or update on public.announcements
  for each row execute function public.enforce_moderation();
