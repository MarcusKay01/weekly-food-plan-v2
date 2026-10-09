# Rustic Italian — Consolidated design specification
Updated 9 October 2026. This replaces the conflicting earlier written specification.

## Visual authority
Use the approved Rustic Italian reference image, with the subsequent decisions below. Preserve photographic kitchen artwork, Playfair Display headings, Lora meal copy and Inter utility text.

## Palette
Primary #1F4B3F; background #F6EFE4; surface #EDE1D3; accent #B5523A; text #2E3A35; muted #5F5F55.

## Navigation and layout
One fixed bottom navigation: Week, Shop, More. Use consistent SVG outline icons with visible labels and a clear selected state.
Remove top duplicate tabs and hamburger.
Budget, Home and Family remain subordinate sections of More.
Week range, previous/next, Today and seven-day selector appear only within Week.
Use a compact masthead: approximately 44px title, understated supporting copy and no redundant menu spacer. Preserve room for the first meal on mobile.

## Meals
Editorial day headings, italic terracotta dates and a short underline.
Keep opaque cream day backgrounds for readability, matching Marcus's subsequent preference.
Meal type appears above title. Keep completion/reopen controls and existing move behaviour.
Show preparation minutes from real meal data when supplied. Never invent portion counts; the reference's Serves 4 is illustrative.
Use restrained dividers, spacing and status treatments.

## Artwork and responsive behaviour
Keep decorative food peripheral and the text column quiet.
Preserve the approved mobile artwork. Bound desktop artwork scale so it does not enlarge with viewport width.
Background contains no live UI or meal information.

## Product status
Preserve current meals, linked lunches, recipes, shopping and essentials functionality.
Budget supports weekly targets and manually recorded whole-shop totals. Family supports editable profiles and preferences. Automatic recipe scaling and planning integration remain unfinished.
These unfinished features must not be represented as complete.

## Verification
Check all three bottom destinations, active states, week-only controls, recipe access and loaded meals after deployment.
Compare the mobile result with the reference and retain explicit later decisions.
