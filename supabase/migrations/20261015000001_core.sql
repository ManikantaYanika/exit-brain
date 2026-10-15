-- =============================================================================
-- 0001_core.sql — Exit Brain Day 1: tenants, membership, transitions, audit
-- Source of truth: docs/02-architecture/database-schema.md §2, §4–6
--                  docs/07-security/security-and-privacy.md §4–5
-- Rules: every tenant table has org_id + RLS. Helpers live in schema `private`
-- (not exposed through the Data API) and are SECURITY DEFINER with empty search_path.
-- =============================================================================

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.org_role as enum ('owner','admin','manager','employee','successor','viewer');
create type public.transition_status as enum
  ('draft','ingesting','analysing','interviewing','verifying','handover_review','completed','cancelled');

-- -----------------------------------------------------------------------------
-- Generic trigger: updated_at
-- -----------------------------------------------------------------------------
create or replace function private.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------
create table public.organizations (
  id             uuid primary key default gen_random_uuid(),
  name           text not null check (char_length(btrim(name)) between 2 and 100),
  size_band      text check (size_band in ('1-20','21-50','51-150','151+')),
  timezone       text not null default 'Asia/Kolkata',
  retention_days int  not null default 90 check (retention_days between 30 and 365),
  created_by     uuid not null references auth.users(id),
  created_at     timestamptz not null default now()
);
create index organizations_created_by_idx on public.organizations (created_by);

create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  email      text not null,
  created_at timestamptz not null default now()
);

create table public.memberships (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       public.org_role not null,
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);
create index memberships_user_id_idx on public.memberships (user_id);
-- (org_id, user_id) unique index also serves org_id lookups.

create table public.invitations (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  email       text not null check (email = lower(email) and position('@' in email) > 1),
  role        public.org_role not null check (role <> 'owner'),
  token_hash  text not null unique check (char_length(token_hash) = 64), -- sha256 hex
  invited_by  uuid not null references public.profiles(id),
  expires_at  timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by uuid references public.profiles(id),
  revoked_at  timestamptz,
  created_at  timestamptz not null default now()
);
create index invitations_org_id_idx on public.invitations (org_id);
create index invitations_invited_by_idx on public.invitations (invited_by);
create index invitations_accepted_by_idx on public.invitations (accepted_by);
create unique index invitations_one_open_per_email
  on public.invitations (org_id, email)
  where accepted_at is null and revoked_at is null;

create table public.employees (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations(id) on delete cascade,
  full_name    text not null check (char_length(btrim(full_name)) between 1 and 200),
  email        text check (email is null or email = lower(email)),
  github_login text check (github_login is null or github_login ~ '^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$'),
  user_id      uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);
create index employees_org_id_idx on public.employees (org_id);
create index employees_user_id_idx on public.employees (user_id);
create unique index employees_org_github_login_uq
  on public.employees (org_id, lower(github_login)) where github_login is not null;

