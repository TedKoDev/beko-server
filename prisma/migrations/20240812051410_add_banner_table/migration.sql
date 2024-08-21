/*
  Warnings:

  - You are about to drop the `adbanner` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AdBannerStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- DropTable
DROP TABLE "adbanner";

-- CreateTable
CREATE TABLE "AdBanner" (
    "id" SERIAL NOT NULL,
    "position" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "contract_period" INTEGER NOT NULL,
    "contract_date" TIMESTAMP(3) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "image_url" TEXT NOT NULL,
    "status" "AdBannerStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "AdBanner_pkey" PRIMARY KEY ("id")
);
