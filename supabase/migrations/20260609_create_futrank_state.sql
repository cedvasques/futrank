create table if not exists public.futrank_state (
  id text primary key,
  state jsonb not null default '{}'::jsonb,
  schema_version integer not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.futrank_state enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update on table public.futrank_state to anon, authenticated;

drop policy if exists "FutRank state is readable by the public app" on public.futrank_state;
create policy "FutRank state is readable by the public app"
on public.futrank_state
for select
to anon
using (true);

drop policy if exists "FutRank state can be created by the public app" on public.futrank_state;
create policy "FutRank state can be created by the public app"
on public.futrank_state
for insert
to anon
with check (true);

drop policy if exists "FutRank state can be updated by the public app" on public.futrank_state;
create policy "FutRank state can be updated by the public app"
on public.futrank_state
for update
to anon
using (true)
with check (true);

do $$
begin
  if exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'futrank_state'
  ) then
    alter publication supabase_realtime add table public.futrank_state;
  end if;
end $$;
