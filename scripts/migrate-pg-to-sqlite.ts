/**
 * Migración de PostgreSQL a SQLite a partir de un volcado pg_dump (backup_20260825.sql).
 *
 * MOTIVACIÓN:
 *  - La aplicación pasa de PostgreSQL a SQLite (provider "sqlite").
 *  - En esta máquina el schema-engine de Prisma está bloqueado por Device Guard,
 *    así que ni `prisma db push` ni `prisma migrate` pueden ejecutarse.
 *  - Este script crea la BD SQLite con el DDL exacto que Prisma espera (verificado
 *    contra prisma/production.db) y carga los datos del volcado usando el módulo nativo
 *    node:sqlite (no depende del schema-engine).
 *
 * USO:
 *   node scripts/migrate-pg-to-sqlite.ts [ruta_backup] [ruta_sqlite]
 *   (ruta_backup por defecto: db-backups/backup_20260825.sql)
 *
 * Observaciones:
 *  - Se conservan los IDs y las relaciones (FK) originales.
 *  - Los campos DateTime se guardan como epoch (milisegundos), igual que Prisma SQLite.
 *  - La tabla diary_entries del dump antiguo no traía `updatedAt`/`date`/`horas`;
 *    se rellenan con valores equivalentes (date=createdAt) para encajar en el schema actual.
 */

// @ts-ignore - node:sqlite está disponible en Node >=22 (los tipos de @types/node del repo son >=20)
import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { applySqliteDdl } from './sqlite-ddl'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DEFAULT_BACKUP = resolve(__dirname, '..', 'db-backups', 'backup_20260825.sql')
const DEFAULT_DB = resolve(__dirname, '..', 'prisma', 'production.db')

const backupPath = process.argv[2] || DEFAULT_BACKUP
const dbPath = process.argv[3] || DEFAULT_DB

// ---------------------------------------------------------------------------
// Parsing del volcado pg_dump (formato COPY ... FROM stdin;)
// ---------------------------------------------------------------------------

/** Decodifica los escapes de una celda del formato COPY de PostgreSQL. */
function decodeCell(raw: string): string | null {
  if (raw === '\\N') return null // NULL
  let out = ''
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]
    if (ch === '\\' && i + 1 < raw.length) {
      const next = raw[i + 1]
      switch (next) {
        case 'n': out += '\n'; i++; break
        case 't': out += '\t'; i++; break
        case 'r': out += '\r'; i++; break
        case 'b': out += '\b'; i++; break
        case 'f': out += '\f'; i++; break
        case 'v': out += '\v'; i++; break
        case '\\': out += '\\'; i++; break
        case 'N': out += '\\N'; i++; break // backslash literal + N
        default: out += '\\' // escape desconocido: conservar la barra
      }
    } else {
      out += ch
    }
  }
  return out
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(\.\d+)?$/

/** Convierte una fecha del formato pg (YYYY-MM-DD HH:MM:SS[.mmm]) a epoch ms (UTC). */
function toEpoch(value: string | null): number | null {
  if (value === null) return null
  const m = DATE_RE.exec(value.trim())
  if (!m) return null
  const [, Y, Mo, D, H, Mi, S] = m
  const frac = m[7] ? Math.round(parseFloat('0' + m[7]) * 1000) : 0
  return Date.UTC(+Y, +Mo - 1, +D, +H, +Mi, +S, frac)
}

function toInt(value: string | null): number | null {
  if (value === null) return null
  const str = value.trim()
  if (str === '') return null
  const n = Number(str)
  return Number.isNaN(n) ? null : n
}

function toFloat(value: string | null): number | null {
  return toInt(value)
}

// ---------------------------------------------------------------------------
// Lectura y carga
// ---------------------------------------------------------------------------

const sql = readFileSync(backupPath, 'utf8')
const lines = sql.split(/\r?\n/)

// Extraer todas las secciones COPY public.<tabla> (cols) FROM stdin;
const sections: Array<{ table: string; columns: string[]; rows: string[] }> = []
for (let i = 0; i < lines.length; i++) {
  const m = /^COPY public\.([a-z_]+) \((.*)\) FROM stdin;/.exec(lines[i])
  if (m) {
    const table = m[1]
    const columns = m[2]
      .split(',')
      .map((c) => c.trim().replace(/^"(.*)"$/, '$1'))
    const rows: string[] = []
    let j = i + 1
    while (j < lines.length && lines[j] !== '\\.') {
      rows.push(lines[j])
      j++
    }
    sections.push({ table, columns, rows })
    i = j
  }
}

