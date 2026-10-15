-- =============================================================================
-- 0003_invite_rpc.sql — create an invitation + audit row atomically, as the caller.
-- Lets api-invite run entirely on the user's JWT (no service role).
-- The raw token never reaches the database: the Edge Function sends sha256(token).
-- =============================================================================

create or replace function public.create_invitation(
  p_org uuid, p_email text, p_role public.org_role, p_token_hash text
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_id  uuid;
  v_exp timestamptz;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if not private.has_role(p_org, array['owner','admin']::public.org_role[]) then
    raise exception 'only owners and admins can invite' using errcode = '42501';
  end if;
  if p_role = 'owner' then
    raise exception 'owner role cannot be granted by invitation' using errcode = '23514';
  end if;
  if exists (select 1 from public.memberships m
             join public.profiles p on p.id = m.user_id
             where m.org_id = p_org and p.email = lower(btrim(p_email))) then
    raise exception 'user is already a member' using errcode = '23505';
  end if;

  insert into public.invitations (org_id, email, role, token_hash, invited_by)
  values (p_org, lower(btrim(p_email)), p_role, p_token_hash, v_uid)
  returning id, expires_at into v_id, v_exp;

  -- IDs and role only: no email address or token material in the audit log.
  insert into public.audit_logs (org_id, actor_user_id, action, target_type, target_id, metadata)
  values (p_org, v_uid, 'member.invited', 'invitation', v_id::text,
          jsonb_build_object('role', p_role));

  return jsonb_build_object('id', v_id, 'expires_at', v_exp);
end;
$$;

revoke execute on function public.create_invitation(uuid, text, public.org_role, text) from public, anon;
grant execute on function public.create_invitation(uuid, text, public.org_role, text) to authenticated;
