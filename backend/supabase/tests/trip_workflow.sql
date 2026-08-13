begin;

insert into auth.users (id) values
  ('00000000-0000-4000-8000-000000000101'),
  ('00000000-0000-4000-8000-000000000202');

insert into public.cities (
  id, geonames_id, name, country_code, region, timezone, latitude, longitude, population
) values (
  910001, 2267057, 'Lisbon', 'PT', 'Lisbon', 'Europe/Lisbon', 38.716667, -9.133333, 517802
);

insert into public.activities (
  id, city_id, fsq_place_id, name, category, latitude, longitude, provider_synced_at
) values (
  920001, 910001, 'fsq-test-place', 'Test Museum', 'culture', 38.71, -9.13, now()
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000101', true);

create temporary table created_trip as
select public.create_trip(jsonb_build_object(
  'title', 'Database Test Trip',
  'description', 'Transactional test',
  'startDate', '2026-09-05',
  'endDate', '2026-09-09',
  'budgetAmount', '1000',
  'currencyCode', 'EUR',
  'stops', jsonb_build_array(jsonb_build_object(
    'cityId', 910001,
    'startDate', '2026-09-05',
    'endDate', '2026-09-09',
    'activityIds', jsonb_build_array(920001)
  ))
)) as id;

do $$
declare
  target_trip_id uuid := (select id from created_trip);
  item_id uuid;
  custom_item_id uuid;
begin
  if (select count(*) from public.trips where id = target_trip_id) <> 1 then
    raise exception 'create_trip did not create one trip';
  end if;
  if (select count(*) from public.trip_stops where trip_stops.trip_id = target_trip_id) <> 1 then
    raise exception 'create_trip did not create one stop';
  end if;
  select itinerary_items.id into item_id
  from public.itinerary_items
  join public.trip_stops on trip_stops.id = itinerary_items.stop_id
  where trip_stops.trip_id = target_trip_id;
  if item_id is null then raise exception 'selected activity was not queued'; end if;
  if (select starts_at from public.itinerary_items where id = item_id) is not null then
    raise exception 'selected activity must begin unscheduled';
  end if;

  begin
    perform public.finish_trip(target_trip_id);
    raise exception 'finish_trip accepted an unscheduled item';
  exception when others then
    if sqlerrm = 'finish_trip accepted an unscheduled item' then raise; end if;
  end;

  perform public.schedule_itinerary_item(item_id, '2026-09-06', '09:00', null);
  custom_item_id := public.add_custom_itinerary_item(
    (select id from public.trip_stops where trip_id = target_trip_id),
    'meal',
    'Test lunch',
    '2026-09-06',
    '12:00',
    20
  );
  perform public.remove_itinerary_item(item_id);
  if (select position from public.itinerary_items where id = custom_item_id) <> 1 then
    raise exception 'remove_itinerary_item did not compact positions';
  end if;
  perform public.finish_trip(target_trip_id);
  if (select state from public.trips where id = target_trip_id) <> 'planned' then
    raise exception 'finish_trip did not plan a valid trip';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000202', true);

do $$
declare
  target_trip_id uuid := (select id from created_trip);
begin
  if (select count(*) from public.trips where id = target_trip_id) <> 0 then
    raise exception 'another user can read a private trip';
  end if;
  if (select count(*) from public.trip_stops where trip_stops.trip_id = target_trip_id) <> 0 then
    raise exception 'another user can read private stops';
  end if;
  if (select count(*) from public.itinerary_items) <> 0 then
    raise exception 'another user can read private items';
  end if;
end;
$$;

reset role;
rollback;
