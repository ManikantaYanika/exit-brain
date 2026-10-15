/**
 * Audit helper for code paths that are NOT covered by an auditing RPC
 * (e.g. job runner, GitHub webhook — Day 2+). Requires the service-role client:
 * only functions on the allow-list in security-and-privacy.md §5.3 may call this.
 * Day 1 functions audit inside their RPCs instead and do not use this.
 */

interface AdminClient {
  from(table: 'audit_logs'): {
    insert(row: Record<string, unknown>): PromiseLike<{ error: { message: string } | null }>
  }
}

export interface AuditEntry {
  orgId: string
  actorUserId: string | null
  action: `${string}.${string}`
  targetType?: string
  targetId?: string
  /** IDs and counts only — never secrets, tokens, emails or answer text. */
  metadata?: Record<string, string | number | boolean | null>
}

export async function writeAudit(admin: AdminClient, entry: AuditEntry): Promise<void> {
  const { error } = await admin.from('audit_logs').insert({
    org_id: entry.orgId,
    actor_user_id: entry.actorUserId,
    action: entry.action,
    target_type: entry.targetType ?? null,
    target_id: entry.targetId ?? null,
    metadata: entry.metadata ?? {},
  })
  if (error) throw new Error(`audit write failed: ${error.message}`)
}
