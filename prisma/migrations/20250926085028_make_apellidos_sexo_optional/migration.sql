-- AlterTable
ALTER TABLE "public"."complementary_courses" ALTER COLUMN "nombreCurso" DROP NOT NULL,
ALTER COLUMN "duracionHoras" DROP NOT NULL,
ALTER COLUMN "entidad" DROP NOT NULL,
ALTER COLUMN "fechaRealizacion" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."income_members" ALTER COLUMN "numero" DROP NOT NULL,
ALTER COLUMN "tipo" DROP NOT NULL,
ALTER COLUMN "cantidad" DROP NOT NULL;
