-- =============================================================================
-- rls_core.test.sql — Day 1 tenant isolation + role tests (pgTAP)
-- Run: supabase test db   (or psql against a DB with migrations applied + pgtap)
-- Covers database-schema.md §9 (Day 1 rows) and security-and-privacy.md T1, T2, T10, T11.
-- =============================================================================
begin;
create extension if not exists pgtap;
select plan(44);

-- ---------- test helpers -----------------------------------------------------
create schema tests;
grant usage on schema tests to authenticated, anon;
create table tests.ids (name text primary key, id uuid not null);
grant select, insert on tests.ids to authenticated;

create function tests.login(p_user uuid) returns void language plpgsql as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
end $$;
create function tests.logout() returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', '', true);
  perform set_config('role', 'postgres', true);
end $$;
create function tests.id(p_name text) returns uuid language sql stable as $$
  select id from tests.ids where name = p_name
$$;
grant execute on all functions in schema tests to authenticated, anon;

-- ---------- users (auth.users insert fires the profile trigger) --------------
insert into auth.users (id, email, raw_user_meta_data, email_confirmed_at) values
  ('11111111-1111-1111-1111-111111111111', 'owner.a@test.dev',   '{"full_name":"Owner A"}', now()),
  ('22222222-2222-2222-2222-222222222222', 'viewer.a@test.dev',  '{}', now()),
  ('33333333-3333-3333-3333-333333333333', 'manager.a@test.dev', '{}', now()),
  ('44444444-4444-4444-4444-444444444444', 'owner.b@test.dev',   '{}', now()),
  ('55555555-5555-5555-5555-555555555555', 'invitee@test.dev',   '{}', now()),
  ('66666666-6666-6666-6666-666666666666', 'admin.a@test.dev',   '{}', now());
insert into tests.ids values
  ('owner_a',   '11111111-1111-1111-1111-111111111111'),
  ('viewer_a',  '22222222-2222-2222-2222-222222222222'),
  ('manager_a', '33333333-3333-3333-3333-333333333333'),
  ('owner_b',   '44444444-4444-4444-4444-444444444444'),
  ('invitee',   '55555555-5555-5555-5555-555555555555'),
  ('admin_a',   '66666666-6666-6666-6666-666666666666');

-- 1
select is((select count(*)::int from public.profiles), 6, 'profile trigger created a profile per auth user');
-- 2
select is((select full_name from public.profiles where id = tests.id('owner_a')), 'Owner A',
          'profile picks up full_name from signup metadata');

-- ---------- FR-02: create org → caller is owner → audit org.created ----------
select tests.login(tests.id('owner_a'));
insert into tests.ids select 'org_a', public.create_organization('Acme SaaS', '51-150');
select tests.logout();
select tests.login(tests.id('owner_b'));
insert into tests.ids select 'org_b', public.create_organization('Beta Agency', '21-50');
select tests.logout();

-- 3
select is((select role::text from public.memberships where org_id = tests.id('org_a') and user_id = tests.id('owner_a')),
          'owner', 'creator becomes owner of the new org');
-- 4
select is((select count(*)::int from public.audit_logs where org_id = tests.id('org_a') and action = 'org.created'),
          1, 'org.created audit row written');

-- Members of org A with other roles (fixture, as postgres)
insert into public.memberships (org_id, user_id, role) values
  (tests.id('org_a'), tests.id('viewer_a'),  'viewer'),
  (tests.id('org_a'), tests.id('manager_a'), 'manager'),
  (tests.id('org_a'), tests.id('admin_a'),   'admin');

-- Org B data on every Day-1 table, created as owner B through RLS
select tests.login(tests.id('owner_b'));
insert into public.employees (org_id, full_name, github_login)
  values (tests.id('org_b'), 'Ravi B', 'ravi-b');
insert into public.invitations (org_id, email, role, token_hash, invited_by)
  values (tests.id('org_b'), 'someone@b.dev', 'manager', repeat('b', 64), tests.id('owner_b'));
insert into public.transitions (org_id, employee_id, last_working_day, created_by)
  select tests.id('org_b'), e.id, date '2026-11-30', tests.id('owner_b')
  from public.employees e where e.github_login = 'ravi-b';
select tests.logout();

