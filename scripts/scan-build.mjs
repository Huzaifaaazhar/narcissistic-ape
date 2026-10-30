// Fails if anything secret-shaped ends up in the client build (spec 11.2).
import { readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'

const ROOT = '.next/static'
const PATTERNS = [
  [/sk-ant-[A-Za-z0-9_-]{10,}/, 'Anthropic key'],
  [/SUPABASE_SERVICE_ROLE_KEY|service_role/, 'Supabase service role reference'],
  [/eyJhbGciOi[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/, 'JWT (check it is the anon key only)'],
  [/UPSTASH_REDIS_REST_TOKEN|TURNSTILE_SECRET_KEY|RUN_SIGNING_SECRET|IP_HASH_SALT/, 'server-only env name'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key'],
  [/AKIA[0-9A-Z]{16}/, 'AWS key'],
]
const allowAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function* walk(dir) {
  for (const name of await readdir(dir)) {
    const p = join(dir, name)
    if ((await stat(p)).isDirectory()) yield* walk(p)
    else yield p
  }
}

let bad = 0
try {
  for await (const file of walk(ROOT)) {
    if (!/\.(js|css|html|json|map)$/.test(file)) continue
    const text = await readFile(file, 'utf8')
    for (const [re, what] of PATTERNS) {
      const m = text.match(re)
      if (m && !(allowAnon && m[0] === allowAnon)) {
        console.error(`✖ ${what} in ${file}`)
        bad++
      }
    }
    if (file.endsWith('.map')) { console.error(`✖ source map shipped: ${file}`); bad++ }
  }
} catch (e) {
  if (e.code === 'ENOENT') { console.error('No .next/static — run `npm run build` first.'); process.exit(1) }
  throw e
}
if (bad) process.exit(1)
console.log('scan-build: client bundle clean')
