/**
 * Small BM25 ranker for the site guide (website-plan.md §8.4). No dependency, runs in the browser.
 * Tokens are lower-cased, stop words removed, and lightly stemmed so "approves" matches "approve".
 */
export interface Doc {
  id: string
  title: string
  text: string
  url: string
  page: string
}

const STOP = new Set(
  'a an and are as at be but by can do does for from how i if in into is it its me my of on or our so that the their them then there they this to too us was we what when where which who why will with you your'.split(
    ' ',
  ),
)

/** Words that mean the same thing on this site. Applied after stemming. */
const SYNONYMS: Record<string, string> = {
  price: 'cost',
  pric: 'cost',
  pay: 'cost',
  paid: 'cost',
  charg: 'cost',
  bill: 'cost',
  expens: 'cost',
  employe: 'people',
  staff: 'people',
  person: 'people',
  peopl: 'people',
  individu: 'people',
  evalu: 'scor',
  judg: 'scor',
  rank: 'scor',
  assess: 'scor',
  monitor: 'surveil',
  watch: 'surveil',
  remov: 'delet',
  eras: 'delet',
  keep: 'retent',
  retain: 'retent',
  retention: 'retent',
  kept: 'retent',
  store: 'stor',
  save: 'stor',
  code: 'sourc',
  repo: 'repositori',
  repositori: 'repositori',
  check: 'verif',
  verifi: 'verif',
  verific: 'verif',
  valid: 'verif',
  secur: 'secur',
  safe: 'secur',
  hack: 'vulnerab',
  bug: 'vulnerab',
  vulnerabl: 'vulnerab',
  vulnerab: 'vulnerab',
  email: 'contact',
  talk: 'contact',
  reach: 'contact',
  login: 'sign',
  password: 'sign',
  trial: 'demo',
  ai: 'ai',
  llm: 'ai',
  model: 'ai',
  gpt: 'ai',
  founder: 'founder',
  servic: 'servic',
  consult: 'servic',
}

function stem(w: string) {
  for (const suf of [
    'ations',
    'ation',
    'ings',
    'ing',
    'edly',
    'ies',
    'ied',
    'es',
    'ed',
    'ly',
    's',
    'y',
    'e',
  ]) {
    if (w.length > suf.length + 2 && w.endsWith(suf)) return w.slice(0, -suf.length)
  }
  return w
}

export function tokenize(s: string): string[] {
  return (
    s
      .toLowerCase()
      .normalize('NFKD')
      .match(/[a-z0-9]+/g) ?? []
  )
    .filter((w) => !STOP.has(w))
    .map((w) => {
      const st = stem(w)
      return SYNONYMS[st] ?? SYNONYMS[w] ?? st
    })
}

export interface Ranked {
  doc: Doc
  score: number
}

export function createIndex(docs: Doc[], { k1 = 1.4, b = 0.7, titleBoost = 2 } = {}) {
  // Title words count more: they say what a section is about.
  const toks = docs.map((d) => [...Array(titleBoost).fill(tokenize(d.title)).flat(), ...tokenize(d.text)])
  const avg = toks.reduce((n, t) => n + t.length, 0) / Math.max(docs.length, 1)
  const df = new Map<string, number>()
  const tf = toks.map((t) => {
    const m = new Map<string, number>()
    for (const w of t) m.set(w, (m.get(w) ?? 0) + 1)
    for (const w of m.keys()) df.set(w, (df.get(w) ?? 0) + 1)
    return m
  })
  const N = docs.length

  return function search(query: string, limit = 3): Ranked[] {
    const q = [...new Set(tokenize(query))]
    if (!q.length) return []
    const out: Ranked[] = []
    docs.forEach((doc, i) => {
      let score = 0
      const len = toks[i]!.length
      for (const w of q) {
        const f = tf[i]!.get(w)
        if (!f) continue
        const n = df.get(w)!
        const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5))
        score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * len) / avg)))
      }
      if (score > 0) out.push({ doc, score })
    })
    out.sort((a, z) => z.score - a.score)
    // Weak matches (a single common word) are not answers; the guide says "not found" instead.
    const best = out[0]?.score ?? 0
    return out.filter((r) => r.score >= Math.max(1.2, best * 0.35)).slice(0, limit)
  }
}
