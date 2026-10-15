import {
  ArrowRight,
  Building2,
  Eye,
  ListChecks,
  MessageSquareText,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from '../../app/auth'
import type { Role } from '../../data/types'
import { DemoLabel } from '../../design/primitives/Demo'
import { homePathFor } from '../../domain/permissions'
import { AuthLayout } from './AuthLayout'

const ICON: Record<Role, LucideIcon> = {
  owner: Building2,
  admin: Building2,
  manager: Users,
  employee: MessageSquareText,
  successor: ListChecks,
  viewer: Eye,
}

/** Pick a fictional person and enter their portal. Demo mode only. */
export function DemoPickerPage() {
  const { gateway, refresh } = useAuth()
  const navigate = useNavigate()
  if (gateway.mode !== 'demo' || !gateway.demoAccounts || !gateway.signInAsDemo)
    return <Navigate to="/signin" replace />

  return (
    <AuthLayout
      wide
      title="Choose a portal to explore"
      subtitle="Each person sees only what their role allows. You can switch any time from the bar at the top."
      footer={
        <Link to="/signin" className="font-medium text-brand hover:underline">
          Sign in with a real account
        </Link>
      }
    >
      <div className="mb-5 flex justify-center">
        <DemoLabel>MOCK DATA · fictional company Acme SaaS</DemoLabel>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gateway.demoAccounts.map((a) => {
          const Icon = ICON[a.role]
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={async () => {
                  const s = await gateway.signInAsDemo!(a.id)
                  await refresh()
                  navigate(homePathFor(s.role!, s.homeTransitionId ?? undefined))
                }}
                className="group flex h-full w-full flex-col gap-3 rounded-panel border border-line bg-surface p-5 text-left transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-float focus-visible:outline-2 focus-visible:outline-brand motion-reduce:hover:translate-y-0"
              >
                <span className="flex items-center justify-between">
                  <span className="rounded-control bg-brand-soft p-2 text-brand">
                    <Icon aria-hidden size={18} />
                  </span>
                  <ArrowRight
                    aria-hidden
                    size={16}
                    className="text-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-brand"
                  />
                </span>
                <span>
                  <span className="block font-semibold">{a.roleLabel}</span>
                  <span className="block text-sm text-muted">{a.name}</span>
                </span>
                <span className="text-sm leading-6 text-ink/85">{a.summary}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </AuthLayout>
  )
}
