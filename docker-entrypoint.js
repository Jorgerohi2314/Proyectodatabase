// Entrypoint del contenedor. Verifica que la BD SQLite tenga las tablas del esquema
// y las crea si faltan (para arrancar con una BD vacía la primera vez). Luego lanza la app.
//
// La BD puede venir de: (1) la imagen, (2) un volumen persistente, o (3) un bind-mount
// host (datos copiados por scp/rsync). Esta inicialización es idempotente.

const path = require('path')
const fs = require('fs')
const { execFileSync } = require('child_process')

const DB_PATH = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace(/^file:/, '')
  : '/app/prisma/production.db'
const ABS_DB = path.isAbsolute(DB_PATH) ? DB_PATH : path.resolve(process.cwd(), DB_PATH)

// El esquema lo comparte un helper JS (sqlite-ddl.js) que genera el DDL de Prisma.
const { createSchemaIfNeeded } = require('./prisma/sqlite-ddl.js')

function main() {
  fs.mkdirSync(path.dirname(ABS_DB), { recursive: true })

  // Si el contenedor arranca sin que el archivo exista en el host, Docker crea un
  // DIRECTORIO en su lugar (bind-mount de un archivo inexistente). SQLite no puede
  // abrirlo y el fallo es confuso. Detectamos y advertimos claramente.
  let stat = null
  try {
    stat = fs.statSync(ABS_DB)
  } catch (e) {
    if (e.code !== 'ENOENT') throw e
  }
  if (stat && stat.isDirectory()) {
    console.error(
      `[entrypoint] ⚠️  La ruta de BD '${ABS_DB}' es un DIRECTORIO, no un archivo.` +
      '\nEl bind-mount apuntaba a un archivo inexistente en el host y Docker creó un directorio en su lugar.' +
      `\nEn el HOST, borra el directorio y crea un archivo (o copia tu production.db real) en esa ruta:` +
      `\n    rm -rf <host>${path.dirname(ABS_DB)}` +
      `\n    touch <host>${ABS_DB}   # o: scp prisma/production.db <host>${ABS_DB}` +
      '\nLuego vuelve a ejecutar: docker compose up -d --build web_gestion'
    )
    process.exit(1)
  }

  createSchemaIfNeeded(ABS_DB)
  console.log(`[entrypoint] Base de datos lista en ${ABS_DB}`)

  // Ejecuta la app (server.js del standalone de Next)
  const appArgs = ['server.js']
  try {
    execFileSync(process.execPath, appArgs, { stdio: 'inherit' })
  } catch (err) {
    console.error('[entrypoint] La app finalizó con error:', err)
    process.exit(1)
  }
}

main()
