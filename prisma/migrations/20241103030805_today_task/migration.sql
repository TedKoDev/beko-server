-- AlterEnum
ALTER TYPE "role" ADD VALUE 'TEACHER';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "today_task_count" INTEGER NOT NULL DEFAULT 0;
