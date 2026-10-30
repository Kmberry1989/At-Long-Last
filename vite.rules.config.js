import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    fileParallelism: false,
    hookTimeout: 30000,
    include: ['tests/*.rules.test.js'],
    maxWorkers: 1,
    pool: 'forks',
    testTimeout: 20000,
  },
})
