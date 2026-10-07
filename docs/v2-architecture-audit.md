# V2 Architecture Audit

## Purpose
Keep the V2 app understandable as features are added. A feature is not complete until its active owner is clear, superseded code is retired, persistence is verified, deployment/cache behaviour is checked, and existing meal/lunch behaviour still passes regression testing.

## Active browser dependency path
- `index.html`: app shell, auth, household/week loading, meal rendering, shopping rendering, Done/Reopen, week refresh.
- `config.js`: Supabase public configuration.
- `ui-rustic.js`: presentation enhancement, navigation/day strip/artwork; loads recipe and drag enhancements.
- `week-details.js`: recipe sheet and recipe/source-meal loading.
- `drag-fix.js`: current SortableJS dinner move/swap interaction and persistence.

## Application events
- `week-rendered`: emitted by the core renderer after week DOM is replaced; drag reinitialises from this.
- `meal-moved`: emitted after successful persisted move/swap; core reloads current week in place.
- `meal-move-failed`: emitted after failed/no-op move; core restores current persisted week.

## Current data ownership
- `index.html`: household_users, weeks, meals, shopping_items; RPC set_meal_status.
- `week-details.js`: reads meals for recipe detail and planned-leftover source recipe.
- `drag-fix.js`: calls move_meal / swap_meals REST RPC endpoints.

## Superseded files identified
These are not in the current import chain and duplicate live responsibilities:
- `day-pair-ui.js`: previous pointer-based meal movement.
- `move-ui.js`: previous touch-based move_meal implementation.
- `meal-status-ui.js`: previous meal-status UI implementation.

Retire only after confirming no live references. Git history remains the recovery path; dead implementations should not remain beside the canonical implementation.

## Known cleanup findings
1. Supabase URL/key are duplicated inside drag-fix.js instead of using config.js.
2. drag-fix.js retains abandoned Skip artefacts: renderSkipped(), .meal.skipped and .meal-status-badge CSS.
3. ui-rustic.js and week-details.js use MutationObserver-based enhancement. Review whether explicit week-rendered lifecycle can replace observation.
4. Module cache versions are manually scattered across index.html and ui-rustic.js. This caused a deployed recipe change to remain invisible behind two cached parent modules.
5. Several generations of background/reference assets exist. Do not delete until runtime CSS references and visual fallback purpose are mapped.
6. test.txt appears non-production and should be removed after reference check.
7. README is effectively empty and should eventually point to this architecture and local/deployment conventions.

## Target ownership
- Core/state: authentication, household/week selection, canonical render lifecycle.
- Meal status: one implementation.
- Meal movement: one implementation and one persistence path.
- Recipes: one loader/renderer.
- Shopping: one state owner.
- Presentation: visual enhancement only; no meal business rules.
- Config: one source for public Supabase configuration.

## Change contract
Before merging a feature:
1. Identify its single owning module and data owner.
2. Search for older implementations of the same behaviour.
3. Remove/retire superseded code in the same milestone once regression-safe.
4. Define explicit lifecycle/events; avoid DOM observation where a deterministic event exists.
5. Verify persistence and refresh/reload behaviour.
6. Verify mobile interaction.
7. Verify cache/deployment path, not merely Git commit success.
8. Regression-test Done, Reopen, dinner drag/swap, linked next-day lunch, recipe opening, and week/shop navigation as applicable.
9. For database changes, audit current functions/policies before changing them and apply migrations rather than ad-hoc schema edits.

## Cleanup sequence
A. Document and prove active dependency graph.
B. Retire unreferenced legacy JS and test artefacts.
C. Consolidate shared config and remove abandoned Skip code.
D. Replace avoidable MutationObservers with explicit render lifecycle.
E. Introduce a reliable asset/module versioning strategy.
F. Audit Supabase schema, RPCs, triggers, RLS and indexes.
G. Regression-test before returning to Roadmap 4 feature expansion.
