-- =============================================================================
-- rpc_invitations.test.sql — create_invitation RPC (FR-03, T2, T10)
-- =============================================================================
begin;
create extension if not exists pgtap;
select plan(9);

create schema tests;
grant usage on schema tests to authenticated;
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
grant execute on all functions in schema tests to authenticated;

insert into auth.users (id, email) values
  ('a0000000-0000-0000-0000-000000000001', 'owner@a.dev'),
  ('a0000000-0000-0000-0000-000000000002', 'manager@a.dev'),
  ('b0000000-0000-0000-0000-000000000001', 'owner@b.dev');
insert into public.organizations (id, name, created_by) values
  ('0a000000-0000-0000-0000-00000000000a', 'Org A', 'a0000000-0000-0000-0000-000000000001'),
  ('0b000000-0000-0000-0000-00000000000b', 'Org B', 'b0000000-0000-0000-0000-000000000001');
insert into public.memberships (org_id, user_id, role) values
  ('0a000000-0000-0000-0000-00000000000a', 'a0000000-0000-0000-0000-000000000001', 'owner'),
  ('0a000000-0000-0000-0000-00000000000a', 'a0000000-0000-0000-0000-000000000002', 'manager'),
  ('0b000000-0000-0000-0000-00000000000b', 'b0000000-0000-0000-0000-000000000001', 'owner');

select tests.login('a0000000-0000-0000-0000-000000000001');
-- 1
select lives_ok($q$select public.create_invitation('0a000000-0000-0000-0000-00000000000a', ' New.Person@A.dev ', 'manager', repeat('e', 64))$q$,
  'owner can create an invitation');
-- 2
select is((select email from public.invitations where token_hash = repeat('e', 64)), 'new.person@a.dev',
  'email is trimmed and lower-cased');
-- 3
select is((select count(*)::int from public.audit_logs where action = 'member.invited'), 1,
  'member.invited audit row written in the same transaction');
-- 4
select ok((select not (metadata ? 'email') from public.audit_logs where action = 'member.invited'),
  'audit metadata contains no email address');
-- 5
select throws_ok($q$select public.create_invitation('0a000000-0000-0000-0000-00000000000a', 'manager@a.dev', 'viewer', repeat('f', 64))$q$,
  '23505', null, 'cannot invite an existing member');
-- 6
select throws_ok($q$select public.create_invitation('0a000000-0000-0000-0000-00000000000a', 'x@a.dev', 'owner', repeat('1', 64))$q$,
  '23514', null, 'cannot invite as owner');
-- 7
select throws_ok($q$select public.create_invitation('0b000000-0000-0000-0000-00000000000b', 'x@b.dev', 'viewer', repeat('2', 64))$q$,
  '42501', null, 'cannot invite into another org');
select tests.logout();

select tests.login('a0000000-0000-0000-0000-000000000002');
-- 8
select throws_ok($q$select public.create_invitation('0a000000-0000-0000-0000-00000000000a', 'y@a.dev', 'viewer', repeat('3', 64))$q$,
  '42501', null, 'manager cannot invite');
select tests.logout();

set local role anon;
-- 9
select throws_ok($q$select public.create_invitation('0a000000-0000-0000-0000-00000000000a', 'z@a.dev', 'viewer', repeat('4', 64))$q$,
  '42501', null, 'anon cannot call create_invitation');
reset role;

select * from finish();
rollback;
