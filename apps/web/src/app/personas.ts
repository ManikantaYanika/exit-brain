/**
 * Prototype-only "view as" switcher. In the real app the persona is the signed-in user
 * and what they can see is decided by Postgres RLS, never by this value.
 */
export type PersonaId = 'priya' | 'ravi' | 'kiran' | 'anita'

export interface Persona {
  id: PersonaId
  name: string
  role: 'manager' | 'employee' | 'successor' | 'viewer'
  label: string
  home: string
}

export const personas: Record<PersonaId, Persona> = {
  priya: { id: 'priya', name: 'Priya Nair', role: 'manager', label: 'Engineering Manager', home: '/' },
  ravi: {
    id: 'ravi',
    name: 'Ravi Kumar',
    role: 'employee',
    label: 'Leaving engineer',
    home: '/interview/t-ravi',
  },
  kiran: { id: 'kiran', name: 'Kiran Rao', role: 'successor', label: 'Successor', home: '/successor/t-ravi' },
  anita: { id: 'anita', name: 'Anita Shah', role: 'viewer', label: 'HR Business Partner', home: '/' },
}
