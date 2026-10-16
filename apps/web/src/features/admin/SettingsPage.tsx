import { AlertTriangle, Bot } from 'lucide-react'
import { useState } from 'react'
import { useSettings, useUpdateSettings } from '../../data/admin/hooks'
import type { WorkspaceSettings } from '../../data/admin/types'
import { Button } from '../../design/primitives/Button'
import { useToast } from '../../design/primitives/Toast'
import { SkeletonRows } from '../../design/states/States'
import { selectCls } from './lib'
import { AdminHeader, Card, Pill, Toggle } from './ui'

const SIZES = ['1-50', '51-150', '151-500', '500+']
const ZONES = [
  'Asia/Kolkata',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Singapore',
]

export function SettingsPage() {
  const { data: settings } = useSettings()
  if (!settings) return <SkeletonRows rows={4} label="Loading settings" />
  return <SettingsForm settings={settings} />
}

function SettingsForm({ settings }: { settings: WorkspaceSettings }) {
  const update = useUpdateSettings()
  const toast = useToast()
  const [draft, setDraft] = useState<Pick<WorkspaceSettings, 'name' | 'sizeBand' | 'timezone'>>({
    name: settings.name,
    sizeBand: settings.sizeBand,
    timezone: settings.timezone,
  })
  const dirty =
    draft.name !== settings.name ||
    draft.sizeBand !== settings.sizeBand ||
    draft.timezone !== settings.timezone
  const setPref = (key: string, field: 'email' | 'inApp', v: boolean) =>
    update.mutate(
      { prefs: settings.prefs.map((p) => (p.key === key ? { ...p, [field]: v } : p)) },
      { onSuccess: () => toast('Notification settings saved.') },
    )

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Settings" description="Workspace details, notifications and the AI provider." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Workspace">
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              update.mutate(draft, {
                onSuccess: () => toast('Workspace saved.'),
                onError: (err) => toast(err.message, 'error'),
              })
            }}
          >
            <label className="flex flex-col gap-1 text-sm">
              Workspace name
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="h-9 rounded-control border border-line-strong bg-surface px-3 text-sm"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                Company size
                <select
                  className={selectCls}
                  value={draft.sizeBand}
                  onChange={(e) => setDraft({ ...draft, sizeBand: e.target.value })}
                >
                  {SIZES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Time zone
                <select
                  className={selectCls}
                  value={draft.timezone}
                  onChange={(e) => setDraft({ ...draft, timezone: e.target.value })}
                >
                  {ZONES.map((z) => (
                    <option key={z}>{z}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="primary" disabled={!dirty} loading={update.isPending}>
                Save
              </Button>
              {dirty && (
                <Button
                  onClick={() =>
                    setDraft({
                      name: settings.name,
                      sizeBand: settings.sizeBand,
                      timezone: settings.timezone,
                    })
                  }
                >
                  Discard
                </Button>
              )}
            </div>
          </form>
        </Card>

        <Card title="AI provider" actions={<Pill tone="warn">Not chosen yet</Pill>}>
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-muted">
              <Bot aria-hidden size={18} />
            </span>
            <p className="text-sm text-muted">
              Exit Brain uses a provider-independent adapter. The provider and its data-use terms will be
              shown here once chosen. Only evidence excerpts and answers are sent; never secrets. The AI
              suggests; people approve.
            </p>
          </div>
        </Card>
      </div>

      <Card title="Notifications" note="What you hear about, and where">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Notification preferences</caption>
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th scope="col" className="py-2 text-left font-medium">
                  When
                </th>
                <th scope="col" className="w-16 py-2 text-center font-medium sm:w-24">
                  Email
                </th>
                <th scope="col" className="w-16 py-2 text-center font-medium sm:w-24">
                  In the app
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {settings.prefs.map((p) => (
                <tr key={p.key}>
                  <td className="py-3">{p.label}</td>
                  <td className="py-3">
                    <div className="flex justify-center">
                      <Toggle
                        hideLabel
                        label={`Email: ${p.label}`}
                        checked={p.email}
                        onChange={(v) => setPref(p.key, 'email', v)}
                      />
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex justify-center">
                      <Toggle
                        hideLabel
                        label={`In the app: ${p.label}`}
                        checked={p.inApp}
                        onChange={(v) => setPref(p.key, 'inApp', v)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Danger zone" className="border-conflicting/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex max-w-xl items-start gap-2 text-sm text-muted">
            <AlertTriangle aria-hidden size={16} className="mt-0.5 shrink-0 text-conflicting" />
            Closing a workspace deletes all data after a 7-day grace period. In the pilot this is done with
            you directly, so nothing is lost by accident.
          </p>
          <a
            href="mailto:yanikamanikanta@gmail.com?subject=Close%20my%20Exit%20Brain%20workspace"
            className="text-sm font-medium text-conflicting hover:underline"
          >
            Ask to close the workspace
          </a>
        </div>
      </Card>
    </div>
  )
}
