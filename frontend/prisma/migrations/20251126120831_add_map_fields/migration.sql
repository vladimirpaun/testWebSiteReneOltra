/*
  Warnings:

  - A unique constraint covering the columns `[zoneId,number]` on the table `Stay` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Stay" ADD COLUMN     "number" INTEGER,
ADD COLUMN     "zoneId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Stay_zoneId_number_key" ON "Stay"("zoneId", "number");
