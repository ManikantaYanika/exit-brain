import { NotFound } from '../app/pages'
import { appMeta } from './meta'

export const meta = () => appMeta('Page not found')

export default function Route() {
  return <NotFound />
}
