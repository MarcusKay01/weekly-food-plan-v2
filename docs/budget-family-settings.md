# Budget and Family — first working settings
Budget covers the entire shop. Each week has an editable target, nullable recorded cumulative spending and optional notes. Saving replaces the week's total; it never adds to it. Blank means unrecorded and zero is a recorded zero. Shopping estimates identify missing prices and never stand in for actual spending. The user may select any household week in Budget.
Family uses existing household_members and preferences tables with household RLS. Members have editable names, adult/child types, portion factors and active status. Preferences apply to a household or one member and can be added or updated.
Existing recipes are not resized and planning does not yet consume these settings. Receipt uploads, transaction ledgers, monthly budget aggregation and automated plan generation are outside this first stage.
The weekly_actual_spending migration added weeks.actual_spend and weeks.spend_notes. Its SQL is recorded in docs/weekly-actual-spending.sql.
Verification: JavaScript syntax checks and authenticated transactional database write/read checks, rolled back without leaving test data.
