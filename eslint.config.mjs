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
  {
    // R3F mutates three.js objects (uniforms, gl.info, cameras) imperatively inside useFrame by design.
    files: ['src/three/**'],
    rules: { 'react-hooks/immutability': 'off' },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'shots/**', 'next-env.d.ts']),
])
