-- Additive migration. Existing recipes and totals are preserved.
alter table public.meals add column if not exists recipe_detail jsonb;
alter table public.meals add column if not exists recipe_revision integer not null default 1;
alter table public.shopping_items add column if not exists have_at_home boolean not null default false;
alter table public.household_members add column if not exists attendance jsonb not null default '{}'::jsonb;
alter table public.meal_feedback add column if not exists user_id uuid references auth.users(id);
create table if not exists public.shop_transactions (
 id uuid primary key default gen_random_uuid(), week_id uuid not null references public.weeks(id),
 amount numeric(12,2) not null check(amount>=0), shop_date date not null default current_date,
 description text not null check(length(btrim(description)) between 1 and 200),
 category text not null default 'whole_shop' check(category in ('whole_shop','food','household','baby','other')),
 created_by uuid references auth.users(id), created_at timestamptz not null default now(),
 voided boolean not null default false, opening_balance boolean not null default false
);
alter table public.shop_transactions enable row level security;
revoke all on public.shop_transactions from anon;
grant select,insert,update on public.shop_transactions to authenticated;
create policy shop_transactions_read on public.shop_transactions for select to authenticated using(exists(select 1 from public.weeks w where w.id=week_id and private.is_household_member(w.household_id)));
create policy shop_transactions_insert on public.shop_transactions for insert to authenticated with check(exists(select 1 from public.weeks w where w.id=week_id and w.status<>'archived' and private.is_household_member(w.household_id)) and created_by=(select auth.uid()) and not opening_balance);
create policy shop_transactions_update on public.shop_transactions for update to authenticated using(exists(select 1 from public.weeks w where w.id=week_id and w.status<>'archived' and private.is_household_member(w.household_id))) with check(exists(select 1 from public.weeks w where w.id=week_id and w.status<>'archived' and private.is_household_member(w.household_id)));
create index if not exists shop_transactions_week_idx on public.shop_transactions(week_id);
insert into public.shop_transactions(week_id,amount,shop_date,description,opening_balance)
select id,actual_spend,start_date,'Previously recorded total',true from public.weeks w where actual_spend is not null and not exists(select 1 from public.shop_transactions t where t.week_id=w.id);

create or replace function public.refresh_week_spend() returns trigger language plpgsql security invoker set search_path=public as $$
begin
 if tg_op='UPDATE' and new.week_id<>old.week_id then raise exception 'A shop cannot be moved to another week'; end if;
 update public.weeks set actual_spend=(select sum(amount) from public.shop_transactions where week_id=new.week_id and not voided) where id=new.week_id;
 return new;
end $$;
create trigger shop_transaction_total after insert or update on public.shop_transactions for each row execute function public.refresh_week_spend();

create or replace function public.protect_archived_week_rows() returns trigger language plpgsql security invoker set search_path=public as $$
declare old_week uuid; new_week uuid;
begin
 if current_user not in ('authenticated','anon') then if tg_op='DELETE' then return old; else return new; end if; end if;
 if tg_op<>'INSERT' then old_week:=old.week_id; if exists(select 1 from public.weeks where id=old_week and status='archived') then raise exception 'Archived week is read only'; end if; end if;
 if tg_op<>'DELETE' then new_week:=new.week_id; if exists(select 1 from public.weeks where id=new_week and status='archived') then raise exception 'Archived week is read only'; end if; return new; end if;
 return old;
end $$;
create trigger protect_archived_meals before insert or update or delete on public.meals for each row execute function public.protect_archived_week_rows();
create trigger protect_archived_shopping before insert or update or delete on public.shopping_items for each row execute function public.protect_archived_week_rows();
create trigger protect_archived_shops before insert or update or delete on public.shop_transactions for each row execute function public.protect_archived_week_rows();
create or replace function public.protect_archived_week() returns trigger language plpgsql security invoker set search_path=public as $$
begin if current_user in ('authenticated','anon') and old.status='archived' then raise exception 'Archived week is read only'; end if; if tg_op='DELETE' then return old; else return new; end if; end $$;
create trigger protect_archived_week before update or delete on public.weeks for each row execute function public.protect_archived_week();