create table public.transitions (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null references public.organizations(id) on delete cascade,
  employee_id       uuid not null references public.employees(id) on delete cascade,
  successor_user_id uuid references public.profiles(id) on delete set null,
  last_working_day  date not null,
  status            public.transition_status not null default 'draft',
  window_months     int not null default 18 check (window_months between 1 and 60),
  created_by        uuid not null references public.profiles(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index transitions_org_id_idx on public.transitions (org_id);
create index transitions_employee_id_idx on public.transitions (employee_id);
create index transitions_successor_user_id_idx on public.transitions (successor_user_id);
create index transitions_created_by_idx on public.transitions (created_by);
create unique index transitions_one_active_per_employee
  on public.transitions (employee_id) where status not in ('completed','cancelled');

create trigger transitions_set_updated_at
  before update on public.transitions
  for each row execute function private.set_updated_at();

create table public.audit_logs (
  id            bigint generated always as identity primary key,
  org_id        uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,
  action        text not null check (action ~ '^[a-z_]+\.[a-z_]+$'),
  target_type   text,
  target_id     text,
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);
create index audit_logs_org_created_idx on public.audit_logs (org_id, created_at desc);
create index audit_logs_actor_idx on public.audit_logs (actor_user_id);

-- -----------------------------------------------------------------------------
-- Cross-table integrity: an org's child rows must point at the SAME org.
-- (FKs alone would let org A's transition reference org B's employee.)
-- -----------------------------------------------------------------------------
create or replace function private.check_transition_same_org()
returns trigger language plpgsql set search_path = '' as $$
begin
  -- BEFORE triggers run before RLS WITH CHECK. Refuse non-writers first, so the
  -- membership/employee lookups below can't be used to probe another org.
  if (select auth.uid()) is not null
     and not private.has_role(new.org_id, array['owner','admin','manager']::public.org_role[]) then
    raise exception 'new row violates row-level security policy for table "transitions"'
      using errcode = '42501';
  end if;
  if not exists (select 1 from public.employees e
                 where e.id = new.employee_id and e.org_id = new.org_id) then
    raise exception 'employee % does not belong to org %', new.employee_id, new.org_id
      using errcode = '23514';
  end if;
  if new.successor_user_id is not null and not exists (
       select 1 from public.memberships m
       where m.user_id = new.successor_user_id and m.org_id = new.org_id) then
    raise exception 'successor is not a member of org %', new.org_id using errcode = '23514';
  end if;
  return new;
end;
$$;
create trigger transitions_same_org
  before insert or update of org_id, employee_id, successor_user_id on public.transitions
  for each row execute function private.check_transition_same_org();

-- -----------------------------------------------------------------------------
-- Guard: an org must always keep at least one owner.
-- -----------------------------------------------------------------------------
create or replace function private.prevent_last_owner_loss()
returns trigger language plpgsql set search_path = '' as $$
begin
  if old.role = 'owner'
     and (tg_op = 'DELETE' or new.role <> 'owner')
     and not exists (select 1 from public.memberships m
                     where m.org_id = old.org_id and m.role = 'owner' and m.id <> old.id)
     -- allow cascade when the whole organization is being deleted
     and exists (select 1 from public.organizations o where o.id = old.org_id) then
    raise exception 'organization % must keep at least one owner', old.org_id
      using errcode = '23514';
  end if;
  return coalesce(new, old);
end;
$$;
create trigger memberships_keep_owner
  before update of role or delete on public.memberships
  for each row execute function private.prevent_last_owner_loss();

-- -----------------------------------------------------------------------------
-- RLS helper functions (SECURITY DEFINER avoids recursive RLS on memberships)
-- -----------------------------------------------------------------------------
create or replace function private.is_member(p_org uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.memberships m
    where m.org_id = p_org and m.user_id = (select auth.uid())
  );
$$;

create or replace function private.has_role(p_org uuid, p_roles public.org_role[])
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.memberships m
    where m.org_id = p_org and m.user_id = (select auth.uid()) and m.role = any (p_roles)
  );
$$;

create or replace function private.can_access_transition(p_transition uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.transitions t
    left join public.employees e on e.id = t.employee_id
    where t.id = p_transition
      and (
        private.has_role(t.org_id, array['owner','admin','manager']::public.org_role[])
        or (e.user_id = (select auth.uid()) and private.is_member(t.org_id))
        or (t.successor_user_id = (select auth.uid()) and private.is_member(t.org_id))
      )
  );
$$;

create or replace function private.shares_org_with(p_user uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.memberships mine
    join public.memberships theirs on theirs.org_id = mine.org_id
    where mine.user_id = (select auth.uid()) and theirs.user_id = p_user
  );
$$;

revoke execute on all functions in schema private from public, anon;
grant execute on function
  private.is_member(uuid),
  private.has_role(uuid, public.org_role[]),
  private.can_access_transition(uuid),
  private.shares_org_with(uuid)
to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Enable RLS on every tenant table
-- -----------------------------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.profiles      enable row level security;
alter table public.memberships   enable row level security;
alter table public.invitations   enable row level security;
alter table public.employees     enable row level security;
alter table public.transitions   enable row level security;
alter table public.audit_logs    enable row level security;

-- Anonymous users get nothing from any of these tables.
revoke all on public.organizations, public.profiles, public.memberships, public.invitations,
              public.employees, public.transitions, public.audit_logs from anon;

-- -----------------------------------------------------------------------------
-- Policies — see database-schema.md §6
-- -----------------------------------------------------------------------------

-- organizations: members read; owner/admin update; inserts only via create_organization()
create policy organizations_select on public.organizations
  for select to authenticated using (private.is_member(id));
create policy organizations_update on public.organizations
  for update to authenticated
  using (private.has_role(id, array['owner','admin']::public.org_role[]))
  with check (private.has_role(id, array['owner','admin']::public.org_role[]));
revoke insert, delete on public.organizations from authenticated;
revoke update on public.organizations from authenticated;
grant update (name, size_band, timezone, retention_days) on public.organizations to authenticated;

-- profiles: self + people who share an org; self-update of name only
create policy profiles_select on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or private.shares_org_with(id));
create policy profiles_update on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke insert, delete on public.profiles from authenticated;
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

