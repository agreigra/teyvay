-- ============================================================================
-- 0007 moderation_enum — add 'pending' and 'rejected' listing statuses
-- Module: announcements (moderation)
-- Enum values must be added in their own migration so they are committed before
-- the next migration (0008) uses them as a column default / in policies.
-- ============================================================================

alter type public.announcement_status add value if not exists 'pending';
alter type public.announcement_status add value if not exists 'rejected';
