-- CreateEnum
CREATE TYPE "RankChange" AS ENUM ('UP', 'DOWN', 'NEW', 'SAME');

-- CreateTable
CREATE TABLE "PopularSearchRank" (
    "id" SERIAL NOT NULL,
    "keyword" VARCHAR(255) NOT NULL,
    "current_rank" INTEGER NOT NULL,
    "previous_rank" INTEGER,
    "rank_change" "RankChange" NOT NULL,
    "rank_difference" INTEGER,
    "check_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "PopularSearchRank_pkey" PRIMARY KEY ("id")
);
