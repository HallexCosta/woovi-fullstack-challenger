import { defineConfig, mergeConfig } from 'vitest/config'
import relay from './test/vitest-relay-plugin'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    plugins: [relay()],
    test: {
      name: '@woovi/bank-ui',
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/__tests__/setup/index.ts'],
      passWithNoTests: true,
      // browser: {
      // 	// provider: 'playwright', // or 'webdriverio'
      // 	enabled: true,
      // 	name: 'chromium' // browser name is required
      // },
      coverage: {
        provider: 'istanbul',
        reporter: ['text', 'json', 'html'],
        reportsDirectory: './coverage',
        all: true
      }
    },
    resolve: {
      alias: {
        '@/': new URL('./src/', import.meta.url).pathname,
        graphql: 'graphql/index.js'
      }
    }
  })
)