create or replace function public.swap_meals(first_meal_id uuid,second_meal_id uuid) returns void language plpgsql security invoker set search_path=public as $$
declare a public.meals%rowtype; b public.meals%rowtype; w public.weeks%rowtype;
begin
 -- Same order for reciprocal requests; serialize all packages in this week.
 select * into a from public.meals where id=first_meal_id;
 if a.id is null then raise exception 'Meal not found'; end if;
 perform 1 from public.meals where week_id=a.week_id order by id for update;
 select * into a from public.meals where id=first_meal_id;
 select * into b from public.meals where id=second_meal_id;
 if a.id is null or b.id is null or a.id=b.id then raise exception 'Choose two different dinners'; end if;
 if a.week_id<>b.week_id or a.slot<>'dinner' or b.slot<>'dinner' then raise exception 'Choose dinners in the same week'; end if;
 if a.execution_status<>'upcoming' or b.execution_status<>'upcoming' then raise exception 'Only upcoming dinners can move'; end if;
 select * into w from public.weeks where id=a.week_id for update;
 if w.status<>'current' then raise exception 'Week is read only'; end if;
 if not private.is_household_member(w.household_id) then raise exception 'Not a household member'; end if;
 if exists(select 1 from public.meals where lunch_package_dinner_id in(a.id,b.id) and execution_status<>'upcoming') then raise exception 'A paired lunch has already been completed; reopen it before moving'; end if;
 if exists(select 1 from public.meals l where l.week_id=a.week_id and l.slot='lunch' and l.scheduled_date in(a.scheduled_date+1,b.scheduled_date+1) and coalesce(l.lunch_package_dinner_id,'00000000-0000-0000-0000-000000000000'::uuid) not in(a.id,b.id)) then raise exception 'Move would collide with another lunch'; end if;
 update public.meals set scheduled_date=case when id=a.id then b.scheduled_date else a.scheduled_date end where id in(a.id,b.id);
 update public.meals set scheduled_date=case when lunch_package_dinner_id=a.id then b.scheduled_date+1 else a.scheduled_date+1 end where lunch_package_dinner_id in(a.id,b.id);
 insert into public.meal_schedule_events(week_id,meal_id,event_type,from_date,to_date,related_meal_id,acted_by) values(w.id,a.id,'swapped',a.scheduled_date,b.scheduled_date,b.id,auth.uid()),(w.id,b.id,'swapped',b.scheduled_date,a.scheduled_date,a.id,auth.uid());
end $$;
create or replace function public.move_meal(target_meal_id uuid,target_date date) returns void language plpgsql security invoker set search_path=public as $$
declare m public.meals%rowtype; w public.weeks%rowtype; dest uuid;
begin
 select * into m from public.meals where id=target_meal_id;
 if m.id is null then raise exception 'Meal not found'; end if;
 perform 1 from public.meals where week_id=m.week_id order by id for update;
 select * into m from public.meals where id=target_meal_id;
 select * into w from public.weeks where id=m.week_id for update;
 if w.status<>'current' or not private.is_household_member(w.household_id) then raise exception 'Week is read only'; end if;
 if m.slot<>'dinner' or m.execution_status<>'upcoming' then raise exception 'Move an upcoming dinner'; end if;
 if target_date<w.start_date or target_date>w.end_date then raise exception 'Target date is outside this week'; end if;
 if target_date=m.scheduled_date then return; end if;
 select id into dest from public.meals where week_id=m.week_id and slot='dinner' and scheduled_date=target_date;
 if dest is not null then perform public.swap_meals(m.id,dest); return; end if;
 if exists(select 1 from public.meals where lunch_package_dinner_id=m.id and execution_status<>'upcoming') then raise exception 'Reopen the paired lunch before moving'; end if;
 if exists(select 1 from public.meals where week_id=m.week_id and slot='lunch' and scheduled_date=target_date+1 and lunch_package_dinner_id is distinct from m.id) then raise exception 'Move would collide with another lunch'; end if;
 update public.meals set scheduled_date=target_date where id=m.id;
 update public.meals set scheduled_date=target_date+1 where lunch_package_dinner_id=m.id;
 insert into public.meal_schedule_events(week_id,meal_id,event_type,from_date,to_date,acted_by) values(w.id,m.id,'moved',m.scheduled_date,target_date,auth.uid());
