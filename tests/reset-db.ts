import { execSync } from 'child_process'
import path from 'path'

const projectRoot = path.resolve(__dirname, '..')

export function resetTestDb() {
  const databaseUrl = process.env.TEST_DATABASE_URL
    ?? 'postgresql://usuario_db:141414@localhost:5432/gestion_clientes_test'

  execSync('npx prisma db push --force-reset --skip-generate --accept-data-loss', {
    cwd: projectRoot,
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
    stdio: 'inherit',
  })
}

if (require.main === module) {
  resetTestDb()
}
