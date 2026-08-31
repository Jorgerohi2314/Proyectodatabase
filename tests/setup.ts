import path from 'path'

process.env.NODE_ENV = 'test'
const testDbUrl = process.env.TEST_DATABASE_URL
  ?? 'file:./test.db'
process.env.DATABASE_URL = testDbUrl

export const testDatabaseUrl = testDbUrl
