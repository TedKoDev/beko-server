/*
  Warnings:

  - You are about to drop the `consultation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `consultationFile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `consultationMessage` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "postType" ADD VALUE 'CONSULTATION';

-- DropForeignKey
ALTER TABLE "consultation" DROP CONSTRAINT "consultation_category_id_fkey";

-- DropForeignKey
ALTER TABLE "consultation" DROP CONSTRAINT "consultation_student_id_fkey";

-- DropForeignKey
ALTER TABLE "consultation" DROP CONSTRAINT "consultation_teacher_id_fkey";

-- DropForeignKey
ALTER TABLE "consultationFile" DROP CONSTRAINT "consultationFile_consultation_id_fkey";

-- DropForeignKey
ALTER TABLE "consultationMessage" DROP CONSTRAINT "consultationMessage_consultation_id_fkey";

-- DropForeignKey
ALTER TABLE "consultationMessage" DROP CONSTRAINT "consultationMessage_sender_id_fkey";

-- DropTable
DROP TABLE "consultation";

-- DropTable
DROP TABLE "consultationFile";

-- DropTable
DROP TABLE "consultationMessage";

-- CreateTable
CREATE TABLE "post_consultation" (
    "consultation_id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "teacher_id" INTEGER,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "status" "consultationStatus" NOT NULL DEFAULT 'PENDING',
    "base_price" INTEGER NOT NULL DEFAULT 0,
    "is_private" BOOLEAN NOT NULL DEFAULT true,
    "completed_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "post_consultation_pkey" PRIMARY KEY ("consultation_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_consultation_post_id_key" ON "post_consultation"("post_id");

-- CreateIndex
CREATE INDEX "post_consultation_student_id_idx" ON "post_consultation"("student_id");

-- CreateIndex
CREATE INDEX "post_consultation_teacher_id_idx" ON "post_consultation"("teacher_id");

-- AddForeignKey
ALTER TABLE "post_consultation" ADD CONSTRAINT "post_consultation_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_consultation" ADD CONSTRAINT "post_consultation_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_consultation" ADD CONSTRAINT "post_consultation_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
