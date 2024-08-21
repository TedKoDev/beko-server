/*
  Warnings:

  - Added the required column `updated_at` to the `adminBlock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "adminBlock" ADD COLUMN     "block_count" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "updated_at" TIMESTAMP NOT NULL;