-- ---------- T1: cross-tenant isolation — owner A sees 0 rows of org B ---------
select tests.login(tests.id('owner_a'));
-- 5..11
select is((select count(*)::int from public.organizations where id = tests.id('org_b')), 0, 'A cannot see org B organization');
select is((select count(*)::int from public.memberships   where org_id = tests.id('org_b')), 0, 'A cannot see org B memberships');
select is((select count(*)::int from public.invitations   where org_id = tests.id('org_b')), 0, 'A cannot see org B invitations');
select is((select count(*)::int from public.employees     where org_id = tests.id('org_b')), 0, 'A cannot see org B employees');
select is((select count(*)::int from public.transitions   where org_id = tests.id('org_b')), 0, 'A cannot see org B transitions');
select is((select count(*)::int from public.audit_logs    where org_id = tests.id('org_b')), 0, 'A cannot see org B audit logs');
select is((select count(*)::int from public.profiles      where id = tests.id('owner_b')),   0, 'A cannot see profile of a user only in org B');
-- 12
select is((select count(*)::int from public.organizations), 1, 'A sees exactly its own org');
-- 13: writes into org B are blocked
select throws_ok(
  format($q$insert into public.employees (org_id, full_name) values (%L, 'Intruder')$q$, tests.id('org_b')),
  '42501', null, 'A cannot insert an employee into org B');
-- 14: updates on org B rows silently affect 0 rows
select is_empty(
  format($q$update public.employees set full_name = 'Hacked' where org_id = %L returning id$q$, tests.id('org_b')),
  'A cannot update org B employees');
select tests.logout();

-- Owner B symmetric check
select tests.login(tests.id('owner_b'));
-- 15
select is((select count(*)::int from public.memberships where org_id = tests.id('org_a')), 0, 'B cannot see org A memberships');
-- 16
select is((select count(*)::int from public.audit_logs where org_id = tests.id('org_a')), 0, 'B cannot see org A audit logs');
select tests.logout();

-- ---------- anon gets nothing ---------------------------------------------
select set_config('role', 'anon', true);
-- 17
select throws_ok('select count(*) from public.organizations', '42501', null, 'anon has no access to organizations');
-- 18
select throws_ok('select count(*) from public.audit_logs', '42501', null, 'anon has no access to audit_logs');
-- 19
select throws_ok($q$select public.create_organization('x')$q$, '42501', null, 'anon cannot call create_organization');
select tests.logout();

-- ---------- T2: role checks inside org A --------------------------------------
select tests.login(tests.id('manager_a'));
insert into public.employees (org_id, full_name, github_login)
  values (tests.id('org_a'), 'Ravi A', 'ravi-test');
-- 20
select lives_ok(
  format($q$insert into public.transitions (org_id, employee_id, last_working_day, created_by)
            select %L, id, date '2026-11-14', %L from public.employees where github_login = 'ravi-test'$q$,
         tests.id('org_a'), tests.id('manager_a')),
  'manager can create a draft transition');
-- 21
select throws_ok(
  format($q$insert into public.transitions (org_id, employee_id, last_working_day, created_by, status)
            select %L, id, date '2026-11-14', %L, 'completed' from public.employees where github_login = 'ravi-test'$q$,
         tests.id('org_a'), tests.id('manager_a')),
  '42501', null, 'manager cannot create a transition in a non-draft status');
-- 22
select throws_ok(
  format($q$update public.transitions set status = 'completed' where org_id = %L$q$, tests.id('org_a')),
  '42501', null, 'client cannot update transitions.status');
-- 23
select lives_ok(
  format($q$update public.transitions set window_months = 12 where org_id = %L$q$, tests.id('org_a')),
  'manager can update allowed transition columns');
-- 24
select is((select count(*)::int from public.audit_logs), 0, 'manager cannot read audit logs');
-- 25
select throws_ok(
  format($q$insert into public.invitations (org_id, email, role, token_hash, invited_by)
            values (%L, 'x@a.dev', 'viewer', %L, %L)$q$, tests.id('org_a'), repeat('c', 64), tests.id('manager_a')),
  '42501', null, 'manager cannot invite users');
select tests.logout();

-- Cross-org reference blocked even for a legitimate writer
select tests.login(tests.id('owner_b'));
-- 26
select throws_ok(
  format($q$insert into public.transitions (org_id, employee_id, last_working_day, created_by)
            select %L, id, date '2026-12-01', %L from public.employees where github_login = 'ravi-b'$q$,
         tests.id('org_a'), tests.id('owner_b')),
  '42501', null, 'B cannot create a transition in org A');
select tests.logout();

select tests.login(tests.id('viewer_a'));
-- 27
select throws_ok(
  format($q$insert into public.transitions (org_id, employee_id, last_working_day, created_by)
            select %L, id, date '2026-11-14', %L from public.employees where org_id = %L limit 1$q$,
         tests.id('org_a'), tests.id('viewer_a'), tests.id('org_a')),
  '42501', null, 'viewer cannot insert transitions');
