# GlobeTrotter backend

Run commands from this directory.

## Local verification

```bash
supabase start
supabase db reset --local --no-seed
docker exec -i supabase_db_backend psql -v ON_ERROR_STOP=1 -U postgres -d postgres \
  < supabase/tests/trip_workflow.sql
supabase db lint --local --level warning
```

## GeoNames catalog

The importer downloads GeoNames `cities15000` and `admin1CodesASCII`, then
upserts by `geonames_id`. Create a dedicated secret key in Supabase under
Settings > API Keys; never put this key in frontend environment files.

```fish
set -x SUPABASE_URL "https://PROJECT.supabase.co"
read --silent --export --prompt-str "Paste Supabase secret key: " SUPABASE_SECRET_KEY
python3 scripts/import_geonames.py --dry-run --limit 5
python3 scripts/import_geonames.py
set --erase SUPABASE_SECRET_KEY
```

City data is provided by GeoNames under its published attribution terms.

## Remote rollout

```bash
supabase db push
supabase functions deploy search-places
supabase functions deploy save-place
```

`FOURSQUARE_SERVICE_KEY` remains an Edge Function secret. No Foursquare key is
used by the browser.
