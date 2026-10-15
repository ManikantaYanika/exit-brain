import { KnowledgeReview } from '../features/transition/KnowledgeReview'
import { appMeta } from './meta'

export const meta = () => appMeta('Knowledge review')

export default function Route() {
  return <KnowledgeReview />
}
