-- AlterEnum
ALTER TYPE "postType" ADD VALUE 'SENTENCE';

-- CreateTable
CREATE TABLE "post_sentence" (
    "sentence_id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "post_sentence_pkey" PRIMARY KEY ("sentence_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_sentence_post_id_key" ON "post_sentence"("post_id");

-- AddForeignKey
ALTER TABLE "post_sentence" ADD CONSTRAINT "post_sentence_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;