-- 28
select throws_ok(
  format($q$insert into public.employees (org_id, full_name) values (%L, 'X')$q$, tests.id('org_a')),
  '42501', null, 'viewer cannot insert employees');
-- 29
select is((select count(*)::int from public.transitions), 1, 'viewer can see org transitions (summary)');
-- 30
select is_empty(
  format($q$update public.organizations set name = 'Renamed' where id = %L returning id$q$, tests.id('org_a')),
  'viewer cannot update org settings');
select tests.logout();

-- Integrity: transition in org A must reference an org-A employee (as postgres, bypassing RLS)
-- 31
select throws_ok(
  format($q$insert into public.transitions (org_id, employee_id, last_working_day, created_by)
            select %L, id, date '2026-11-14', %L from public.employees where github_login = 'ravi-b'$q$,
         tests.id('org_a'), tests.id('owner_a')),
  '23514', null, 'transition cannot reference an employee from another org');

-- ---------- memberships: no client inserts; last owner protected -------------
select tests.login(tests.id('owner_a'));
-- 32
select throws_ok(
  format($q$insert into public.memberships (org_id, user_id, role) values (%L, %L, 'owner')$q$,
         tests.id('org_a'), tests.id('invitee')),
  '42501', null, 'clients cannot insert memberships directly');
-- 33
select throws_ok(
  format($q$update public.memberships set role = 'manager' where org_id = %L and user_id = %L$q$,
         tests.id('org_a'), tests.id('owner_a')),
  '23514', null, 'last owner cannot demote themselves');
select tests.logout();

select tests.login(tests.id('admin_a'));
-- 34
select is_empty(
  format($q$update public.memberships set role = 'viewer' where org_id = %L and user_id = %L returning id$q$,
         tests.id('org_a'), tests.id('owner_a')),
  'admin cannot change the owner''s role');
-- 35
select throws_ok(
  format($q$update public.memberships set role = 'owner' where org_id = %L and user_id = %L$q$,
         tests.id('org_a'), tests.id('viewer_a')),
  '42501', null, 'admin cannot grant owner');
-- 36
select throws_ok(
  format($q$insert into public.invitations (org_id, email, role, token_hash, invited_by)
            values (%L, 'boss@a.dev', 'owner', %L, %L)$q$, tests.id('org_a'), repeat('d', 64), tests.id('admin_a')),
  '23514', null, 'nobody can invite an owner');
select tests.logout();

-- ---------- T10: audit log is append-only ------------------------------------
select tests.login(tests.id('owner_a'));
-- 37
select throws_ok(
  format($q$delete from public.audit_logs where org_id = %L$q$, tests.id('org_a')),
  '42501', null, 'owner cannot delete audit logs');
-- 38
select throws_ok(
  format($q$insert into public.audit_logs (org_id, action) values (%L, 'fake.event')$q$, tests.id('org_a')),
  '42501', null, 'clients cannot insert audit rows directly');
-- 39
select hasnt_function('public', 'log_audit', 'no client-callable audit writer exists');
-- 40
select is(
  (select count(*)::int from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('public','private') and has_function_privilege('anon', p.oid, 'execute')
      and p.proname not in (select proname from pg_proc pp join pg_extension e on e.extnamespace = pp.pronamespace where e.extname = 'pgtap')),
  0, 'anon cannot execute any Exit Brain function');

-- ---------- FR-03 / T11: invitation flow --------------------------------------
-- Raw token lives only in the invite link; DB stores sha256(token).
insert into public.invitations (org_id, email, role, token_hash, invited_by)
values (tests.id('org_a'), 'invitee@test.dev', 'manager',
        encode(sha256(convert_to('tok_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'UTF8')), 'hex'),
        tests.id('owner_a'));
select tests.logout();

select tests.login(tests.id('owner_b'));
-- 41
select throws_ok($q$select public.accept_invitation('tok_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')$q$,
  '22023', 'invalid invitation', 'a different user cannot accept someone else''s invitation');
select tests.logout();

select tests.login(tests.id('invitee'));
-- 42
select is(public.accept_invitation('tok_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'), tests.id('org_a'),
  'invited user accepts with the right token');
-- 43
select is((select role::text from public.memberships where org_id = tests.id('org_a') and user_id = tests.id('invitee')),
  'manager', 'accepted invitation creates membership with invited role');
-- 44
select throws_ok($q$select public.accept_invitation('tok_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')$q$,
  '22023', 'invalid invitation', 'an invitation token cannot be reused');
select tests.logout();

select * from finish();
rollback;
