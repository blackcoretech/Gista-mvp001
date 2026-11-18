-- Enforce one public verification badge per account.
-- Gista Team / Business badges and the official user tick are mutually exclusive.

create or replace function public.enforce_official_badge_priority_from_account_badges()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  delete from public.verified_profiles
  where profile_id = new.user_id
    and verification_type = 'official';
  return new;
end;
$$;

create or replace function public.enforce_official_badge_priority_from_verified_profiles()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.verification_type = 'official' then
    delete from public.account_badges
    where user_id = new.profile_id;
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_official_badge_priority_from_account_badges() from public, anon, authenticated;
revoke all on function public.enforce_official_badge_priority_from_verified_profiles() from public, anon, authenticated;

drop trigger if exists enforce_official_badge_priority_from_account_badges on public.account_badges;
create trigger enforce_official_badge_priority_from_account_badges
after insert or update on public.account_badges
for each row
execute function public.enforce_official_badge_priority_from_account_badges();

drop trigger if exists enforce_official_badge_priority_from_verified_profiles on public.verified_profiles;
create trigger enforce_official_badge_priority_from_verified_profiles
after insert or update on public.verified_profiles
for each row
execute function public.enforce_official_badge_priority_from_verified_profiles();

-- If an account already has both, the newer official team/business assignment wins.
delete from public.verified_profiles v
using public.account_badges b
where v.profile_id = b.user_id
  and v.verification_type = 'official';
