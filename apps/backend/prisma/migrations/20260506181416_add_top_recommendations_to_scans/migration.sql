-- AlterTable
ALTER TABLE "scans" ADD COLUMN     "topRecommendations" TEXT[] DEFAULT ARRAY[]::TEXT[];
