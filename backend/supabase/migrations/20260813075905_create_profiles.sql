create schema if not exists private;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (length(btrim(display_name)) > 0),
  avatar_url text,
  bio text,
  home_city text,
  home_country_code text check (
    home_country_code is null
    or home_country_code ~ '^[A-Z]{2}$'
  ),
  language_code text not null default 'en' check (
    length(btrim(language_code)) > 0
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to anon, authenticated;
grant update (
  display_name,
  avatar_url,
  bio,
  home_city,
  home_country_code,
  language_code
) on table public.profiles to authenticated;
grant select, insert, update, delete on table public.profiles to service_role;

create policy "Profiles are publicly readable"
on public.profiles
for select
to anon, authenticated
using (true);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create function private.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function private.set_profile_updated_at() from public;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function private.set_profile_updated_at();

create function private.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
      'Traveler'
    )
  );

  return new;
end;
$$;

revoke execute on function private.handle_new_user_profile() from public;

create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row
execute function private.handle_new_user_profile();

insert into public.profiles (id, display_name)
select
  users.id,
  coalesce(
    nullif(btrim(users.raw_user_meta_data ->> 'display_name'), ''),
    'Traveler'
  )
from auth.users as users
on conflict (id) do nothing;
