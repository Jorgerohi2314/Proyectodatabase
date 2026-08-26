import path from 'path'

process.env.NODE_ENV = 'test'
const testDbUrl = process.env.TEST_DATABASE_URL
  ?? 'postgresql://usuario_db:141414@localhost:5432/gestion_clientes_test'
process.env.DATABASE_URL = testDbUrl

export const testDatabaseUrl = testDbUrl
