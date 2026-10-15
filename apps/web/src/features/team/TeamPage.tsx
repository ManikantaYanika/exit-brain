import { Link } from 'react-router'
import { usePersona } from '../../app/persona'
import { useApi } from '../../data/ApiProvider'
import { usePeople } from '../../data/hooks'
import type { Role } from '../../data/types'
import { DemoLabel } from '../../design/primitives/Demo'
import { ErrorState, SkeletonRows } from '../../design/states/States'
import { can } from '../../domain/permissions'

const ROLE_NAME: Record<Role, string> = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  employee: 'Leaving employee',
  successor: 'Successor',
  viewer: 'Viewer (HR)',
}

export function TeamPage() {
  const { persona } = usePersona()
  const api = useApi()
  const { data: people, isLoading, isError, refetch } = usePeople()

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Team</h1>
          <p className="mt-1 text-muted">Everyone in this workspace and what their role lets them do.</p>
        </div>
        {can(persona.role, 'members.invite') && (
          <Link
            to="/app/setup"
            className="inline-flex h-9 items-center rounded-control bg-brand px-3.5 text-sm font-medium text-on-brand hover:bg-brand-hover"
          >
            Invite people
          </Link>
        )}
      </header>

      {isLoading && <SkeletonRows rows={2} label="Loading team" />}
      {isError && <ErrorState message="The team list didn’t load." onRetry={() => void refetch()} />}
      {people && (
        <div className="overflow-x-auto rounded-panel border border-line bg-surface">
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="sr-only">Workspace members</caption>
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th scope="col" className="px-5 py-3 font-medium">
                  Name
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  Email
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  Role
                </th>
              </tr>
            </thead>
            <tbody>
              {people.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-3">
                    <span className="font-medium">{p.name}</span>
                    <span className="block text-xs text-muted">{p.title}</span>
                  </td>
                  <td className="px-5 py-3 text-muted">{p.email}</td>
                  <td className="px-5 py-3">{ROLE_NAME[p.role]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {api.mode === 'mock' && (
        <p className="flex items-center gap-2 text-xs text-muted">
          <DemoLabel /> People shown here are fictional demo members.
        </p>
      )}
    </div>
  )
}
