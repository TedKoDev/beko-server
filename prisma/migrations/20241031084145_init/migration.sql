/*
  Warnings:

  - A unique constraint covering the columns `[word]` on the table `wordlist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "wordlist_word_key" ON "wordlist"("word");
