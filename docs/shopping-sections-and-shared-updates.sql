alter table public.shopping_items add column shopping_section text not null default 'Other';
update public.shopping_items set shopping_section=case
when name='Milk' then 'Dairy & chilled'
when name='Orange juice' then 'Drinks'
when notes like '%Source category: Fruit & veg' then 'Fruit & veg'
when notes like '%Source category: Meat & fish' then 'Meat & fish'
when notes like '%Source category: Dairy & chilled' then 'Dairy & chilled'
when notes like '%Source category: Bakery & grains' then 'Bakery & grains'
when notes like '%Source category: Sauces & seasoning' then 'Cupboard & cooking'
when notes like '%Source category: Baby' then 'Baby'
when notes like '%Source category: Household' then 'Household & cleaning'
when category='breakfast' then 'Breakfast'
when category='snack' then 'Snacks'
when category='toiletry' then 'Toiletries'
when category='household' then 'Household & cleaning'
when category='food' then 'Other food'
else 'Other' end;
alter publication supabase_realtime add table public.shopping_items;
