-- Run this in Supabase SQL Editor if you already ran the initial migration.
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
