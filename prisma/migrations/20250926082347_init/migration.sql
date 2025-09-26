-- CreateEnum
CREATE TYPE "public"."AcademicLevel" AS ENUM ('SIN_ESTUDIOS', 'ESTUDIOS_PRIMARIOS', 'CERTIFICADO_ESCOLARIDAD', 'EGB', 'ESO', 'BACHILLER', 'FPI_CICLO_GRADO_MEDIO', 'FPII_CICLO_GRADO_SUPERIOR', 'DIPLOMADO_ING_TECNICO', 'LICENCIADO_ING_SUPERIOR', 'OTROS');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('HOMBRE', 'MUJER');

-- CreateEnum
CREATE TYPE "public"."YesNo" AS ENUM ('SI', 'NO');

-- CreateTable
CREATE TABLE "public"."user_profiles" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "nacionalidad" TEXT NOT NULL,
    "documentoIdentidad" TEXT NOT NULL,
    "numeroSeguridadSocial" TEXT,
    "sexo" "public"."Gender" NOT NULL,
    "direccion" TEXT NOT NULL,
    "localidad" TEXT NOT NULL,
    "codigoPostal" TEXT,
    "telefono1" TEXT,
    "telefono2" TEXT,
    "email" TEXT,
    "carnetConducir" "public"."YesNo" NOT NULL DEFAULT 'NO',
    "vehiculoPropio" "public"."YesNo" NOT NULL DEFAULT 'NO',
    "tieneDiscapacidad" "public"."YesNo" NOT NULL DEFAULT 'NO',
    "porcentajeDiscapacidad" INTEGER,
    "tipoDiscapacidad" TEXT,
    "entidadDerivacion" TEXT,
    "tecnicoDerivacion" TEXT,
    "colectivo" TEXT,
    "insertado" "public"."YesNo" NOT NULL DEFAULT 'NO',
    "sector" TEXT,
    "empresa" TEXT,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."socio_economic_data" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "composicionFamiliar" TEXT NOT NULL,
    "situacionEconomica" TEXT NOT NULL,
    "otrasCircunstancias" TEXT,
    "userProfileId" TEXT NOT NULL,

    CONSTRAINT "socio_economic_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."education_data" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "formacionAcademica" "public"."AcademicLevel" NOT NULL,
    "anioFinalizacion" INTEGER,
    "especificacionOtros" TEXT,
    "experienciaLaboralPrevia" TEXT,
    "userProfileId" TEXT NOT NULL,

    CONSTRAINT "education_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."complementary_courses" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nombreCurso" TEXT NOT NULL,
    "duracionHoras" INTEGER NOT NULL,
    "entidad" TEXT NOT NULL,
    "fechaRealizacion" TIMESTAMP(3) NOT NULL,
    "userProfileId" TEXT NOT NULL,

    CONSTRAINT "complementary_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."income_members" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "numero" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "userProfileId" TEXT NOT NULL,

    CONSTRAINT "income_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "socio_economic_data_userProfileId_key" ON "public"."socio_economic_data"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "education_data_userProfileId_key" ON "public"."education_data"("userProfileId");

-- AddForeignKey
ALTER TABLE "public"."socio_economic_data" ADD CONSTRAINT "socio_economic_data_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."education_data" ADD CONSTRAINT "education_data_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."complementary_courses" ADD CONSTRAINT "complementary_courses_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."income_members" ADD CONSTRAINT "income_members_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
