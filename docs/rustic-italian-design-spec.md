# Rustic Italian V1 — Locked Design Specification

Status: LOCKED implementation reference
Purpose: translate the approved Rustic Italian mock-up into the live Weekly Food Plan V2 without reinterpretation.

## 1. Core design principle
The interface is an editorial family food planner laid over a tactile Italian-kitchen surface. It must not look like a generic app with an Italian colour palette.

Photography/artwork provides atmosphere. HTML provides information and interaction.

The approved mock-up is the visual authority. Implementation should reproduce it, not improve or reinterpret it.

## 2. First-viewport composition
Target mobile viewport: approximately 390–430 px wide.

Vertical hierarchy:
1. Branded masthead / atmospheric artwork: ~18–22% of first viewport, not a rectangular hero card.
2. Compact Week / Shop / More segmented control immediately below/within masthead zone.
3. Compact seven-day selector.
4. Monday editorial heading.
5. First meal card/row visible comfortably within first viewport; ideally part of second meal is also visible.

Outer horizontal content margin: 16–20 px.
No large empty zone between masthead and meals.
No oversized hero occupying 35–50% of screen.

## 3. Background artwork
Use one purpose-built background artwork layer, separate from live UI.

Required character:
- warm pale limestone / plaster / handmade-paper surface
- photographic, irregular and naturally mottled rather than a repeating CSS pattern
- subtle tonal variation, tiny mineral marks and soft imperfections
- premium editorial food-photography styling
- realistic tomatoes, basil/herbs and optional restrained crockery/linen concentrated around the upper-right/peripheral edges
- centre-left and main content column kept quiet enough for legibility
- decorative imagery may bleed/crop beyond viewport edges
- surface continues behind the interface so the page feels like one material

Artwork MUST NOT contain:
- app title or copy
- dates
- navigation
- meal names
- buttons
- meal-specific photographs
- fake CSS circles pretending to be tomatoes

Do not use a rectangular photograph as a hero/banner. Do not transition from a photo header into a separate beige app background.

## 4. Colour system
Primary ink: deep forest green, approximately #173D32.
Active green: muted olive/forest, approximately #315E4E.
Accent: restrained terracotta, approximately #A9553D.
Surface: warm limestone/ivory, approximately #EFE8DC, but artwork controls real tonal variation.
Secondary text: warm grey/taupe.

Avoid saturated colours, bright white cards and strong black.
Terracotta is an accent, not a dominant fill.

## 5. Typography
Brand/title and day headings: elegant editorial serif (Cormorant Garamond or closest production equivalent).
Functional UI and meal copy: restrained humanist sans (DM Sans or equivalent).

Masthead:
- small uppercase kicker with generous tracking
- title prominent but controlled; approximately 42–48 px on 390–430 px mobile width
- title must not consume most of first viewport
- supporting line small and understated

Day heading:
- serif, ~25–29 px
- short hand-drawn/organic terracotta underline accent

Meal type:
- small uppercase eyebrow ABOVE meal title
- ~9–10 px, tracked

Meal title:
- ~15–17 px
- medium/semi-bold, not oversized or extra-heavy

## 6. Navigation
Primary top control: Week / Shop / More.
Compact segmented treatment, visually integrated with the surface.
Avoid a large floating pill/capsule.

Bottom navigation may remain for mobile usability but must be visually quiet, shallow and consistent with the palette.
Do not let navigation compete with food content.

## 7. Week/date selector
Seven equal day targets across width.
Compact height.
Inactive days visually quiet and mostly transparent.
Active day uses muted forest/olive fill with cream text.
No heavy beige strip behind selector.
Week date range is secondary information and should not become a large card/capsule.

## 8. Day sections
Day sections should feel editorial rather than card-based.
No large rounded container around an entire day.
Day heading sits directly on the background surface.
Meals follow beneath with restrained separation.
Spacing between days should create hierarchy without large blank areas.

## 9. Meal components
No generic/random meal photography.
No thumbnail image per meal unless a future product requirement explicitly introduces real recipe imagery.

Meal component should be a light editorial panel/row:
- subtle warm translucent surface or near-transparent treatment
- fine hairline separation
- low/no shadow
- modest radius only if required; avoid chunky 16–24 px app-card styling
- meal type eyebrow above title
- completion circle small and functional
- overflow menu quiet
- move/drag affordance understated

Planned-leftover lunch must remain clearly identifiable but visually secondary.

## 10. Material / depth
Premium feel comes from the photographed background material and typography, not from shadows and rounded cards.

Use:
- subtle translucency
- fine borders/hairlines
- minimal shadows
- natural artwork shadows only where part of the background scene

Avoid:
- glassmorphism
- strong drop shadows
- stacked floating cards
- excessive rounded rectangles
- repetitive digital texture patterns

## 11. Responsive artwork behaviour
Background artwork must be prepared for portrait mobile first.
Use cover/crop rules that preserve the quiet content zone and keep decorative food styling peripheral.
At wider sizes, artwork may reveal more peripheral styling but must not move behind critical text.
Live UI remains responsive and independent of the artwork.

## 12. Interaction boundary
The following MUST remain live HTML/data-driven UI:
- title/subtitle where practical
- Week / Shop / More controls
- week range
- seven-day selector
- day headings
- meal titles/types/status
- completion controls
- drag/move interactions
- overflow actions
- shopping content

Background artwork is decorative only and must never encode dynamic information.

## 13. Explicit do-not rules
DO NOT:
- redesign while implementing
- introduce random meal images
- use a rectangular food-photo hero
- approximate food decoration with CSS shapes
- replace photographic material with repeating gradients/dots
- enlarge title/header because space is available
- wrap every section in rounded cards
- add decorative elements absent from the approved concept
- declare a design pass complete merely because it is 'closer'

## 14. Acceptance checklist before deployment
Compare implementation side-by-side with approved mock-up at the same mobile aspect ratio.

A build is ready only if:
- first viewport has comparable information density
- masthead occupies comparable proportion
- background reads as continuous photographed material, not CSS texture
- decorative imagery occupies comparable peripheral zones
- title has comparable scale/position/weight
- navigation has comparable scale and prominence
- first day/meal starts at comparable vertical position
- meal hierarchy matches: type above title
- card chrome is similarly restrained
- overall palette and contrast are comparable
- no element looks like a generic component-library default

If any major criterion fails, correct it before asking Marcus to review.

## 15. Implementation sequence
1. Preserve this specification as the locked reference.
2. Produce a background-art-only asset from the approved visual language.
3. Integrate it as a decorative layer without changing live data/auth behaviour.
4. Implement component geometry/tokens from this specification.
5. Capture/inspect the resulting mobile layout against the approved reference.
6. Correct major discrepancies before deployment/review.
7. Only then deploy the candidate build.
