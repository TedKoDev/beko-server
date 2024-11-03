-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('TODAY_TASK_PARTICIPATION');

-- CreateTable
CREATE TABLE "log" (
    "log_id" SERIAL NOT NULL,
    "type" "LogType" NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "log_pkey" PRIMARY KEY ("log_id")
);

-- CreateIndex
CREATE INDEX "log_type_idx" ON "log"("type");

-- CreateIndex
CREATE INDEX "log_created_at_idx" ON "log"("created_at");
