-- Enforce case-insensitive username uniqueness and require a valid username
-- for new accounts that provide one during signup.
create unique index if not exists profiles_username_lower_key
  on public.profiles (lower(username))
  where username is not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $function$
declare
  requested_username text;
  requested_display_name text;
begin
  requested_username := lower(trim(coalesce(new.raw_user_meta_data->>'username', '')));
  requested_display_name := nullif(trim(new.raw_user_meta_data->>'display_name'), '');

  if requested_username <> '' then
    if length(requested_username) < 3 or length(requested_username) > 30
       or requested_username !~ '^[a-z0-9_]+$' then
      raise exception 'USERNAME_INVALID' using errcode = '23514';
    end if;

    if exists (
      select 1 from public.profiles p
      where lower(p.username) = requested_username
        and p.id <> new.id
    ) then
      raise exception 'USERNAME_TAKEN' using errcode = '23505';
    end if;
  else
    requested_username := null;
  end if;

  insert into public.profiles (id, display_name, username, bio)
  values (
    new.id,
    coalesce(requested_display_name, requested_username, ''),
    requested_username,
    ''
  )
  on conflict (id) do nothing;

  return new;
end;
$function$;
