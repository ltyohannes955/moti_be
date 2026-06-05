-- CreateEnum
CREATE TYPE "BlogPostType" AS ENUM ('BLOG', 'NEWS');

-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN "type" "BlogPostType" NOT NULL DEFAULT 'BLOG';
