/*
  Warnings:

  - Added the required column `meaning_en` to the `wordlist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "wordlist" ADD COLUMN     "example_sentence" TEXT,
ADD COLUMN     "example_translation" TEXT,
ADD COLUMN     "meaning_en" VARCHAR(255) NOT NULL;
