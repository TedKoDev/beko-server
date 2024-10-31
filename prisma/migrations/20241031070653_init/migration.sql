/*
  Warnings:

  - The values [FACEBOOK,TWITTER,LINKEDIN,GITHUB] on the enum `provider` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "provider_new" AS ENUM ('GOOGLE', 'NAVER', 'KAKAO');
ALTER TABLE "socialLogin" ALTER COLUMN "provider" TYPE "provider_new" USING ("provider"::text::"provider_new");
ALTER TYPE "provider" RENAME TO "provider_old";
ALTER TYPE "provider_new" RENAME TO "provider";
DROP TYPE "provider_old";
COMMIT;
