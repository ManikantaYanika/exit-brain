import { RoleGate } from '../app/RoleGate'
import { InterviewPage } from '../features/interview/InterviewPage'

export default function Route() {
  return (
    <RoleGate allow={['employee']}>
      <InterviewPage />
    </RoleGate>
  )
}
