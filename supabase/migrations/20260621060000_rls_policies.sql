-- ============================================================================
-- 0006 rls_policies — enable + define Row-Level Security on every table
-- Module: hardening
--
-- Security model:
--   profiles      — own row read/update; admin reads/updates all. No self
--                   escalation to admin. Rows created by the signup trigger
--                   (SECURITY DEFINER, bypasses RLS).
--   announcements — public/anon read of ACTIVE listings whose owner is active
--                   (not soft-deleted); owner reads/writes own; admin all.
--   app_settings  — public/anon read (whatsapp number); admin writes.
--
-- Helpers current_user_role()/is_admin() are SECURITY DEFINER (0001) so they
-- read profiles without tripping these policies. user_is_active() (below) is
-- the same pattern so the public listings policy can check an owner's
-- deleted_at without granting profile read access.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helper: is a given user active (exists and not soft-deleted)?
-- ----------------------------------------------------------------------------
create or replace function public.user_is_active(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and deleted_at is null
  );
$$;

-- ============================================================================
-- profiles
-- ============================================================================
alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_select_admin on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists profiles_update_admin on public.profiles;

-- Read your own profile (needed even when soft-deleted, for reactivation).
create policy profiles_select_own
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- Admin reads every profile (user management).
create policy profiles_select_admin
  on public.profiles for select
  to authenticated
  using (public.is_admin());

-- Update your own profile (edit info, soft-delete, reactivate, onboarding role).
-- WITH CHECK forbids a non-admin from escalating their own role to 'admin'.
create policy profiles_update_own
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id and (role <> 'admin' or public.is_admin()));

-- Admin updates any profile (change roles, ban/unban).
create policy profiles_update_admin
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- No INSERT policy: profiles are created by the signup trigger (bypasses RLS).
-- No DELETE policy: accounts are soft-deleted, never hard-deleted from the app.

-- ============================================================================
-- announcements
-- ============================================================================
alter table public.announcements enable row level security;

drop policy if exists announcements_select_public on public.announcements;
drop policy if exists announcements_select_own on public.announcements;
drop policy if exists announcements_select_admin on public.announcements;
drop policy if exists announcements_insert_own on public.announcements;
drop policy if exists announcements_update_own on public.announcements;
drop policy if exists announcements_update_admin on public.announcements;
drop policy if exists announcements_delete_admin on public.announcements;

-- Public/guest browse: active listings from active (non-deleted) owners only.
create policy announcements_select_public
  on public.announcements for select
  to anon, authenticated
  using (status = 'active' and public.user_is_active(created_by));

-- Owners see all their own listings regardless of status.
create policy announcements_select_own
  on public.announcements for select
  to authenticated
  using (created_by = auth.uid());

-- Admin sees everything.
create policy announcements_select_admin
  on public.announcements for select
  to authenticated
  using (public.is_admin());

-- Merchants (and admins) create listings they own.
create policy announcements_insert_own
  on public.announcements for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and public.current_user_role() in ('merchant', 'admin')
  );

-- Owners edit / change status of their own listings.
create policy announcements_update_own
  on public.announcements for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

-- Admin edits / moderates any listing.
create policy announcements_update_admin
  on public.announcements for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Admin may hard-delete (moderation); owners archive (status=inactive) instead.
create policy announcements_delete_admin
  on public.announcements for delete
  to authenticated
  using (public.is_admin());

-- ============================================================================
-- app_settings
-- ============================================================================
alter table public.app_settings enable row level security;

drop policy if exists app_settings_select_all on public.app_settings;
drop policy if exists app_settings_write_admin on public.app_settings;

-- Anyone (incl. guests) can read settings — the contact WhatsApp number must be
-- available before login.
create policy app_settings_select_all
  on public.app_settings for select
  to anon, authenticated
  using (true);

-- Only admins write settings.
create policy app_settings_write_admin
  on public.app_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
