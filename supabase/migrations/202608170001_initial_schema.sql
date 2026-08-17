-- SAMPARK: frontend-only Supabase backend
-- Run this file in Supabase Dashboard > SQL Editor > New query.
-- After creating your first Auth user, add that user's UUID to public.admins
-- using the command at the bottom of this file.

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  scan_token uuid not null unique default gen_random_uuid(),
  is_registered boolean not null default false,
  owner_name text,
  owner_mobile text,
  car_number text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  registered_at timestamptz,
  constraint tags_registration_data check (
    (not is_registered and owner_name is null and owner_mobile is null and car_number is null and registered_at is null)
    or
    (is_registered and owner_name is not null and owner_mobile is not null and car_number is not null and registered_at is not null)
  )
);

create index if not exists tags_registered_at_idx on public.tags (registered_at desc);

alter table public.admins enable row level security;
alter table public.tags enable row level security;

-- The browser has no direct table access. It only calls the controlled functions below.
revoke all on table public.admins from anon, authenticated;
revoke all on table public.tags from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.lookup_tag(p_scan_token uuid)
returns table (
  scan_token uuid,
  is_registered boolean,
  owner_name text,
  owner_mobile text,
  car_number text,
  created_at timestamptz,
  registered_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select t.scan_token, t.is_registered,
         case when t.is_registered then t.owner_name end,
         case when t.is_registered then t.owner_mobile end,
         case when t.is_registered then t.car_number end,
         t.created_at,
         t.registered_at
  from public.tags t
  where t.scan_token = p_scan_token;
$$;

create or replace function public.register_tag(
  p_scan_token uuid,
  p_owner_name text,
  p_owner_mobile text,
  p_car_number text
)
returns table (
  scan_token uuid,
  is_registered boolean,
  owner_name text,
  owner_mobile text,
  car_number text,
  created_at timestamptz,
  registered_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tag public.tags%rowtype;
begin
  if length(trim(coalesce(p_owner_name, ''))) < 2
     or length(trim(coalesce(p_owner_mobile, ''))) < 6
     or length(trim(coalesce(p_car_number, ''))) < 3 then
    raise exception 'Please provide a valid name, mobile number, and vehicle number.';
  end if;

  select * into v_tag from public.tags as t where t.scan_token = p_scan_token for update;
  if not found then
    raise exception 'QR tag not found.';
  end if;
  if v_tag.is_registered then
    raise exception 'This QR tag has already been registered.';
  end if;

  update public.tags
  set is_registered = true,
      owner_name = trim(p_owner_name),
      owner_mobile = trim(p_owner_mobile),
      car_number = upper(trim(p_car_number)),
      registered_at = now()
  where id = v_tag.id
  returning * into v_tag;

  return query select v_tag.scan_token, v_tag.is_registered, v_tag.owner_name,
                      v_tag.owner_mobile, v_tag.car_number, v_tag.created_at, v_tag.registered_at;
end;
$$;

create or replace function public.generate_tags(p_count integer default 1)
returns table (scan_token uuid, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required.' using errcode = '42501';
  end if;
  if p_count < 1 or p_count > 100 then
    raise exception 'Generate between 1 and 100 tags at a time.';
  end if;

  return query
  insert into public.tags (created_by)
  select auth.uid() from generate_series(1, p_count)
  returning tags.scan_token, tags.created_at;
end;
$$;

create or replace function public.list_tags()
returns table (
  scan_token uuid,
  is_registered boolean,
  owner_name text,
  owner_mobile text,
  car_number text,
  created_at timestamptz,
  registered_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select t.scan_token, t.is_registered, t.owner_name, t.owner_mobile,
         t.car_number, t.created_at, t.registered_at
  from public.tags t
  where public.is_admin()
  order by t.created_at desc;
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.lookup_tag(uuid) from public;
revoke all on function public.register_tag(uuid, text, text, text) from public;
revoke all on function public.generate_tags(integer) from public;
revoke all on function public.list_tags() from public;
grant execute on function public.lookup_tag(uuid) to anon, authenticated;
grant execute on function public.register_tag(uuid, text, text, text) to anon, authenticated;
grant execute on function public.generate_tags(integer) to authenticated;
grant execute on function public.list_tags() to authenticated;

-- After creating an Auth user in Authentication > Users, run this once:
-- insert into public.admins (user_id) values ('PASTE_THE_AUTH_USER_UUID_HERE');
