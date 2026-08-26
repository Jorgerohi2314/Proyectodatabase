-- CreateEnum
CREATE TYPE "AcademicLevel" AS ENUM ('SIN_ESTUDIOS', 'ESTUDIOS_PRIMARIOS', 'CERTIFICADO_ESCOLARIDAD', 'EGB', 'ESO', 'BACHILLER', 'FPI_CICLO_GRADO_MEDIO', 'FPII_CICLO_GRADO_SUPERIOR', 'DIPLOMADO_ING_TECNICO', 'LICENCIADO_ING_SUPERIOR', 'OTROS');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('HOMBRE', 'MUJER');

-- CreateEnum
CREATE TYPE "YesNo" AS ENUM ('SI', 'NO');

-- CreateEnum
CREATE TYPE "UserSource" AS ENUM ('PROPIO', 'DERIVADO');

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT,
    "source" "UserSource" NOT NULL DEFAULT 'PROPIO',
    "fechaNacimiento" TIMESTAMP(3),
    "nacionalidad" TEXT,
    "documentoIdentidad" TEXT,
    "numeroSeguridadSocial" TEXT,
    "sexo" "Gender",
    "direccion" TEXT,
    "localidad" TEXT,
    "codigoPostal" TEXT,
    "telefono1" TEXT,
    "telefono2" TEXT,
    "email" TEXT,
    "carnetConducir" "YesNo" NOT NULL DEFAULT 'NO',
    "vehiculoPropio" "YesNo" NOT NULL DEFAULT 'NO',
    "tieneDiscapacidad" "YesNo" NOT NULL DEFAULT 'NO',
    "porcentajeDiscapacidad" INTEGER,
    "tipoDiscapacidad" TEXT,
    "entidadDerivacion" TEXT,
    "tecnicoDerivacion" TEXT,
    "colectivo" TEXT,
    "insertado" "YesNo" NOT NULL DEFAULT 'NO',
    "sector" TEXT,
    "empresa" TEXT,
    "localidadInsercion" TEXT,
    "curriculum" TEXT,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "socio_economic_data" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "composicionFamiliar" TEXT,
    "situacionEconomica" TEXT,
    "otrasCircunstancias" TEXT,
    "userProfileId" TEXT NOT NULL,

    CONSTRAINT "socio_economic_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_data" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "formacionAcademica" "AcademicLevel",
    "anioFinalizacion" INTEGER,
    "especificacionOtros" TEXT,
    "experienciaLaboralPrevia" TEXT,
    "userProfileId" TEXT NOT NULL,

    CONSTRAINT "education_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complementary_courses" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nombreCurso" TEXT,
    "duracionHoras" INTEGER,
    "entidad" TEXT,
    "fechaRealizacion" TIMESTAMP(3),
    "userProfileId" TEXT NOT NULL,

    CONSTRAINT "complementary_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "income_members" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "numero" INTEGER,
    "tipo" TEXT,
    "cantidad" DOUBLE PRECISION,
    "userProfileId" TEXT NOT NULL,

    CONSTRAINT "income_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diary_entries" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,

    CONSTRAINT "diary_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "socio_economic_data_userProfileId_key" ON "socio_economic_data"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "education_data_userProfileId_key" ON "education_data"("userProfileId");

-- AddForeignKey
ALTER TABLE "socio_economic_data" ADD CONSTRAINT "socio_economic_data_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_data" ADD CONSTRAINT "education_data_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complementary_courses" ADD CONSTRAINT "complementary_courses_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "income_members" ADD CONSTRAINT "income_members_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diary_entries" ADD CONSTRAINT "diary_entries_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

