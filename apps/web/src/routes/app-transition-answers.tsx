import { AnswersTab } from '../features/transition/AnswersTab'
import { appMeta } from './meta'

export const meta = () => appMeta('Answers')

export default function Route() {
  return <AnswersTab />
}