-- memberships: members read; owner/admin change roles / remove (never via client insert)
create policy memberships_select on public.memberships
  for select to authenticated using (private.is_member(org_id));
create policy memberships_update on public.memberships
  for update to authenticated
  using (
    private.has_role(org_id, array['owner']::public.org_role[])
    or (private.has_role(org_id, array['admin']::public.org_role[]) and role <> 'owner')
  )
  with check (
    private.has_role(org_id, array['owner']::public.org_role[])
    or (private.has_role(org_id, array['admin']::public.org_role[]) and role <> 'owner')
  );
create policy memberships_delete on public.memberships
  for delete to authenticated
  using (
    private.has_role(org_id, array['owner']::public.org_role[])
    or (private.has_role(org_id, array['admin']::public.org_role[]) and role <> 'owner')
  );
revoke insert on public.memberships from authenticated;
revoke update on public.memberships from authenticated;
grant update (role) on public.memberships to authenticated;

-- invitations: owner/admin only; revoke = set revoked_at
create policy invitations_select on public.invitations
  for select to authenticated
  using (private.has_role(org_id, array['owner','admin']::public.org_role[]));
create policy invitations_insert on public.invitations
  for insert to authenticated
  with check (
    private.has_role(org_id, array['owner','admin']::public.org_role[])
    and invited_by = (select auth.uid())
    and accepted_at is null and accepted_by is null and revoked_at is null
  );
create policy invitations_update on public.invitations
  for update to authenticated
  using (private.has_role(org_id, array['owner','admin']::public.org_role[]))
  with check (private.has_role(org_id, array['owner','admin']::public.org_role[]));
revoke delete on public.invitations from authenticated;
revoke update on public.invitations from authenticated;
grant update (revoked_at) on public.invitations to authenticated;

-- employees
create policy employees_select on public.employees
  for select to authenticated
  using (
    private.has_role(org_id, array['owner','admin','manager','viewer']::public.org_role[])
    or (user_id = (select auth.uid()) and private.is_member(org_id))
  );
create policy employees_insert on public.employees
  for insert to authenticated
  with check (private.has_role(org_id, array['owner','admin','manager']::public.org_role[]));
create policy employees_update on public.employees
  for update to authenticated
  using (private.has_role(org_id, array['owner','admin','manager']::public.org_role[]))
  with check (private.has_role(org_id, array['owner','admin','manager']::public.org_role[]));
revoke delete on public.employees from authenticated;
revoke update on public.employees from authenticated;
grant update (full_name, email, github_login, user_id) on public.employees to authenticated;

-- transitions: status moves only through server functions (no client UPDATE of status)
create policy transitions_select on public.transitions
  for select to authenticated
  using (
    private.can_access_transition(id)
    or private.has_role(org_id, array['viewer']::public.org_role[])
  );
