-- The Mopane security hardening migration
-- Run this entire file once in Supabase Dashboard > SQL Editor.
-- It is safe to run again after future policy changes.

-- Security-definer functions must not inherit a caller-controlled search path.
create or replace function private.is_staff()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = (select auth.uid())
      and role in ('editor', 'admin')
  );
$$;

-- Remove implicit function access and grant only what the application needs.
revoke all on function private.is_staff() from public, anon;
grant execute on function private.is_staff() to authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;

-- Reassert least-privilege table permissions. RLS policies still decide which
-- individual rows each request may access.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;

revoke all on public.stories from anon, authenticated;
grant select on public.stories to anon, authenticated;
grant insert, update, delete on public.stories to authenticated;

revoke all on public.page_views from anon, authenticated;
grant insert on public.page_views to anon, authenticated;
grant select on public.page_views to authenticated;

revoke all on public.support_tickets from anon, authenticated;
grant insert on public.support_tickets to anon, authenticated;
grant select, update on public.support_tickets to authenticated;

-- Keep every exposed table behind Row Level Security, including table-owner
-- access where Postgres permits it.
alter table public.profiles enable row level security;
alter table public.stories enable row level security;
alter table public.page_views enable row level security;
alter table public.support_tickets enable row level security;
alter table public.profiles force row level security;
alter table public.stories force row level security;
alter table public.page_views force row level security;
alter table public.support_tickets force row level security;

-- Bound analytics input so the public insert endpoint cannot store oversized
-- paths, referrers, slugs, or session identifiers.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'page_views_path_length') then
    alter table public.page_views add constraint page_views_path_length
      check (char_length(path) between 1 and 500);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'page_views_story_slug_length') then
    alter table public.page_views add constraint page_views_story_slug_length
      check (story_slug is null or char_length(story_slug) <= 160);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'page_views_referrer_length') then
    alter table public.page_views add constraint page_views_referrer_length
      check (referrer is null or char_length(referrer) <= 255);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'page_views_session_length') then
    alter table public.page_views add constraint page_views_session_length
      check (session_id is null or char_length(session_id) <= 100);
  end if;
end
$$;
