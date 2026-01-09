# Structure Report

## Canonical folders
- `backend/` — Express/Mongo API
- `site/` — Vite/React public site
- `cms/` — Vite/React CMS
- `docs/` — repository documentation

## Folders to remove/archive
- `trustapi-main/` — not present (no action required)
- `apps/` — not present (no action required)
- Root workspace files (`package.json`, `package-lock.json`) — removed to keep apps fully independent.

## App dependencies (API-only)
- `site/` ➜ communicates with `backend/` via HTTP using `VITE_API_URL`.
- `cms/` ➜ communicates with `backend/` via HTTP using `VITE_API_URL`.
- No imports or path aliases point outside each app’s root.