create policy transitions_insert on public.transitions
  for insert to authenticated
  with check (
    private.has_role(org_id, array['owner','admin','manager']::public.org_role[])
    and status = 'draft'
    and created_by = (select auth.uid())
  );
create policy transitions_update on public.transitions
  for update to authenticated
  using (private.has_role(org_id, array['owner','admin','manager']::public.org_role[]))
  with check (private.has_role(org_id, array['owner','admin','manager']::public.org_role[]));
revoke delete on public.transitions from authenticated;
revoke update on public.transitions from authenticated;
grant update (successor_user_id, last_working_day, window_months) on public.transitions to authenticated;

-- audit_logs: append-only; read by owner/admin. Written ONLY by SECURITY DEFINER RPCs in this file
-- and by Edge Functions via the service-role client (_shared/audit.ts). No client-callable writer.
create policy audit_logs_select on public.audit_logs
  for select to authenticated
  using (private.has_role(org_id, array['owner','admin']::public.org_role[]));
revoke insert, update, delete, truncate on public.audit_logs from authenticated, anon;
revoke update, delete, truncate on public.audit_logs from service_role;

-- -----------------------------------------------------------------------------
-- RPCs (atomic multi-row operations). Called with the USER's JWT — no service role.
-- -----------------------------------------------------------------------------

-- Create an organization; caller becomes owner; audit org.created. (FR-02)
create or replace function public.create_organization(
  p_name text, p_size_band text default null, p_timezone text default 'Asia/Kolkata'
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_org uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if not exists (select 1 from public.profiles p where p.id = v_uid) then
    raise exception 'profile missing for user' using errcode = '23503';
  end if;

  insert into public.organizations (name, size_band, timezone, created_by)
  values (btrim(p_name), p_size_band, coalesce(p_timezone, 'Asia/Kolkata'), v_uid)
  returning id into v_org;

  insert into public.memberships (org_id, user_id, role) values (v_org, v_uid, 'owner');

  insert into public.audit_logs (org_id, actor_user_id, action, target_type, target_id)
  values (v_org, v_uid, 'org.created', 'organization', v_org::text);

  return v_org;
end;
$$;

-- Accept an invitation by raw token. Token is hashed here; only the hash is stored. (FR-03, T11)
create or replace function public.accept_invitation(p_token text)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_uid   uuid := (select auth.uid());
  v_email text;
  v_inv   public.invitations%rowtype;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if p_token is null or char_length(p_token) < 32 then
    raise exception 'invalid invitation' using errcode = '22023';
  end if;

  select lower(u.email) into v_email from auth.users u where u.id = v_uid;

  select * into v_inv from public.invitations i
  where i.token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex')
  for update;

  -- Same generic error for every failure so the endpoint can't be used to probe tokens.
  if not found
     or v_inv.accepted_at is not null
     or v_inv.revoked_at is not null
     or v_inv.expires_at < now()
     or v_inv.email <> v_email then
    raise exception 'invalid invitation' using errcode = '22023';
  end if;

  insert into public.memberships (org_id, user_id, role)
  values (v_inv.org_id, v_uid, v_inv.role)
  on conflict (org_id, user_id) do nothing;
  if not found then
    raise exception 'already a member of this organization' using errcode = '23505';
  end if;

  update public.invitations
     set accepted_at = now(), accepted_by = v_uid
   where id = v_inv.id;

  insert into public.audit_logs (org_id, actor_user_id, action, target_type, target_id, metadata)
  values (v_inv.org_id, v_uid, 'member.joined', 'membership', v_uid::text,
          jsonb_build_object('role', v_inv.role, 'invitation_id', v_inv.id));

  return v_inv.org_id;
end;
$$;

revoke execute on function public.create_organization(text, text, text) from public, anon;
revoke execute on function public.accept_invitation(text) from public, anon;
grant execute on function public.create_organization(text, text, text) to authenticated;
grant execute on function public.accept_invitation(text) to authenticated;
