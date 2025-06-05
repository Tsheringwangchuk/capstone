/*
  Warnings:

  - A unique constraint covering the columns `[Workpermit]` on the table `register_details` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Workpermit` to the `register_details` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "register_details" ADD COLUMN     "Workpermit" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "register_details_Workpermit_key" ON "register_details"("Workpermit");
