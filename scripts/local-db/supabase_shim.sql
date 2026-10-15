-- LOCAL TESTING ONLY — emulates the Supabase roles/auth pieces our migrations need. Never run against a real Supabase project.
-- Minimal emulation of the Supabase platform pieces our migrations depend on.
-- LOCAL TESTING ONLY. Real envs use `supabase start` / hosted Supabase.
do $$ begin
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin noinherit; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin noinherit; end if;
  if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin noinherit bypassrls; end if;
end $$;
grant anon, authenticated, service_role to postgres;
create schema auth;
create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  email_confirmed_at timestamptz,
  raw_user_meta_data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create or replace function auth.uid() returns uuid language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;
-- Since 2026-10-30 Supabase no longer auto-grants new public tables to API roles
-- (changelog 2026-04-28). We mirror that: NO default privileges here, so migrations
-- must grant explicitly — tests fail if they forget.
