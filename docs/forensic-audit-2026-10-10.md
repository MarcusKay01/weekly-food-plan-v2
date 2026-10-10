# Food planner forensic audit — 10 October 2026

## Verdict
The app is a useful shared weekly menu and categorized checklist, with a coherent visual identity. It is not yet an integrated planning, inventory and budgeting system. Prioritize reliable state, consistent recipe data and completed family/budget workflows before feature expansion.

Reviewed revision: 5cb167f844b18330b4184b58df2078ff3fe49190.
Scope: all active frontend modules and styles, repository inventory and architecture documentation; live Week/More/Home/Budget/Family views; read-only database policies, functions, triggers, realtime publication and current-week data; Supabase security/performance advisors. No production data or application logic changed during this audit. No destructive or multi-user mutation tests were performed. Performance findings are source/asset analysis, not measured network benchmarks. Browser check at existing desktop viewport: no horizontal overflow; 14 visible weekly rows plus one boundary lunch. Earlier live navigation in this session showed duplicate boundary blocks; a fresh audit page showed one.

## Confirmed strengths
- One bottom navigation with Week, Shop and More.
- Opaque reading surfaces, consistent cream/green/terracotta palette, separate preparation text.
- All 17 public database tables have RLS enabled; household records are protected by membership predicates.
- Core movement/status RPCs are security invoker functions. swap_meals checks current week and household membership.
- Shopping realtime publication is enabled and frontend subscribes by week.
- Original recipe overlay guards prevent expanded content replacing subsequently edited recipes.
- Shopping renderer has a request sequence guard and escaped item names.
- Former duplicate JS movement implementations were retired. Old audit documentation describing duplicated config and MutationObservers is now stale.

## Prioritized findings

### High — scheduling and recipe meaning diverge
Database schedule is correctly movable, but portions.allocation strings contain original weekdays. Thai dinner is now Monday with Tuesday lunch, while its recipe says Wednesday lunches; Cajun Thursday recipe says Tuesday lunches; pie Tuesday says Thursday work lunches; noodles Wednesday still references Friday lunches and nursery assumptions. These are real cooking/portion-planning ambiguities.
Fix: derive dates and meal allocations from structured schedule data. Keep attendance/nursery requirements explicit and warn before moving a meal into an incompatible day.

There are two lunch relationships: source_meal_id for leftovers and lunch_package_dinner_id for all paired lunches. swap_meals moves package lunches; move_meal shifts source leftovers and rejects outside-week results. Their boundary semantics differ. Current data contains one Monday 12 October lunch assigned to the preceding week. The carryover display labels it linked to Sunday dinner even though it is standalone fish-finger buns.
Fix: define a single documented movement contract, distinguish meal package from actual leftovers, validate collisions and cross-week handover. Test first/last-day swaps, standalone lunch pairs, completed meals and reciprocal concurrent swaps (consistent row lock ordering to avoid deadlock).

### High — recipe detail has two sources
Full methods/preparation are in a GitHub file hardcoded to 5 October recipes; base recipes are in Supabase. Exact title/ingredients/method matching is intentionally safe, but any later edit can cause the fuller content to disappear; later weeks have no overlay.
Fix: store canonical structured ingredient name, quantity, unit and preparation plus ordered method steps, recipe revision and allocation data. Migrate the overlay into this model with a verified import and rollback. Do not remove the guard until canonical data is verified.

### High — state refresh and error handling
boot runs initially and from auth state events, including token refresh. loadWeeks resets selection to current week. Overlapping selectWeek calls have no request guard; renderBoundaryLunch removes existing blocks before awaiting its query, so overlapping requests can append duplicate IDs/blocks. More section and recipe requests also lack cancellation/identity guards.
Several queries use data || [] without checking errors, making failed loads look like empty plans. Signing out/session expiry does not explicitly clear or hide the previous authenticated UI.
Fix: one auth/state owner; handle auth events individually; preserve selected week; add sequence guards; prevent repeated submissions; render explicit loading/error/offline states; clear stale state on sign-out.

### High — render safety
Meal titles and boundary lunch titles enter innerHTML without escaping. Status/login messages also use innerHTML. Shopping and settings already escape strings.
Fix: use textContent or consistent escaping for all data-derived strings. Source review finding; no exploit payload was inserted.

### Medium — budget records totals but cannot forecast
Current shopping list: 64 items, all 64 estimated_cost values null. Live target £130, recorded spend £150, over target £20; estimate unavailable. If only some prices exist, the code displays their partial sum as Shopping estimate (with an explanatory warning), potentially understating the shop.
Fix: label incomplete totals explicitly and show pricing coverage. Add individual shop/top-up transactions with date, amount and category; calculate weekly total; later learn estimates from real prices. Food and household categories should roll up to one whole-shop target.

### Medium — Family/Home are empty and disconnected
Live family profiles, preferences and Home essentials are empty. Family settings explicitly do not resize recipes or influence planning. Household login membership is separate from cooking profiles, which is reasonable but needs onboarding.
Fix: guided household setup, explicit adults/child servings and attendance by meal/day; apply preferences during plan drafting with a review step. Essentials pre-check before creating the list; manual top-up additions and pantry deductions. Avoid pretending detailed stock tracking exists before it is implemented.

