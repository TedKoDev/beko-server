-- AlterTable
ALTER TABLE "levelthreshold" ADD COLUMN     "min_logins" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "login_count" INTEGER NOT NULL DEFAULT 0;
