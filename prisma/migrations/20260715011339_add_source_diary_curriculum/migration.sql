-- CreateEnum
CREATE TYPE "UserSource" AS ENUM ('PROPIO', 'DERIVADO');

-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "curriculum" TEXT,
ADD COLUMN     "source" "UserSource" NOT NULL DEFAULT 'PROPIO';

-- CreateTable
CREATE TABLE "diary_entries" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,

    CONSTRAINT "diary_entries_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "diary_entries" ADD CONSTRAINT "diary_entries_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
