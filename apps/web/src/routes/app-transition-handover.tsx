import { HandoverTab } from '../features/transition/HandoverTab'
import { appMeta } from './meta'

export const meta = () => appMeta('Handover')

export default function Route() {
  return <HandoverTab />
}
