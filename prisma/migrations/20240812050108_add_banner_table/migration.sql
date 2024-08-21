/*
  Warnings:

  - You are about to drop the `AdBanner` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "AdBanner";

-- CreateTable
CREATE TABLE "adbanner" (
    "id" SERIAL NOT NULL,
    "position" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "contract_period" INTEGER NOT NULL,
    "contract_date" TIMESTAMP(3) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "image_url" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "adbanner_pkey" PRIMARY KEY ("id")
);
