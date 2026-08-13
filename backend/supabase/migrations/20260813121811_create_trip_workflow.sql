drop index if exists public.cities_normalized_name_country_key;

create index cities_normalized_name_country_idx
on public.cities (lower(btrim(name)), country_code);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (length(btrim(title)) between 1 and 120),
  description text check (description is null or length(description) <= 2000),
  start_date date not null,
  end_date date not null,
  cover_url text,
  budget_amount numeric(12, 2) check (budget_amount is null or budget_amount >= 0),
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  state text not null default 'draft' check (state in ('draft', 'planned', 'archived')),
  visibility text not null default 'private' check (visibility in ('private', 'public')),
  share_slug text unique,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trips_date_order_check check (end_date >= start_date),
  constraint trips_publication_check check (
    (visibility = 'private' and share_slug is null and published_at is null)
    or (visibility = 'public' and share_slug is not null and published_at is not null)
  )
);

create table public.trip_stops (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  city_id bigint not null references public.cities (id),
  position integer not null check (position > 0),
  start_date date,
  end_date date,
  notes text check (notes is null or length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, position),
  constraint trip_stops_date_pair_check check (
    (start_date is null and end_date is null)
    or (start_date is not null and end_date is not null and end_date >= start_date)
  )
);

create table public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  stop_id uuid not null references public.trip_stops (id) on delete cascade,
  activity_id bigint references public.activities (id) on delete set null,
  kind text not null check (kind in ('transport', 'stay', 'activity', 'meal', 'other')),
  title text not null check (length(btrim(title)) between 1 and 200),
  description text check (description is null or length(description) <= 4000),
  starts_at timestamptz,
  ends_at timestamptz,
  position integer not null check (position > 0),
  estimated_cost numeric(12, 2) check (estimated_cost is null or estimated_cost >= 0),
  notes text check (notes is null or length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (stop_id, position),
  constraint itinerary_items_time_order_check check (
    ends_at is null or (starts_at is not null and ends_at > starts_at)
  )
);

create index trips_owner_id_idx on public.trips (owner_id);
create index trips_owner_dates_idx on public.trips (owner_id, start_date, end_date);
create index trips_public_idx on public.trips (published_at desc) where visibility = 'public';
create index trip_stops_trip_id_idx on public.trip_stops (trip_id);
create index trip_stops_city_id_idx on public.trip_stops (city_id);
create index itinerary_items_stop_id_idx on public.itinerary_items (stop_id);
create index itinerary_items_activity_id_idx on public.itinerary_items (activity_id);
create index itinerary_items_starts_at_idx on public.itinerary_items (starts_at);

create trigger touch_trips_updated_at
before update on public.trips
for each row execute function private.touch_catalog_updated_at();

create trigger touch_trip_stops_updated_at
before update on public.trip_stops
for each row execute function private.touch_catalog_updated_at();

create trigger touch_itinerary_items_updated_at
before update on public.itinerary_items
for each row execute function private.touch_catalog_updated_at();

alter table public.trips enable row level security;
alter table public.trip_stops enable row level security;
alter table public.itinerary_items enable row level security;

revoke all on table public.trips, public.trip_stops, public.itinerary_items
from anon, authenticated, service_role;

grant select, delete on table public.trips to authenticated;
grant update (title, description, start_date, end_date, cover_url, budget_amount, currency_code)
on table public.trips to authenticated;
grant select on table public.trip_stops, public.itinerary_items to authenticated;
grant update (city_id, start_date, end_date, notes) on table public.trip_stops to authenticated;
grant update (kind, title, description, estimated_cost, notes) on table public.itinerary_items to authenticated;
grant all on table public.trips, public.trip_stops, public.itinerary_items to service_role;

create policy "Users can read owned or public trips"
on public.trips for select to authenticated
using (owner_id = (select auth.uid()) or visibility = 'public');

create policy "Users can create their own draft trips"
on public.trips for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and state = 'draft'
  and visibility = 'private'
);

create policy "Owners can update their trips"
on public.trips for update to authenticated
using (owner_id = (select auth.uid()) and state = 'draft')
with check (owner_id = (select auth.uid()) and state = 'draft');

create policy "Owners can delete their trips"
on public.trips for delete to authenticated
using (owner_id = (select auth.uid()));

