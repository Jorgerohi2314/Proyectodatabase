import path from 'path'
// @ts-ignore - node:sqlite disponible en Node >=22
import { DatabaseSync } from 'node:sqlite'
import { applySqliteDdl } from '../scripts/sqlite-ddl'

const projectRoot = path.resolve(__dirname, '..')

export function resetTestDb() {
  // Nota: usamos node:sqlite en lugar de `prisma db push --force-reset` porque el
  // schema-engine de Prisma no puede ejecutarse en esta máquina (bloqueado por Device Guard).
  // file:./test.db se resuelve relativo a prisma/ (donde está schema.prisma)
  const dbFile = path.resolve(projectRoot, 'prisma', 'test.db')
  applySqliteDdl(dbFile, { reset: true })
  return dbFile
}

if (require.main === module) {
  resetTestDb()
  console.log('OK - base de datos de test regenerada (SQLite)')
}
