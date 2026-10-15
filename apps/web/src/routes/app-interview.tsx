import { RoleGate } from '../app/RoleGate'
import { InterviewPage } from '../features/interview/InterviewPage'
import { appMeta } from './meta'

export const meta = () => appMeta('Handover interview')

export default function Route() {
  return (
    <RoleGate allow={['employee']}>
      <InterviewPage />
    </RoleGate>
  )
}
