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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "AdBanner_pkey" PRIMARY KEY ("id")
);
