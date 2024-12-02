-- AlterTable
ALTER TABLE "point" ADD COLUMN     "post_id" INTEGER;

-- AddForeignKey
ALTER TABLE "point" ADD CONSTRAINT "point_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("post_id") ON DELETE SET NULL ON UPDATE CASCADE;