create policy "Users can read stops for visible trips"
on public.trip_stops for select to authenticated
using (exists (
  select 1 from public.trips
  where trips.id = trip_stops.trip_id
    and (trips.owner_id = (select auth.uid()) or trips.visibility = 'public')
));

create policy "Owners can create stops for draft trips"
on public.trip_stops for insert to authenticated
with check (exists (
  select 1 from public.trips
  where trips.id = trip_stops.trip_id
    and trips.owner_id = (select auth.uid())
    and trips.state = 'draft'
));

create policy "Owners can update stops for draft trips"
on public.trip_stops for update to authenticated
using (exists (
  select 1 from public.trips
  where trips.id = trip_stops.trip_id
    and trips.owner_id = (select auth.uid())
    and trips.state = 'draft'
))
with check (exists (
  select 1 from public.trips
  where trips.id = trip_stops.trip_id
    and trips.owner_id = (select auth.uid())
    and trips.state = 'draft'
));

create policy "Owners can delete stops from draft trips"
on public.trip_stops for delete to authenticated
using (exists (
  select 1 from public.trips
  where trips.id = trip_stops.trip_id
    and trips.owner_id = (select auth.uid())
    and trips.state = 'draft'
));

create policy "Users can read items for visible trips"
on public.itinerary_items for select to authenticated
using (exists (
  select 1
  from public.trip_stops
  join public.trips on trips.id = trip_stops.trip_id
  where trip_stops.id = itinerary_items.stop_id
    and (trips.owner_id = (select auth.uid()) or trips.visibility = 'public')
));

create policy "Owners can create items for draft trips"
on public.itinerary_items for insert to authenticated
with check (exists (
  select 1
  from public.trip_stops
  join public.trips on trips.id = trip_stops.trip_id
  where trip_stops.id = itinerary_items.stop_id
    and trips.owner_id = (select auth.uid())
    and trips.state = 'draft'
));

create policy "Owners can update items for draft trips"
on public.itinerary_items for update to authenticated
using (exists (
  select 1
  from public.trip_stops
  join public.trips on trips.id = trip_stops.trip_id
  where trip_stops.id = itinerary_items.stop_id
    and trips.owner_id = (select auth.uid())
    and trips.state = 'draft'
))
with check (exists (
  select 1
  from public.trip_stops
  join public.trips on trips.id = trip_stops.trip_id
  where trip_stops.id = itinerary_items.stop_id
    and trips.owner_id = (select auth.uid())
    and trips.state = 'draft'
));

create policy "Owners can delete items from draft trips"
on public.itinerary_items for delete to authenticated
using (exists (
  select 1
  from public.trip_stops
  join public.trips on trips.id = trip_stops.trip_id
  where trip_stops.id = itinerary_items.stop_id
    and trips.owner_id = (select auth.uid())
    and trips.state = 'draft'
));

