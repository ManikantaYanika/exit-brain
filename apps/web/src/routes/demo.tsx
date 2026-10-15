import { DemoPickerPage } from '../features/auth/DemoPickerPage'
import { appMeta } from './meta'

export const meta = () => appMeta('Explore the demo')

export default function Route() {
  return <DemoPickerPage />
}
