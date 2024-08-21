/*
  Warnings:

  - Added the required column `target_id` to the `report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `target_type` to the `report` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "reportTargetType" AS ENUM ('POST', 'COMMENT', 'USER');

-- AlterTable
ALTER TABLE "report" ADD COLUMN     "target_id" INTEGER NOT NULL,
ADD COLUMN     "target_type" "reportTargetType" NOT NULL;