create function public.create_trip(input jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  created_trip_id uuid;
  created_stop_id uuid;
  stop jsonb;
  selected_activity jsonb;
  stop_city_id bigint;
  stop_position integer := 0;
  item_position integer;
  trip_start date;
  trip_end date;
begin
  if caller_id is null then raise exception 'Authentication required'; end if;
  if jsonb_typeof(input) <> 'object' then raise exception 'Trip input must be an object'; end if;
  if jsonb_typeof(input -> 'stops') <> 'array' or jsonb_array_length(input -> 'stops') = 0 then
    raise exception 'At least one stop is required';
  end if;

  trip_start := (input ->> 'startDate')::date;
  trip_end := (input ->> 'endDate')::date;
  if trip_end < trip_start then raise exception 'Trip end date cannot precede its start date'; end if;

  insert into public.trips (
    owner_id, title, description, start_date, end_date, budget_amount, currency_code
  ) values (
    caller_id,
    btrim(input ->> 'title'),
    nullif(btrim(input ->> 'description'), ''),
    trip_start,
    trip_end,
    nullif(input ->> 'budgetAmount', '')::numeric,
    upper(input ->> 'currencyCode')
  ) returning id into created_trip_id;

  for stop in select value from jsonb_array_elements(input -> 'stops') loop
    stop_position := stop_position + 1;
    stop_city_id := (stop ->> 'cityId')::bigint;

    if not exists (select 1 from public.cities where id = stop_city_id) then
      raise exception 'Unknown city at stop %', stop_position;
    end if;
    if (stop ->> 'startDate') is not null and (
      (stop ->> 'startDate')::date < trip_start or (stop ->> 'startDate')::date > trip_end
    ) then raise exception 'Stop % starts outside the trip', stop_position; end if;
    if (stop ->> 'endDate') is not null and (
      (stop ->> 'endDate')::date < trip_start or (stop ->> 'endDate')::date > trip_end
    ) then raise exception 'Stop % ends outside the trip', stop_position; end if;

    insert into public.trip_stops (trip_id, city_id, position, start_date, end_date)
    values (
      created_trip_id,
      stop_city_id,
      stop_position,
      nullif(stop ->> 'startDate', '')::date,
      nullif(stop ->> 'endDate', '')::date
    ) returning id into created_stop_id;

    item_position := 0;
    if jsonb_typeof(stop -> 'activityIds') = 'array' then
      for selected_activity in select value from jsonb_array_elements(stop -> 'activityIds') loop
        item_position := item_position + 1;
        insert into public.itinerary_items (
          stop_id, activity_id, kind, title, description, position, estimated_cost
        )
        select
          created_stop_id,
          activities.id,
          case when activities.category = 'food' then 'meal' else 'activity' end,
          activities.name,
          activities.description,
          item_position,
          activities.estimated_cost
        from public.activities
        where activities.id = (selected_activity #>> '{}')::bigint
          and activities.city_id = stop_city_id;

        if not found then raise exception 'Activity % does not belong to stop %', selected_activity, stop_position; end if;
      end loop;
    end if;
  end loop;

  return created_trip_id;
end;
$$;

create function public.search_city_catalog(p_query text, p_limit integer default 20)
returns setof public.cities
language sql
stable
set search_path = ''
as $$
  select cities.*
  from public.cities
  where length(btrim(p_query)) >= 2
    and (
      lower(cities.name) operator(extensions.%) lower(btrim(p_query))
      or lower(cities.name) like '%' || lower(btrim(p_query)) || '%'
      or lower(coalesce(cities.region, '')) like '%' || lower(btrim(p_query)) || '%'
    )
  order by
    extensions.similarity(lower(cities.name), lower(btrim(p_query))) desc,
    cities.population desc nulls last,
    cities.name
  limit least(greatest(p_limit, 1), 50);
$$;

create function public.add_activity_to_stop(p_stop_id uuid, p_activity_id bigint)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_item_id uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_stop_id::text, 0));

  insert into public.itinerary_items (
    stop_id, activity_id, kind, title, description, position, estimated_cost
  )
  select
    trip_stops.id,
    activities.id,
    case when activities.category = 'food' then 'meal' else 'activity' end,
    activities.name,
    activities.description,
    coalesce((select max(position) + 1 from public.itinerary_items where stop_id = p_stop_id), 1),
    activities.estimated_cost
  from public.trip_stops
  join public.trips on trips.id = trip_stops.trip_id
  join public.activities on activities.id = p_activity_id and activities.city_id = trip_stops.city_id
  where trip_stops.id = p_stop_id
    and trips.owner_id = (select auth.uid())
    and trips.state = 'draft'
  returning id into created_item_id;

  if created_item_id is null then raise exception 'Stop or activity is unavailable'; end if;
  return created_item_id;
end;
$$;

