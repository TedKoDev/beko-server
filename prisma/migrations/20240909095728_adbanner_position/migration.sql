/*
  Warnings:

  - Changed the type of `position` on the `AdBanner` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "AdBanner" DROP COLUMN "position",
ADD COLUMN     "position" INTEGER NOT NULL;
