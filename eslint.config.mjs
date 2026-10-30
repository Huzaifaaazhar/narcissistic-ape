import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // User text must always render as text (docs/SECURITY.md, 11.7).
      'react/no-danger': 'error',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'shots/**', 'next-env.d.ts']),
])
