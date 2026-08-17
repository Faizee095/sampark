-- Run after the first two migrations.
alter table public.tags
  add column if not exists tag_status text not null default 'active',
  add column if not exists batch_code text,
  add column if not exists order_reference text,
  add column if not exists printed_at timestamptz,
  add column if not exists sold_at timestamptz,
  add column if not exists shipped_at timestamptz,
  add column if not exists shipping_reference text,
  add column if not exists deactivated_at timestamptz,
  add column if not exists reissued_from uuid references public.tags(id);

alter table public.tags drop constraint if exists tags_status_check;
alter table public.tags add constraint tags_status_check check (tag_status in ('active', 'deactivated', 'reissued'));

drop function if exists public.lookup_tag(uuid);
drop function if exists public.register_tag(uuid, text, text, text);
drop function if exists public.generate_tags(integer);
drop function if exists public.list_tags();

create function public.lookup_tag(p_scan_token uuid) returns table (scan_token uuid, is_registered boolean, is_active boolean, owner_name text, owner_mobile text, car_number text, created_at timestamptz, registered_at timestamptz)
language sql security definer set search_path = public as $$
  select t.scan_token, t.is_registered, t.tag_status = 'active',
    case when t.is_registered and t.tag_status = 'active' then t.owner_name end,
    case when t.is_registered and t.tag_status = 'active' then t.owner_mobile end,
    case when t.is_registered and t.tag_status = 'active' then t.car_number end,
    t.created_at, t.registered_at from public.tags t where t.scan_token = p_scan_token;
$$;

create function public.register_tag(p_scan_token uuid, p_owner_name text, p_owner_mobile text, p_car_number text) returns table (scan_token uuid, is_registered boolean, is_active boolean, owner_name text, owner_mobile text, car_number text, created_at timestamptz, registered_at timestamptz)
language plpgsql security definer set search_path = public as $$ declare v_tag public.tags%rowtype; begin
  if length(trim(coalesce(p_owner_name, ''))) < 2 or length(trim(coalesce(p_owner_mobile, ''))) < 6 or length(trim(coalesce(p_car_number, ''))) < 3 then raise exception 'Please provide a valid name, mobile number, and vehicle number.'; end if;
  select * into v_tag from public.tags t where t.scan_token = p_scan_token for update;
  if not found then raise exception 'QR tag not found.'; end if;
  if v_tag.tag_status <> 'active' then raise exception 'This QR tag is no longer active.'; end if;
  if v_tag.is_registered then raise exception 'This QR tag has already been registered.'; end if;
  update public.tags set is_registered = true, owner_name = trim(p_owner_name), owner_mobile = trim(p_owner_mobile), car_number = upper(trim(p_car_number)), registered_at = now() where id = v_tag.id returning * into v_tag;
  return query select v_tag.scan_token, v_tag.is_registered, true, v_tag.owner_name, v_tag.owner_mobile, v_tag.car_number, v_tag.created_at, v_tag.registered_at;
end; $$;

create function public.generate_tags(p_count integer default 1, p_batch_code text default null, p_order_reference text default null) returns table (scan_token uuid, created_at timestamptz)
language plpgsql security definer set search_path = public as $$ declare v_batch text; begin
  if not public.is_admin() then raise exception 'Admin access required.' using errcode = '42501'; end if;
  if p_count < 1 or p_count > 100 then raise exception 'Generate between 1 and 100 tags at a time.'; end if;
  v_batch := coalesce(nullif(trim(p_batch_code), ''), 'SAM-' || to_char(now(), 'YYYYMMDD-HH24MISS'));
  return query insert into public.tags (created_by, batch_code, order_reference) select auth.uid(), v_batch, nullif(trim(p_order_reference), '') from generate_series(1, p_count) returning tags.scan_token, tags.created_at;
end; $$;

create function public.list_tags() returns table (scan_token uuid, is_registered boolean, tag_status text, owner_name text, owner_mobile text, car_number text, batch_code text, order_reference text, created_at timestamptz, registered_at timestamptz, printed_at timestamptz, sold_at timestamptz, shipped_at timestamptz, shipping_reference text)
language sql security definer set search_path = public as $$ select t.scan_token, t.is_registered, t.tag_status, t.owner_name, t.owner_mobile, t.car_number, t.batch_code, t.order_reference, t.created_at, t.registered_at, t.printed_at, t.sold_at, t.shipped_at, t.shipping_reference from public.tags t where public.is_admin() order by t.created_at desc; $$;

create function public.mark_tags_printed(p_tokens uuid[]) returns void language plpgsql security definer set search_path = public as $$ begin if not public.is_admin() then raise exception 'Admin access required.'; end if; update public.tags set printed_at = coalesce(printed_at, now()) where scan_token = any(p_tokens) and tag_status = 'active'; end; $$;
create function public.update_tag_fulfilment(p_tokens uuid[], p_action text, p_shipping_reference text default null) returns void language plpgsql security definer set search_path = public as $$ begin if not public.is_admin() then raise exception 'Admin access required.'; end if; if p_action = 'sold' then update public.tags set sold_at = coalesce(sold_at, now()) where scan_token = any(p_tokens); elsif p_action = 'shipped' then update public.tags set shipped_at = coalesce(shipped_at, now()), shipping_reference = coalesce(nullif(trim(p_shipping_reference), ''), shipping_reference) where scan_token = any(p_tokens); else raise exception 'Unsupported fulfilment action.'; end if; end; $$;
create function public.deactivate_tag(p_token uuid) returns void language plpgsql security definer set search_path = public as $$ begin if not public.is_admin() then raise exception 'Admin access required.'; end if; update public.tags set tag_status = 'deactivated', deactivated_at = now() where scan_token = p_token and tag_status = 'active'; end; $$;
create function public.reissue_tag(p_token uuid) returns table (scan_token uuid) language plpgsql security definer set search_path = public as $$ declare v_old public.tags%rowtype; begin if not public.is_admin() then raise exception 'Admin access required.'; end if; select * into v_old from public.tags t where t.scan_token = p_token for update; if not found or v_old.tag_status <> 'active' then raise exception 'Only active tags can be reissued.'; end if; update public.tags set tag_status = 'reissued', deactivated_at = now() where id = v_old.id; return query insert into public.tags (created_by, batch_code, order_reference, reissued_from) values (auth.uid(), v_old.batch_code, v_old.order_reference, v_old.id) returning tags.scan_token; end; $$;

revoke all on function public.lookup_tag(uuid), public.register_tag(uuid, text, text, text), public.generate_tags(integer, text, text), public.list_tags(), public.mark_tags_printed(uuid[]), public.update_tag_fulfilment(uuid[], text, text), public.deactivate_tag(uuid), public.reissue_tag(uuid) from public;
grant execute on function public.lookup_tag(uuid), public.register_tag(uuid, text, text, text) to anon, authenticated;
grant execute on function public.generate_tags(integer, text, text), public.list_tags(), public.mark_tags_printed(uuid[]), public.update_tag_fulfilment(uuid[], text, text), public.deactivate_tag(uuid), public.reissue_tag(uuid) to authenticated;
