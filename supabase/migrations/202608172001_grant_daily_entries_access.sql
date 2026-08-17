revoke all on table public.daily_entries from anon;

grant select, insert, update, delete
on table public.daily_entries
to authenticated;
