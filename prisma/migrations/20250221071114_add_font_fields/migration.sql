-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "contentFont" TEXT NOT NULL DEFAULT 'default',
ADD COLUMN     "titleFont" TEXT NOT NULL DEFAULT 'default',
ALTER COLUMN "coverImageKey" DROP NOT NULL;
