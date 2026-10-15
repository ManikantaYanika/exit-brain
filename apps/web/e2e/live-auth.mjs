// Live auth E2E against a real local Supabase stack (CI job "live-auth").
// Covers: sign-up -> confirmation email (Mailpit) -> confirmed session -> no-workspace screen ->
// sign-out -> wrong password rejected -> sign-in again; unconfirmed account cannot sign in.
// Env: E2E_BASE (app origin, default http://localhost:5173), MAILPIT (default http://127.0.0.1:54324)
import { chromium } from 'playwright'

const BASE = process.env.E2E_BASE ?? 'http://localhost:5173'
const MAILPIT = process.env.MAILPIT ?? 'http://127.0.0.1:54324'
const run = Date.now()
const user = { name: 'Asha Menon', email: `asha.${run}@example.com`, password: `letters${run % 100000}` }
const unconfirmed = {
  name: 'Ravi Test',
  email: `ravi.${run}@example.com`,
  password: `letters${(run + 7) % 100000}`,
}

let failures = 0
async function step(name, fn) {
  try {
    await fn()
    console.log(`PASS ${name}`)
  } catch (e) {
    failures++
    console.log(`FAIL ${name}\n     ${String(e?.message ?? e).split('\n')[0]}`)
  }
}

async function confirmationLink(email) {
  for (let i = 0; i < 30; i++) {
    const r = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}`)
    const { messages = [] } = await r.json()
    if (messages.length) {
      const msg = await (await fetch(`${MAILPIT}/api/v1/message/${messages[0].ID}`)).json()
      const body = `${msg.Text ?? ''}\n${msg.HTML ?? ''}`
      const link = body.match(/https?:\/\/[^\s"'<>]+\/auth\/v1\/verify[^\s"'<>]+/)?.[0]
      if (link) return link.replace(/&amp;/g, '&')
      throw new Error('confirmation email has no verify link')
    }
    await new Promise((r) => setTimeout(r, 1000))
  }
  throw new Error(`no email for ${email} after 30s`)
}

async function signUp(page, u) {
  await page.goto(`${BASE}/signup`)
  await page.getByLabel('Full name').fill(u.name)
  await page.getByLabel('Work email').fill(u.email)
  await page.getByLabel('Password').fill(u.password)
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.getByRole('heading', { name: 'Check your email' }).waitFor({ timeout: 15000 })
}

async function signIn(page, u, password = u.password) {
  await page.goto(`${BASE}/signin`)
  await page.getByLabel('Work email').fill(u.email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
}

const browser = await chromium.launch()
const page = await (await browser.newContext()).newPage()
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(e.message))

await step('live mode: no demo accounts offered on sign-in', async () => {
  await page.goto(`${BASE}/signin`)
  await page.getByRole('heading', { name: 'Sign in to Exit Brain' }).waitFor()
  if (await page.getByText('MOCK DATA: demo workspace').count())
    throw new Error('demo panel shown in live mode')
})

await step('sign-up sends a confirmation email', async () => {
  await signUp(page, user)
  if (await page.getByText('no account was created').count())
    throw new Error('demo notice shown in live mode')
})

await step('confirmation link signs the user in and shows workspace creation', async () => {
  const link = await confirmationLink(user.email)
  await page.goto(link)
  await page.getByRole('heading', { name: /^Welcome/ }).waitFor({ timeout: 15000 })
  await page.getByRole('button', { name: 'Create workspace' }).waitFor()
})

await step('session survives a reload of /app', async () => {
  await page.goto(`${BASE}/app`)
  await page.getByRole('heading', { name: /^Welcome/ }).waitFor({ timeout: 15000 })
})

await step('sign out returns to sign-in and protects /app', async () => {
  await page.getByRole('button', { name: 'Sign out' }).click()
  await page.goto(`${BASE}/app/transitions`)
  await page.waitForURL('**/signin', { timeout: 15000 })
})

await step('wrong password is rejected with a safe message', async () => {
  await signIn(page, user, 'wrong-password-1')
  await page.getByText('Email or password is incorrect.').waitFor({ timeout: 15000 })
})

await step('correct password signs in again', async () => {
  await signIn(page, user)
  await page.getByRole('heading', { name: /^Welcome/ }).waitFor({ timeout: 15000 })
})

await step('unconfirmed account cannot sign in', async () => {
  const p2 = await (await browser.newContext()).newPage()
  await signUp(p2, unconfirmed)
  await signIn(p2, unconfirmed)
  await p2.getByText('Confirm your email first.').waitFor({ timeout: 15000 })
})

await step('no uncaught page errors', async () => {
  if (pageErrors.length) throw new Error(pageErrors.slice(0, 3).join(' | '))
})

await browser.close()
console.log(failures ? `\n${failures} live-auth check(s) failed` : '\nall live-auth checks passed')
process.exit(failures ? 1 : 0)