### Medium — collaboration is incomplete
Only shopping_items is in realtime publication. Meals, budgets and family changes do not automatically update another device. There is no visible syncing/offline/failed-save indicator or conflict handling. Shopping rerenders the entire list after local updates and realtime events.
Fix: show save/sync state, subscribe to relevant household state, update changed rows without moving scroll, prevent stale writes. Add read-only offline access before queued offline edits; queued edits need conflict rules.

### Medium — interaction/accessibility
Recipe dialog has role/label but no focus trap, initial focus, return-focus or background inert handling. Recipe open targets are clickable divs; drag handle is a span with role button and no keyboard activation. Native drag is the only movement path. Arrow buttons have symbolic names; several login/Home inputs rely on placeholders. No sign-out or password reset request control is visible.
Fix: real recipe-open buttons, keyboard/tap Move to day alternative, focus management and labels, accessible status messages, sign-out and recovery entry point. Respect reduced motion in JS-triggered scrolling too. Verify phone widths 320/360/390px and text zoom; not tested in this audit.

### Medium — performance and maintainability
An approximately 7.88 MB continuation PNG is referenced by both artwork style layers behind a 92% cream wash. Main hero JPEG is approximately 251 KB. Removing the nearly invisible continuation texture or replacing it with a much smaller optimized asset has a better likely payoff than adding database indexes at household scale; actual transferred bytes need measuring.
Supabase is instantiated in both core and recipes; drag reads a hardcoded project-specific localStorage auth key. Imports use supabase-js@2 rather than an exact version; fonts are loaded through CSS @import.
CSS is distributed across core inline CSS, consolidated inline overrides, rustic stylesheet, injected UI styles, injected recipe/settings/drag styles and design-system.css, with extensive !important. Some removed menu CSS remains.
Fix: one shared client; pinned dependencies, consolidated tokens/components, build-generated asset versions, smaller assets and measured load budget. Recipe enhancement is awaited before UI enhancement; a failed remote dependency can leave core navigation styling/enhancement absent. Isolate nonessential module failures.

## Database/security assessment
All public tables have RLS. Core table policies restrict household membership, but broadly allow household members ALL actions; they do not enforce archived-week immutability. swap_meals enforces current-week state; move_meal and set_meal_status do not. UI editable checks are insufficient for a database write contract.
Recommend server-side immutable/archive rules and function consistency. No cross-household unauthorized access test was performed.

Advisors report:
- Public execution privilege on SECURITY DEFINER link_invited_household_member for anon/authenticated. Inspection shows it RETURNS trigger, checks a confirmed invited email and has an empty search_path. The advisor warning does not establish a working public RPC exploit. Revoke unnecessary direct execution and replace hardcoded invite emails with a proper invitation lifecycle.
  Remediation: https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable
- Leaked-password protection disabled.
  Remediation: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- 16 foreign keys without covering indexes, one per-row auth check in home_essentials, three unused-index notices. These are scaling advisories, not evidence of present slowness. Add indexes based on actual access paths and measurements; do not delete unused indexes solely because this small app has not used them.
  Remediation: https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys

## Product direction
Goal: reduce the work of deciding, shopping and cooking for the household, while preserving flexibility and controlling total spend.

Recommended sequence:
1. Reliability: refresh guards, safe rendering, dynamic allocation wording, consistent movement/boundary rules, accessible Move to day, auth lifecycle.
2. Connect existing features: canonical recipes; household profiles and rules actually used in plan drafting; essentials pre-check and manual top-ups; transaction-based budget and transparent pricing coverage.
3. Daily-use design: smaller masthead after first visit, Tonight card with lunch reservation reminder, compact week overview plus optional day focus. Keep one bottom nav.
4. Shopping mode: Remaining/Bought filter, collapsible aisle groups and category progress, quantities easy to scan, explicit shared/sync state; no arbitrary rearrangement while checking an item.
5. Cooking mode: Prep and Cook sections, ingredient/step tick-offs scoped to cooking session, keep-screen-awake when supported, optional timers. Preserve full instructions.
6. Feedback: Cook again / Adjust / Avoid, notes from Marcus or Bron feeding future plans. Useful before complex AI or nutrition dashboards.
7. Offline/installable app only after state/conflict handling is specified.

Defer recipe photography, social features, calorie dashboards, complex automatic inventory and predictive AI until the plan → shop → cook → feedback loop is dependable.

## Acceptance gates for next milestone
- No duplicate boundary blocks after simultaneous refreshes; selected week survives token refresh.
- All displayed allocation dates match actual schedule.
- Linked and standalone lunches move with the correct dinner package; next-week handover has no missing/duplicate lunch.
- Recipe detail survives edit/import/new week through one canonical source.
- Two household devices see meal and budget changes; failed saves are explicit.
- Archive rules enforced through database/API, not only buttons.
- Keyboard/tap movement, modal focus and 200% text zoom work.
- Load failure never presents a false empty plan.
- Deployment verifies asset revision and regressions; repository gains meaningful README, migration history and critical-behavior tests.
