-- CreateTable
CREATE TABLE "LevelThreshold" (
    "level" INTEGER NOT NULL,
    "min_posts" INTEGER NOT NULL,
    "min_comments" INTEGER NOT NULL,
    "min_likes" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "LevelThreshold_pkey" PRIMARY KEY ("level")
);
