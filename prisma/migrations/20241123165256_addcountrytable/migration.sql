-- AlterTable
ALTER TABLE "users" ADD COLUMN     "country_id" INTEGER;

-- CreateTable
CREATE TABLE "country" (
    "country_id" SERIAL NOT NULL,
    "country_code" VARCHAR(2) NOT NULL,
    "country_name" VARCHAR(100) NOT NULL,
    "flag_icon" VARCHAR(255) NOT NULL,
    "user_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "country_pkey" PRIMARY KEY ("country_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "country_country_code_key" ON "country"("country_code");

-- CreateIndex
CREATE INDEX "country_country_code_idx" ON "country"("country_code");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country"("country_id") ON DELETE SET NULL ON UPDATE CASCADE;
