/*
  Warnings:

  - You are about to drop the `LevelThreshold` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "LevelThreshold";

-- CreateTable
CREATE TABLE "levelthreshold" (
    "level" INTEGER NOT NULL,
    "min_posts" INTEGER NOT NULL,
    "min_comments" INTEGER NOT NULL,
    "min_likes" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "levelthreshold_pkey" PRIMARY KEY ("level")
);
