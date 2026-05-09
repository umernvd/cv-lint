-- CreateEnum
CREATE TYPE "KeywordStatus" AS ENUM ('MATCHED', 'MISSING');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobTitle" TEXT,
    "companyName" TEXT,
    "atsScore" INTEGER NOT NULL,
    "cvText" TEXT NOT NULL,
    "jdText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keyword_results" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "status" "KeywordStatus" NOT NULL,
    "category" TEXT,

    CONSTRAINT "keyword_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bullet_edits" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "suggestedText" TEXT,
    "acceptedText" TEXT,
    "wasAccepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bullet_edits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "scans_userId_idx" ON "scans"("userId");

-- CreateIndex
CREATE INDEX "keyword_results_scanId_idx" ON "keyword_results"("scanId");

-- CreateIndex
CREATE INDEX "bullet_edits_scanId_idx" ON "bullet_edits"("scanId");

-- AddForeignKey
ALTER TABLE "scans" ADD CONSTRAINT "scans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keyword_results" ADD CONSTRAINT "keyword_results_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "scans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bullet_edits" ADD CONSTRAINT "bullet_edits_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "scans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
