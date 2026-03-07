-- CreateEnum
CREATE TYPE "ExternalJobStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REMOVED');

-- CreateTable
CREATE TABLE "external_jobs" (
    "id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "source_name" TEXT NOT NULL,
    "source_url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "company_logo" TEXT,
    "description" TEXT NOT NULL,
    "vertical" "Vertical",
    "job_type" TEXT,
    "availability" "Availability",
    "location" TEXT,
    "salary" TEXT,
    "salary_min" INTEGER,
    "salary_max" INTEGER,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "category" TEXT,
    "status" "ExternalJobStatus" NOT NULL DEFAULT 'ACTIVE',
    "published_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "external_jobs_source_name_source_id_key" ON "external_jobs"("source_name", "source_id");

-- CreateIndex
CREATE INDEX "external_jobs_status_vertical_idx" ON "external_jobs"("status", "vertical");

-- CreateIndex
CREATE INDEX "external_jobs_status_published_at_idx" ON "external_jobs"("status", "published_at");
