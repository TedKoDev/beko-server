/*
  Warnings:

  - You are about to drop the column `base_price` on the `post_consultation` table. All the data in the column will be lost.
  - Added the required column `price` to the `post_consultation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "category" ADD COLUMN     "base_price" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "post_consultation" DROP COLUMN "base_price",
ADD COLUMN     "price" INTEGER NOT NULL;