console.log('Secciones encontradas en el volcado:')
for (const s of sections) {
  const nonEmpty = s.rows.filter((r) => r.trim() !== '').length
  console.log(`  - ${s.table}: ${nonEmpty} filas [columnas: ${s.columns.join(', ')}]`)
}

// Preparar BD destino (crea el DDL y vacía tablas para permitir re-ejecución)
applySqliteDdl(dbPath, { reset: true })
const db = new DatabaseSync(dbPath)
db.exec('PRAGMA foreign_keys = OFF;')

// Columnas por tabla (las del schema actual, en orden de inserción)
const COLS: Record<string, string[]> = {
  user_profiles: [
    'id', 'createdAt', 'updatedAt', 'nombre', 'apellidos', 'source', 'fechaNacimiento',
    'nacionalidad', 'documentoIdentidad', 'numeroSeguridadSocial', 'sexo', 'direccion',
    'localidad', 'codigoPostal', 'telefono1', 'telefono2', 'email', 'carnetConducir',
    'vehiculoPropio', 'tieneDiscapacidad', 'porcentajeDiscapacidad', 'tipoDiscapacidad',
    'entidadDerivacion', 'tecnicoDerivacion', 'colectivo', 'insertado', 'sector',
    'empresa', 'localidadInsercion',
  ],
  socio_economic_data: ['id', 'createdAt', 'updatedAt', 'composicionFamiliar', 'situacionEconomica', 'otrasCircunstancias', 'userProfileId'],
  education_data: ['id', 'createdAt', 'updatedAt', 'formacionAcademica', 'anioFinalizacion', 'especificacionOtros', 'experienciaLaboralPrevia', 'userProfileId'],
  complementary_courses: ['id', 'createdAt', 'updatedAt', 'nombreCurso', 'duracionHoras', 'entidad', 'fechaRealizacion', 'userProfileId'],
  income_members: ['id', 'createdAt', 'updatedAt', 'numero', 'tipo', 'cantidad', 'userProfileId'],
  diary_entries: ['createdAt', 'id', 'updatedAt', 'date', 'content', 'horas', 'userProfileId'],
}

// Orden de inserción (padres antes que hijos)
const INSERT_ORDER = ['user_profiles', 'education_data', 'socio_economic_data', 'complementary_courses', 'income_members', 'diary_entries']

// columnas de fecha dentro de cada tabla
const DATE_COLS: Record<string, string[]> = {
  user_profiles: ['createdAt', 'updatedAt', 'fechaNacimiento'],
  socio_economic_data: ['createdAt', 'updatedAt'],
  education_data: ['createdAt', 'updatedAt'],
  complementary_courses: ['createdAt', 'updatedAt', 'fechaRealizacion'],
  income_members: ['createdAt', 'updatedAt'],
  diary_entries: ['createdAt', 'updatedAt', 'date'],
}

const counters: Record<string, number> = {}

for (const table of INSERT_ORDER) {
  const section = sections.find((s) => s.table === table)
  if (!section) {
    console.log(`\n[${table}] sin sección en el volcado, se omite.`)
    continue
  }
  // Construyo un map columna->valor por cada fila, usando las columnas que vienen en el dump
  const placeholders = COLS[table].map(() => '?').join(', ')
  const stmt = db.prepare(`INSERT INTO ${table} (${COLS[table].join(', ')}) VALUES (${placeholders})`)

  let n = 0
  for (const rowLine of section.rows) {
    if (rowLine.trim() === '') continue
    const cells = rowLine.split('\t').map(decodeCell)
    const dumpCols = section.columns
    const data: Record<string, string | number | null> = {}
    cells.forEach((val, idx) => {
      const col = dumpCols[idx]
      if (col === undefined) return
      data[col] = val
    })

    // Relleno el resto de columnas del schema (que quizá no venían en el dump)
    const values: Array<string | number | null> = COLS[table].map((col) => {
      let v: string | number | null = col in data ? data[col] : null
      // Si la columna es NULL pero NOT NULL y no viene, dar un valor razonable
      if (v === null) {
        if (col === 'updatedAt') v = data['createdAt'] ?? Date.now()
        if (col === 'date') v = data['createdAt'] ?? Date.now()
        if (col === 'content') v = ''
      }
      if (DATE_COLS[table]?.includes(col) && v !== null) {
        const e = toEpoch(String(v))
        return e ?? v
      }
      return v
    })

    stmt.run(...values)
    n++
  }
  counters[table] = n
  console.log(`\n[${table}] -> insertadas ${n} filas.`)
}

db.exec('ANALYZE;')
db.close()

console.log('\n=== RESUMEN ===')
for (const t of Object.keys(counters)) console.log(`  ${t}: ${counters[t]}`)
console.log('\nBD SQLite generada en:', dbPath)
