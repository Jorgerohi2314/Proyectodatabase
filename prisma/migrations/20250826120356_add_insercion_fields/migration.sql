-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "fechaNacimiento" DATETIME NOT NULL,
    "nacionalidad" TEXT NOT NULL,
    "documentoIdentidad" TEXT NOT NULL,
    "numeroSeguridadSocial" TEXT,
    "sexo" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "localidad" TEXT NOT NULL,
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
    "empresa" TEXT
);

-- CreateTable
CREATE TABLE "socio_economic_data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "composicionFamiliar" TEXT NOT NULL,
    "situacionEconomica" TEXT NOT NULL,
    "otrasCircunstancias" TEXT,
    "userProfileId" TEXT NOT NULL,
    CONSTRAINT "socio_economic_data_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "user_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "education_data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "formacionAcademica" TEXT NOT NULL,
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
    "nombreCurso" TEXT NOT NULL,
    "duracionHoras" INTEGER NOT NULL,
    "entidad" TEXT NOT NULL,
    "fechaRealizacion" DATETIME NOT NULL,
    "userProfileId" TEXT NOT NULL,
    CONSTRAINT "complementary_courses_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "user_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "income_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "numero" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "cantidad" REAL NOT NULL,
    "userProfileId" TEXT NOT NULL,
    CONSTRAINT "income_members_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "user_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "socio_economic_data_userProfileId_key" ON "socio_economic_data"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "education_data_userProfileId_key" ON "education_data"("userProfileId");
