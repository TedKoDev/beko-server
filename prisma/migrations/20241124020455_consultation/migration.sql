-- CreateEnum
CREATE TYPE "consultationStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "consultation" (
    "consultation_id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "teacher_id" INTEGER,
    "category_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "status" "consultationStatus" NOT NULL DEFAULT 'PENDING',
    "base_price" INTEGER NOT NULL DEFAULT 0,
    "is_private" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "completed_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "consultation_pkey" PRIMARY KEY ("consultation_id")
);

-- CreateTable
CREATE TABLE "consultationMessage" (
    "message_id" SERIAL NOT NULL,
    "consultation_id" INTEGER NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "consultationMessage_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "consultationFile" (
    "file_id" SERIAL NOT NULL,
    "consultation_id" INTEGER NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultationFile_pkey" PRIMARY KEY ("file_id")
);

-- AddForeignKey
ALTER TABLE "consultation" ADD CONSTRAINT "consultation_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation" ADD CONSTRAINT "consultation_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation" ADD CONSTRAINT "consultation_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultationMessage" ADD CONSTRAINT "consultationMessage_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultation"("consultation_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultationMessage" ADD CONSTRAINT "consultationMessage_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultationFile" ADD CONSTRAINT "consultationFile_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultation"("consultation_id") ON DELETE RESTRICT ON UPDATE CASCADE;
