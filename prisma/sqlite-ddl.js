// Helper JS para el contenedor (entrypoint). Crea el esquema SQLite de Prisma
// si la base de datos no tiene las tablas. Es el mismo DDL que scripts/sqlite-ddl.ts,
// duplicado en JS puro porque el runner de producción no compila TypeScript.

const SQLITE_DDL = `
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT NOT NULL PRIMARY KEY,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL,
  nombre TEXT NOT NULL,
  apellidos TEXT,
  source TEXT NOT NULL DEFAULT 'PROPIO',
  fechaNacimiento DATETIME,
  nacionalidad TEXT,
  documentoIdentidad TEXT,
  numeroSeguridadSocial TEXT,
  sexo TEXT,
  direccion TEXT,
  localidad TEXT,
  codigoPostal TEXT,
  telefono1 TEXT,
  telefono2 TEXT,
  email TEXT,
  carnetConducir TEXT NOT NULL DEFAULT 'NO',
  vehiculoPropio TEXT NOT NULL DEFAULT 'NO',
  tieneDiscapacidad TEXT NOT NULL DEFAULT 'NO',
  porcentajeDiscapacidad INTEGER,
  tipoDiscapacidad TEXT,
  entidadDerivacion TEXT,
  tecnicoDerivacion TEXT,
  colectivo TEXT,
  insertado TEXT NOT NULL DEFAULT 'NO',
  sector TEXT,
  empresa TEXT,
  localidadInsercion TEXT,
  curriculumFile BLOB,
  curriculumFileName TEXT,
  curriculumMimeType TEXT,
  curriculumSize INTEGER
);
CREATE TABLE IF NOT EXISTS socio_economic_data (
  id TEXT NOT NULL PRIMARY KEY,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL,
  composicionFamiliar TEXT,
  situacionEconomica TEXT,
  otrasCircunstancias TEXT,
  userProfileId TEXT NOT NULL,
  FOREIGN KEY (userProfileId) REFERENCES user_profiles (id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS education_data (
  id TEXT NOT NULL PRIMARY KEY,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL,
  formacionAcademica TEXT,
  anioFinalizacion INTEGER,
  especificacionOtros TEXT,
  experienciaLaboralPrevia TEXT,
  userProfileId TEXT NOT NULL,
  FOREIGN KEY (userProfileId) REFERENCES user_profiles (id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS complementary_courses (
  id TEXT NOT NULL PRIMARY KEY,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL,
  nombreCurso TEXT,
  duracionHoras INTEGER,
  entidad TEXT,
  fechaRealizacion DATETIME,
  userProfileId TEXT NOT NULL,
  FOREIGN KEY (userProfileId) REFERENCES user_profiles (id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS income_members (
  id TEXT NOT NULL PRIMARY KEY,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL,
  numero INTEGER,
  tipo TEXT,
  cantidad REAL,
  userProfileId TEXT NOT NULL,
  FOREIGN KEY (userProfileId) REFERENCES user_profiles (id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS diary_entries (
  id TEXT NOT NULL PRIMARY KEY,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL,
  date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  content TEXT NOT NULL,
  userProfileId TEXT NOT NULL,
  horas REAL,
  FOREIGN KEY (userProfileId) REFERENCES user_profiles (id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS education_data_userProfileId_key ON education_data (userProfileId);
CREATE UNIQUE INDEX IF NOT EXISTS socio_economic_data_userProfileId_key ON socio_economic_data (userProfileId);
`

const TABLES = ['diary_entries', 'income_members', 'complementary_courses', 'education_data', 'socio_economic_data', 'user_profiles']

function createSchemaIfNeeded(dbPath) {
  const { DatabaseSync } = require('node:sqlite')
  const db = new DatabaseSync(dbPath)
  db.exec('PRAGMA foreign_keys = OFF;')
  const existing = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table'")
    .all()
    .map((r) => r.name)
  const missing = TABLES.filter((t) => !existing.includes(t))
  if (missing.length > 0) {
    for (const stmt of SQLITE_DDL.split(';')) {
      const t = stmt.trim()
      if (t) db.exec(t)
    }
    console.log(`[entrypoint] Esquema creado (faltaban: ${missing.join(', ')})`)
  }
  db.exec('ANALYZE;')
  db.close()
}

module.exports = { createSchemaIfNeeded }
