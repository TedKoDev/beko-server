/*
  Warnings:

  - Added the required column `part_of_speech` to the `wordlist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "wordlist" ADD COLUMN     "part_of_speech" VARCHAR(50) NOT NULL,
ADD COLUMN     "usage_count" INTEGER NOT NULL DEFAULT 0;
