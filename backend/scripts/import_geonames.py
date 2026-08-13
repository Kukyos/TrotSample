#!/usr/bin/env python3
"""Import the GeoNames cities15000 catalog into Supabase.

Requires SUPABASE_URL and SUPABASE_SECRET_KEY. The script downloads the official
GeoNames files, normalizes them, and upserts in bounded REST batches. It is safe
to rerun because geonames_id is the conflict key. The legacy
SUPABASE_SERVICE_ROLE_KEY remains supported during migration.
"""

from __future__ import annotations

import argparse
import io
import json
import os
import sys
import urllib.error
import urllib.request
import zipfile

CITIES_URL = "https://download.geonames.org/export/dump/cities15000.zip"
ADMIN_URL = "https://download.geonames.org/export/dump/admin1CodesASCII.txt"


def download(url: str) -> bytes:
    with urllib.request.urlopen(url, timeout=60) as response:
        return response.read()


def admin_regions(raw: bytes) -> dict[str, str]:
    regions: dict[str, str] = {}
    for line in raw.decode("utf-8").splitlines():
        columns = line.split("\t")
        if len(columns) >= 2:
            regions[columns[0]] = columns[1]
    return regions


def city_rows(cities_zip: bytes, regions: dict[str, str], limit: int | None):
    with zipfile.ZipFile(io.BytesIO(cities_zip)) as archive:
        with archive.open("cities15000.txt") as source:
            for index, raw_line in enumerate(source):
                if limit is not None and index >= limit:
                    return
                columns = raw_line.decode("utf-8").rstrip("\n").split("\t")
                country_code = columns[8].upper()
                admin_code = columns[10]
                yield {
                    "geonames_id": int(columns[0]),
                    "name": columns[1],
                    "country_code": country_code,
                    "region": regions.get(f"{country_code}.{admin_code}") or None,
                    "timezone": columns[17],
                    "latitude": float(columns[4]),
                    "longitude": float(columns[5]),
                    "population": int(columns[14]) if columns[14] else None,
                }


def chunks(rows, size: int):
    batch = []
    for row in rows:
        batch.append(row)
        if len(batch) == size:
            yield batch
            batch = []
    if batch:
        yield batch


def upsert(url: str, service_key: str, rows: list[dict]) -> None:
    endpoint = f"{url.rstrip('/')}/rest/v1/cities?on_conflict=geonames_id"
    headers = {
        "apikey": service_key,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    if not service_key.startswith("sb_secret_"):
        headers["Authorization"] = f"Bearer {service_key}"
    request = urllib.request.Request(
        endpoint,
        data=json.dumps(rows, ensure_ascii=False).encode("utf-8"),
        method="POST",
        headers=headers,
    )
    with urllib.request.urlopen(request, timeout=60):
        pass


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--limit", type=int, help="Import only the first N rows for verification.")
    parser.add_argument("--batch-size", type=int, default=500)
    parser.add_argument("--dry-run", action="store_true", help="Download and parse without writing.")
    args = parser.parse_args()

    if args.limit is not None and args.limit < 1:
        parser.error("--limit must be positive")
    if not 1 <= args.batch_size <= 1000:
        parser.error("--batch-size must be between 1 and 1000")

    url = os.environ.get("SUPABASE_URL", "")
    service_key = os.environ.get("SUPABASE_SECRET_KEY", "") or os.environ.get(
        "SUPABASE_SERVICE_ROLE_KEY", ""
    )
    if not args.dry_run and (not url or not service_key):
        parser.error("SUPABASE_URL and SUPABASE_SECRET_KEY are required")

    print("Downloading GeoNames cities15000 and administrative regions…")
    rows = city_rows(download(CITIES_URL), admin_regions(download(ADMIN_URL)), args.limit)
    imported = 0
    try:
        for batch in chunks(rows, args.batch_size):
            if not args.dry_run:
                upsert(url, service_key, batch)
            imported += len(batch)
            print(f"Processed {imported} cities", file=sys.stderr)
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        print(f"GeoNames import failed with HTTP {error.code}: {detail}", file=sys.stderr)
        return 1

    action = "Parsed" if args.dry_run else "Imported"
    print(f"{action} {imported} GeoNames cities.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
