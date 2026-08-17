create extension if not exists "pgcrypto";

create table public.daily_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  habit_values jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_entries_user_date_key unique (user_id, entry_date),
  constraint daily_entries_values_object_check
    check (jsonb_typeof(habit_values) = 'object')
);

create index daily_entries_user_date_idx
  on public.daily_entries (user_id, entry_date desc);

create function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger daily_entries_set_updated_at
before update on public.daily_entries
for each row execute function public.set_updated_at();

alter table public.daily_entries enable row level security;

create policy "Users can read their own daily entries"
on public.daily_entries for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their own daily entries"
on public.daily_entries for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own daily entries"
on public.daily_entries for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own daily entries"
on public.daily_entries for delete
to authenticated
using ((select auth.uid()) = user_id);
