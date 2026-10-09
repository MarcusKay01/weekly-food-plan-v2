alter table public.weeks add column actual_spend numeric(12,2) check (actual_spend >= 0), add column spend_notes text;
