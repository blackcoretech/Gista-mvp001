-- Gista account badges: additional official team and business badges.
-- The existing verified_profiles workflow remains the source of truth for user verification ticks.
create table if not exists public.account_badges (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  badge_type text not null check (badge_type in ('team', 'business')),
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now()
);

alter table public.account_badges enable row level security;

drop policy if exists "Account badges are publicly readable" on public.account_badges;
create policy "Account badges are publicly readable"
  on public.account_badges for select
  using (true);

drop policy if exists "Gista admins manage account badges" on public.account_badges;
create policy "Gista admins manage account badges"
  on public.account_badges for all
  to authenticated
  using (exists (select 1 from public.gista_admins a where a.user_id = auth.uid() and a.role in ('owner', 'admin')))
  with check (exists (select 1 from public.gista_admins a where a.user_id = auth.uid() and a.role in ('owner', 'admin')));

grant select on public.account_badges to anon, authenticated;
grant insert, update, delete on public.account_badges to authenticated;