end $$;
create or replace function public.set_meal_status(target_meal_id uuid,new_status text,note text default null) returns void language plpgsql security invoker set search_path=public as $$
declare m public.meals%rowtype; w public.weeks%rowtype;
begin
 if new_status not in('upcoming','done','cancelled') then raise exception 'Invalid meal status'; end if;
 select * into m from public.meals where id=target_meal_id for update;
 if m.id is null then raise exception 'Meal not found'; end if;
 select * into w from public.weeks where id=m.week_id;
 if w.status<>'current' or not private.is_household_member(w.household_id) then raise exception 'Week is read only'; end if;
 if m.execution_status=new_status then return; end if;
 update public.meals set execution_status=new_status,completed_at=case when new_status='done' then now() else null end,status_note=note where id=m.id;
 insert into public.meal_schedule_events(week_id,meal_id,event_type,note,acted_by) values(w.id,m.id,case when new_status='done' then 'completed' when new_status='cancelled' then 'cancelled' else 'reopened' end,note,auth.uid());
end $$;

create or replace function public.set_shopping_tick(item_id uuid,expected boolean,next_value boolean) returns void language plpgsql security invoker set search_path=public as $$
declare s public.shopping_items%rowtype;
begin
 select * into s from public.shopping_items where id=item_id for update;
 if s.id is null then raise exception 'Shopping item not found'; end if;
 if not exists(select 1 from public.weeks where id=s.week_id and status='current') then raise exception 'Week is read only'; end if;
 if s.purchased is distinct from expected then raise exception 'This item changed on another device. The list has been refreshed; please check it again.'; end if;
 update public.shopping_items set purchased=next_value,purchased_at=case when next_value then now() else null end where id=item_id;
end $$;
revoke execute on function public.set_shopping_tick(uuid,boolean,boolean) from public,anon;
grant execute on function public.set_shopping_tick(uuid,boolean,boolean) to authenticated;

-- Existing invitation records are the authority; never user-editable JWT metadata.
create or replace function public.link_invited_household_member() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.email_confirmed_at is null then return new; end if;
 insert into public.household_users(household_id,user_id,role)
 select i.household_id,new.id,i.role from public.household_invitations i where lower(i.email)=lower(new.email) and i.accepted_at is null on conflict do nothing;
 update public.household_invitations set accepted_at=now() where lower(email)=lower(new.email) and accepted_at is null;
 return new;
end $$;
revoke execute on function public.link_invited_household_member() from public,anon,authenticated;

create or replace function public.sync_home_essential_to_shop() returns trigger language plpgsql security invoker set search_path=public as $$
declare w uuid; cat text; section text;
begin
 select id into w from public.weeks where household_id=new.household_id and status='current' order by start_date desc limit 1;
 if w is null or new.stock_status<>'need_to_buy' then return new; end if;
 cat:=case new.category when 'Household' then 'household' when 'Toiletries' then 'toiletry' when 'Breakfast' then 'breakfast' when 'Snacks' then 'snack' else 'other' end;
 section:=case new.category when 'Household' then 'Household & cleaning' else new.category end;
 if not exists(select 1 from public.shopping_items where week_id=w and lower(btrim(name))=lower(btrim(new.name))) then
 insert into public.shopping_items(week_id,name,quantity,unit,category,shopping_section,notes) values(w,new.name,1,'item',cat,section,'Added from household essentials. Check pack quantity.'); end if;
 return new;
end $$;
drop policy home_essentials_member_all on public.home_essentials;
create policy home_essentials_member_all on public.home_essentials for all to authenticated using(private.is_household_member(household_id)) with check(private.is_household_member(household_id));
create index if not exists household_members_household_idx on public.household_members(household_id);
create index if not exists preferences_household_idx on public.preferences(household_id);
create index if not exists meal_feedback_household_idx on public.meal_feedback(household_id);
do $$ declare t text; begin foreach t in array array['meals','weeks','household_members','preferences','home_essentials','meal_feedback','shop_transactions'] loop if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t) then execute format('alter publication supabase_realtime add table public.%I',t); end if; end loop; end $$;
-- RPC callers need to resolve the membership helper; private is not an exposed API schema.
grant usage on schema private to authenticated;
revoke execute on function private.is_household_member(uuid) from public,anon;
grant execute on function private.is_household_member(uuid) to authenticated;
