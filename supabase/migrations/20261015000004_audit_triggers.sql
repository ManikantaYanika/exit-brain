-- =============================================================================
-- 0004_audit_triggers.sql — audit writes that clients make directly through RLS.
-- FR-25 / security-and-privacy.md §5.7: role changes, removals, invite revokes and
-- transition creation must be audited even though no Edge Function sits in the path.
-- Triggers are SECURITY DEFINER (audit_logs has no client INSERT grant) and record
-- IDs/roles only.
-- =============================================================================

create or replace function private.audit_row_change()
returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_org    uuid := coalesce(new.org_id, old.org_id);
  v_action text;
  v_type   text;
  v_target text;
  v_meta   jsonb := '{}'::jsonb;
begin
  -- Rows removed by an organization cascade: the org is gone, nothing to audit into.
  if not exists (select 1 from public.organizations o where o.id = v_org) then
    return coalesce(new, old);
  end if;

  if tg_table_name = 'memberships' then
    v_type := 'membership';
    v_target := coalesce(new.user_id, old.user_id)::text;
    if tg_op = 'UPDATE' then
      if new.role is not distinct from old.role then return new; end if;
      v_action := 'member.role_changed';
      v_meta := jsonb_build_object('from', old.role, 'to', new.role);
    elsif tg_op = 'DELETE' then
      v_action := 'member.removed';
      v_meta := jsonb_build_object('role', old.role);
    else
      return coalesce(new, old);
    end if;

  elsif tg_table_name = 'invitations' then
    if tg_op = 'UPDATE' and old.revoked_at is null and new.revoked_at is not null then
      v_action := 'member.invite_revoked';
      v_type := 'invitation';
      v_target := new.id::text;
      v_meta := jsonb_build_object('role', new.role);
    else
      return new;
    end if;

  elsif tg_table_name = 'transitions' then
    if tg_op = 'INSERT' then
      v_action := 'transition.created';
      v_type := 'transition';
      v_target := new.id::text;
    else
      return new;
    end if;

  else
    return coalesce(new, old);
  end if;

  insert into public.audit_logs (org_id, actor_user_id, action, target_type, target_id, metadata)
  values (v_org, (select auth.uid()), v_action, v_type, v_target, v_meta);
  return coalesce(new, old);
end;
$$;

revoke execute on function private.audit_row_change() from public, anon, authenticated;

create trigger memberships_audit
  after update of role or delete on public.memberships
  for each row execute function private.audit_row_change();

create trigger invitations_audit
  after update of revoked_at on public.invitations
  for each row execute function private.audit_row_change();

create trigger transitions_audit
  after insert on public.transitions
  for each row execute function private.audit_row_change();
