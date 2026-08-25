-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT,
    "source" TEXT NOT NULL DEFAULT 'PROPIO',
    "fechaNacimiento" DATETIME,
    "nacionalidad" TEXT,
    "documentoIdentidad" TEXT,
    "numeroSeguridadSocial" TEXT,
    "sexo" TEXT,
    "direccion" TEXT,
    "localidad" TEXT,
    "codigoPostal" TEXT,
    "telefono1" TEXT,
    "telefono2" TEXT,
    "email" TEXT,
    "carnetConducir" TEXT NOT NULL DEFAULT 'NO',
    "vehiculoPropio" TEXT NOT NULL DEFAULT 'NO',
    "tieneDiscapacidad" TEXT NOT NULL DEFAULT 'NO',
    "porcentajeDiscapacidad" INTEGER,
    "tipoDiscapacidad" TEXT,
    "entidadDerivacion" TEXT,
    "tecnicoDerivacion" TEXT,
    "colectivo" TEXT,
    "insertado" TEXT NOT NULL DEFAULT 'NO',
    "sector" TEXT,
    "empresa" TEXT,
    "curriculum" TEXT
);

-- CreateTable
CREATE TABLE "socio_economic_data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "composicionFamiliar" TEXT,
    "situacionEconomica" TEXT,
    "otrasCircunstancias" TEXT,
    "userProfileId" TEXT NOT NULL,
    CONSTRAINT "socio_economic_data_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "user_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "education_data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "formacionAcademica" TEXT,
    "anioFinalizacion" INTEGER,
    "especificacionOtros" TEXT,
    "experienciaLaboralPrevia" TEXT,
    "userProfileId" TEXT NOT NULL,
    CONSTRAINT "education_data_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "user_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "complementary_courses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "nombreCurso" TEXT,
    "duracionHoras" INTEGER,
    "entidad" TEXT,
    "fechaRealizacion" DATETIME,
    "userProfileId" TEXT NOT NULL,
    CONSTRAINT "complementary_courses_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "user_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "income_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "numero" INTEGER,
    "tipo" TEXT,
    "cantidad" REAL,
    "userProfileId" TEXT NOT NULL,
    CONSTRAINT "income_members_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "user_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "diary_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    CONSTRAINT "diary_entries_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "user_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "socio_economic_data_userProfileId_key" ON "socio_economic_data"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "education_data_userProfileId_key" ON "education_data"("userProfileId");
