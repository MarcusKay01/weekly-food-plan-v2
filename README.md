# Weekly Food Plan

Shared household app on GitHub Pages with Supabase persistence and household RLS.

## Owners
- app.js: auth, current week, guarded loading, realtime, shopping and meal actions.
- db.js: the single pinned Supabase client; config.js contains public configuration only.
- shared.js: pure date, allocation, pricing and rendering helpers.
- week-details.js: canonical recipe viewer, cooking checklist, timer, feedback.
- more-settings.js / ui-rustic.js: household, spending ledger, family and planning brief.
- drag-fix.js: optional Sortable drag; tap/keyboard Move works without this dependency.
- design-system.css: the only active visual stylesheet.

## Verify and release
Run npm test and npm run check. Run node scripts/stamp.mjs before publishing; it stamps all local module/style imports together. Verify Pages deployment and the build meta marker, plus Week/Shop/More, recipes, moves and the spending ledger.

Database migration SQL is committed under supabase/migrations. Recipe detail imports retain current quantities and use exact source ingredient matching. Canonical recipes are now stored in meals.recipe_detail; the original one-week JSON is retained as import provenance, not read at runtime.

Archived weeks are protected from client writes. Supabase privileged maintenance remains possible. Spending totals derive from non-voided transactions; the earlier saved total is an opening entry. Excluding an entry is reversible.

Offline access is read-only: the most recently loaded household snapshot is stored on this device under the signed-in user ID. Signing out removes it. The service worker caches only the public app shell/dependencies, never Supabase API responses. Reconnect for edits. A first online visit is required to populate the cache. Offline queued edits are deliberately not enabled.

Family profiles and attendance feed visible plan checks and the next-week brief. This app does not autonomously generate menus or make allergy decisions. Review suggested quantities and confirmed meal attendance before cooking.

Backout: restore the preceding frontend commit; the additive database fields retain the old base fields. Do not delete ledger entries or migrations to roll back a UI change.
