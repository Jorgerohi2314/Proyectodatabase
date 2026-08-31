/**
 * DDL SQLite equivalente al schema.prisma (provider "sqlite").
 * Verificado contra un dev.db generado por Prisma para garantizar compatibilidad
 * con el query-engine (los DateTime se guardan como epoch ms).
 */

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

// @ts-ignore - node:sqlite disponible en Node >=22
import { DatabaseSync } from 'node:sqlite'

/**
 * Aplica el DDL sobre un archivo SQLite.
 * Reconstruye las tablas desde cero (DROP + CREATE) para que un esquema
 * existente adopte cualquier cambio estructural con solo re-ejecutar.
 * @param dbFile Ruta absoluta del archivo .db
 * @param opts.reset Si true, además vacía las tablas (aquí es redundante: se recrean)
 */
export function applySqliteDdl(dbFile: string, opts: { reset?: boolean } = {}) {
  const db = new DatabaseSync(dbFile)
  db.exec('PRAGMA foreign_keys = OFF;')
  for (const t of TABLES) {
    db.prepare(`DROP TABLE IF EXISTS ${t}`).run()
  }
  for (const stmt of SQLITE_DDL.split(';')) {
    const t = stmt.trim()
    if (t) db.exec(t)
  }
  db.exec('ANALYZE;')
  db.close()
}
