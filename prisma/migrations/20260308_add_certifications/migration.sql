-- CreateTable
CREATE TABLE "certifications" (
    "id" SERIAL NOT NULL,
    "candidate_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "issuing_body" TEXT NOT NULL,
    "issued_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "credential_url" TEXT,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
