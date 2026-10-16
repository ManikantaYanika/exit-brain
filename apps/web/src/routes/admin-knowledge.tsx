import { KnowledgePage } from '../features/admin/KnowledgePage'
import { appMeta } from './meta'

export const meta = () => appMeta('Knowledge risk')

export default function Route() {
  return <KnowledgePage />
}
