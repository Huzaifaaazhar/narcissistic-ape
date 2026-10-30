export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { env } = await import('./lib/env')
    try {
      env()
    } catch (e) {
      // Refuse to boot: a half-configured deploy must never serve traffic. Message lists names only.
      console.error(`[env] ${(e as Error).message}`)
      process.exit(1)
    }
  }
}
