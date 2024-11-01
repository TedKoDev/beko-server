-- CreateTable
CREATE TABLE "selected_words" (
    "id" SERIAL NOT NULL,
    "word_id" INTEGER NOT NULL,
    "selected_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "selected_words_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "selected_words_word_id_selected_date_key" ON "selected_words"("word_id", "selected_date");

-- AddForeignKey
ALTER TABLE "selected_words" ADD CONSTRAINT "selected_words_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "wordlist"("word_id") ON DELETE RESTRICT ON UPDATE CASCADE;
