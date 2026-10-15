-- =============================================================================
-- audit_triggers.test.sql — FR-25 audit coverage + T11 confirmed-email rule
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

insert into auth.users (id, email, email_confirmed_at) values
  ('c0000000-0000-0000-0000-000000000001', 'owner@c.dev',     now()),
  ('c0000000-0000-0000-0000-000000000002', 'member@c.dev',    now()),
  ('c0000000-0000-0000-0000-000000000003', 'unconfirmed@c.dev', null);
insert into public.organizations (id, name, created_by) values
  ('0c000000-0000-0000-0000-00000000000c', 'Org C', 'c0000000-0000-0000-0000-000000000001');
insert into public.memberships (org_id, user_id, role) values
  ('0c000000-0000-0000-0000-00000000000c', 'c0000000-0000-0000-0000-000000000001', 'owner'),
  ('0c000000-0000-0000-0000-00000000000c', 'c0000000-0000-0000-0000-000000000002', 'viewer');

select tests.login('c0000000-0000-0000-0000-000000000001');

update public.memberships set role = 'manager'
 where user_id = 'c0000000-0000-0000-0000-000000000002';
-- 1
select is(
  (select metadata from public.audit_logs where action = 'member.role_changed'),
  '{"from": "viewer", "to": "manager"}'::jsonb,
  'role change is audited with from/to');
-- 2
select is(
  (select actor_user_id from public.audit_logs where action = 'member.role_changed'),
  'c0000000-0000-0000-0000-000000000001'::uuid,
  'audit records the acting user');

insert into public.employees (id, org_id, full_name)
  values ('e0000000-0000-0000-0000-00000000000e', '0c000000-0000-0000-0000-00000000000c', 'Ravi C');
insert into public.transitions (org_id, employee_id, last_working_day, created_by)
  values ('0c000000-0000-0000-0000-00000000000c', 'e0000000-0000-0000-0000-00000000000e', date '2026-11-30',
          'c0000000-0000-0000-0000-000000000001');
-- 3
select is((select count(*)::int from public.audit_logs where action = 'transition.created'), 1,
  'transition creation is audited');

insert into public.invitations (id, org_id, email, role, token_hash, invited_by)
  values ('10000000-0000-0000-0000-000000000001', '0c000000-0000-0000-0000-00000000000c', 'unconfirmed@c.dev',
          'viewer', encode(sha256(convert_to('tok_cccccccccccccccccccccccccccccccccccccccc', 'UTF8')), 'hex'),
          'c0000000-0000-0000-0000-000000000001');
select tests.logout();

-- 4: T11 — an unconfirmed account cannot accept, even with the right token
select tests.login('c0000000-0000-0000-0000-000000000003');
select throws_ok($q$select public.accept_invitation('tok_cccccccccccccccccccccccccccccccccccccccc')$q$,
  '22023', 'invalid invitation', 'unconfirmed email cannot accept an invitation');
select tests.logout();

select tests.login('c0000000-0000-0000-0000-000000000001');
update public.invitations set revoked_at = now() where id = '10000000-0000-0000-0000-000000000001';
-- 5
select is((select count(*)::int from public.audit_logs where action = 'member.invite_revoked'), 1,
  'invitation revoke is audited');

delete from public.memberships where user_id = 'c0000000-0000-0000-0000-000000000002';
-- 6
select is((select metadata ->> 'role' from public.audit_logs where action = 'member.removed'), 'manager',
  'member removal is audited');
-- 7
select ok((select bool_and(not (metadata ? 'email')) from public.audit_logs),
  'no audit row carries an email address');
select tests.logout();

-- 8: no-op role update writes nothing
select tests.login('c0000000-0000-0000-0000-000000000001');
update public.memberships set role = 'owner' where user_id = 'c0000000-0000-0000-0000-000000000001';
select is((select count(*)::int from public.audit_logs where action = 'member.role_changed'), 1,
  'unchanged role does not create an audit row');
select tests.logout();

-- 9: deleting the org cascades cleanly (triggers skip auditing into a deleted org)
select lives_ok($q$delete from public.organizations where id = '0c000000-0000-0000-0000-00000000000c'$q$,
  'org deletion cascades without audit FK errors');

select * from finish();
rollback;