create function public.schedule_itinerary_item(
  p_item_id uuid,
  p_local_date date,
  p_local_time time,
  p_estimated_cost numeric default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  stop_start date;
  stop_end date;
  city_timezone text;
begin
  select trip_stops.start_date, trip_stops.end_date, cities.timezone
  into stop_start, stop_end, city_timezone
  from public.itinerary_items
  join public.trip_stops on trip_stops.id = itinerary_items.stop_id
  join public.trips on trips.id = trip_stops.trip_id
  join public.cities on cities.id = trip_stops.city_id
  where itinerary_items.id = p_item_id
    and trips.owner_id = (select auth.uid())
    and trips.state = 'draft';

  if not found then raise exception 'Item is unavailable'; end if;
  if stop_start is null or p_local_date < stop_start or p_local_date > stop_end then
    raise exception 'Item date must be inside the stop dates';
  end if;
  if p_estimated_cost is not null and p_estimated_cost < 0 then
    raise exception 'Cost cannot be negative';
  end if;

  update public.itinerary_items
  set starts_at = (p_local_date + p_local_time) at time zone city_timezone,
      estimated_cost = p_estimated_cost
  where id = p_item_id;
end;
$$;

create function public.add_custom_itinerary_item(
  p_stop_id uuid,
  p_kind text,
  p_title text,
  p_local_date date,
  p_local_time time,
  p_estimated_cost numeric default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_item_id uuid;
  city_timezone text;
  stop_start date;
  stop_end date;
begin
  if p_kind not in ('transport', 'stay', 'activity', 'meal', 'other') then raise exception 'Invalid item kind'; end if;
  if length(btrim(p_title)) = 0 then raise exception 'Item title is required'; end if;
  if p_estimated_cost is not null and p_estimated_cost < 0 then raise exception 'Cost cannot be negative'; end if;

  perform pg_advisory_xact_lock(hashtextextended(p_stop_id::text, 0));
  select cities.timezone, trip_stops.start_date, trip_stops.end_date
  into city_timezone, stop_start, stop_end
  from public.trip_stops
  join public.trips on trips.id = trip_stops.trip_id
  join public.cities on cities.id = trip_stops.city_id
  where trip_stops.id = p_stop_id
    and trips.owner_id = (select auth.uid())
    and trips.state = 'draft';

  if not found then raise exception 'Stop is unavailable'; end if;
  if stop_start is null or p_local_date < stop_start or p_local_date > stop_end then
    raise exception 'Item date must be inside the stop dates';
  end if;

  insert into public.itinerary_items (
    stop_id, kind, title, starts_at, position, estimated_cost
  ) values (
    p_stop_id,
    p_kind,
    btrim(p_title),
    (p_local_date + p_local_time) at time zone city_timezone,
    coalesce((select max(position) + 1 from public.itinerary_items where stop_id = p_stop_id), 1),
    p_estimated_cost
  ) returning id into created_item_id;
  return created_item_id;
end;
$$;

create function public.reorder_trip_stops(p_trip_id uuid, p_ordered_stop_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  expected_count integer;
  supplied_count integer := coalesce(cardinality(p_ordered_stop_ids), 0);
  position_offset integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_trip_id::text, 0));
  if not exists (
    select 1 from public.trips
    where id = p_trip_id and owner_id = (select auth.uid()) and state = 'draft'
  ) then raise exception 'Trip is unavailable'; end if;

  select count(*) into expected_count from public.trip_stops where trip_id = p_trip_id;
  if supplied_count <> expected_count
    or (select count(distinct value) from unnest(p_ordered_stop_ids) value) <> supplied_count
    or exists (
      select 1 from unnest(p_ordered_stop_ids) value
      where not exists (select 1 from public.trip_stops where id = value and trip_id = p_trip_id)
    )
  then raise exception 'Stop order must contain every current stop exactly once'; end if;

  select coalesce(max(position), 0) + supplied_count + 1
  into position_offset
  from public.trip_stops
  where trip_id = p_trip_id;

  update public.trip_stops
  set position = position + position_offset
  where trip_id = p_trip_id;
  update public.trip_stops
  set position = ordered.position
  from unnest(p_ordered_stop_ids) with ordinality ordered(id, position)
  where trip_stops.id = ordered.id;
end;
$$;

create function public.remove_itinerary_item(p_item_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_stop_id uuid;
  removed_position integer;
  position_offset integer;
begin
  select itinerary_items.stop_id, itinerary_items.position
  into target_stop_id, removed_position
  from public.itinerary_items
  join public.trip_stops on trip_stops.id = itinerary_items.stop_id
  join public.trips on trips.id = trip_stops.trip_id
  where itinerary_items.id = p_item_id
    and trips.owner_id = (select auth.uid())
    and trips.state = 'draft';

  if not found then raise exception 'Item is unavailable'; end if;
  perform pg_advisory_xact_lock(hashtextextended(target_stop_id::text, 0));
  delete from public.itinerary_items where id = p_item_id;

  select coalesce(max(position), 0) + 1
  into position_offset
  from public.itinerary_items
  where stop_id = target_stop_id;

  update public.itinerary_items
  set position = position + position_offset
  where stop_id = target_stop_id and position > removed_position;
  update public.itinerary_items
  set position = position - position_offset - 1
  where stop_id = target_stop_id
    and position > removed_position + position_offset;
end;
$$;

create function public.reorder_itinerary_items(p_stop_id uuid, p_ordered_item_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  expected_count integer;
  supplied_count integer := coalesce(cardinality(p_ordered_item_ids), 0);
  position_offset integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_stop_id::text, 0));
  if not exists (
    select 1 from public.trip_stops
    join public.trips on trips.id = trip_stops.trip_id
    where trip_stops.id = p_stop_id
      and trips.owner_id = (select auth.uid())
      and trips.state = 'draft'
  ) then raise exception 'Stop is unavailable'; end if;

  select count(*) into expected_count from public.itinerary_items where stop_id = p_stop_id;
  if supplied_count <> expected_count
    or (select count(distinct value) from unnest(p_ordered_item_ids) value) <> supplied_count
    or exists (
      select 1 from unnest(p_ordered_item_ids) value
      where not exists (select 1 from public.itinerary_items where id = value and stop_id = p_stop_id)
    )
  then raise exception 'Item order must contain every current item exactly once'; end if;

  select coalesce(max(position), 0) + supplied_count + 1
  into position_offset
  from public.itinerary_items
  where stop_id = p_stop_id;

  update public.itinerary_items
  set position = position + position_offset
  where stop_id = p_stop_id;
  update public.itinerary_items
  set position = ordered.position
  from unnest(p_ordered_item_ids) with ordinality ordered(id, position)
  where itinerary_items.id = ordered.id;
end;
$$;

create function public.finish_trip(p_trip_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.trips
    where id = p_trip_id and owner_id = (select auth.uid()) and state = 'draft'
  ) then raise exception 'Draft trip is unavailable'; end if;
  if not exists (select 1 from public.trip_stops where trip_id = p_trip_id) then
    raise exception 'A trip needs at least one stop';
  end if;
  if exists (
    select 1 from public.trip_stops
    join public.trips on trips.id = trip_stops.trip_id
    where trip_stops.trip_id = p_trip_id
      and (
        trip_stops.start_date is null or trip_stops.end_date is null
        or trip_stops.start_date < trips.start_date or trip_stops.end_date > trips.end_date
      )
  ) then raise exception 'Every stop needs valid dates inside the trip'; end if;
  if exists (
    select 1
    from public.trip_stops earlier
    join public.trip_stops later
      on later.trip_id = earlier.trip_id and later.position = earlier.position + 1
    where earlier.trip_id = p_trip_id and later.start_date < earlier.end_date
  ) then raise exception 'Ordered stops cannot overlap'; end if;
  if exists (
    select 1 from public.itinerary_items
    join public.trip_stops on trip_stops.id = itinerary_items.stop_id
    join public.cities on cities.id = trip_stops.city_id
    where trip_stops.trip_id = p_trip_id
      and (
        itinerary_items.starts_at is null
        or (itinerary_items.starts_at at time zone cities.timezone)::date
          not between trip_stops.start_date and trip_stops.end_date
      )
  ) then raise exception 'Schedule every item inside its stop before finishing'; end if;

  update public.trips set state = 'planned' where id = p_trip_id;
end;
$$;

revoke execute on function public.create_trip(jsonb) from public, anon;
revoke execute on function public.search_city_catalog(text, integer) from public, anon;
revoke execute on function public.add_activity_to_stop(uuid, bigint) from public, anon;
revoke execute on function public.schedule_itinerary_item(uuid, date, time, numeric) from public, anon;
revoke execute on function public.add_custom_itinerary_item(uuid, text, text, date, time, numeric) from public, anon;
revoke execute on function public.reorder_trip_stops(uuid, uuid[]) from public, anon;
revoke execute on function public.remove_itinerary_item(uuid) from public, anon;
revoke execute on function public.reorder_itinerary_items(uuid, uuid[]) from public, anon;
revoke execute on function public.finish_trip(uuid) from public, anon;

grant execute on function public.create_trip(jsonb) to authenticated;
grant execute on function public.search_city_catalog(text, integer) to authenticated;
grant execute on function public.add_activity_to_stop(uuid, bigint) to authenticated;
grant execute on function public.schedule_itinerary_item(uuid, date, time, numeric) to authenticated;
grant execute on function public.add_custom_itinerary_item(uuid, text, text, date, time, numeric) to authenticated;
grant execute on function public.reorder_trip_stops(uuid, uuid[]) to authenticated;
grant execute on function public.remove_itinerary_item(uuid) to authenticated;
grant execute on function public.reorder_itinerary_items(uuid, uuid[]) to authenticated;
grant execute on function public.finish_trip(uuid) to authenticated;
