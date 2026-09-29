import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    fileParallelism: false,
    hookTimeout: 60000,
    include: ['tests/guest-migration.test.js'],
    maxWorkers: 1,
    pool: 'forks',
    testTimeout: 60000,
  },
})
