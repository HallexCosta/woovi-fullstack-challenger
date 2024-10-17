import path from 'node:path'
import { defineConfig, Options } from 'tsup'

const entryDir = path.resolve(process.cwd(), 'src', 'server.ts')
const outDir = path.resolve(process.cwd(), 'dist')

export const loadServerConfig = (options: Options = {}) =>
  defineConfig(
    Object.assign(
      {
        clean: true,
        dts: true,
        entry: [entryDir],
        format: ['esm', 'cjs', 'iife'],
        sourcemap: true,
        minify: true,
        target: 'esnext',
        outDir: outDir
      },
      options
    )
  )
