-- AlterTable
ALTER TABLE "public"."education_data" ALTER COLUMN "formacionAcademica" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."socio_economic_data" ALTER COLUMN "composicionFamiliar" DROP NOT NULL,
ALTER COLUMN "situacionEconomica" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."user_profiles" ALTER COLUMN "fechaNacimiento" DROP NOT NULL,
ALTER COLUMN "nacionalidad" DROP NOT NULL,
ALTER COLUMN "documentoIdentidad" DROP NOT NULL,
ALTER COLUMN "direccion" DROP NOT NULL,
ALTER COLUMN "localidad" DROP NOT NULL;
