-- AlterTable
ALTER TABLE "candidates" ADD COLUMN "resume_url" TEXT;

-- AlterTable
ALTER TABLE "references" ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false;
