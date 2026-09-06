-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProjectModuleStatus" ADD VALUE 'DESIGN_WEB';
ALTER TYPE "ProjectModuleStatus" ADD VALUE 'DEVELOPMENT_WEB';
ALTER TYPE "ProjectModuleStatus" ADD VALUE 'IN_REVIEW_WEB';
ALTER TYPE "ProjectModuleStatus" ADD VALUE 'TESTING_WEB';
ALTER TYPE "ProjectModuleStatus" ADD VALUE 'DESIGN_APK';
ALTER TYPE "ProjectModuleStatus" ADD VALUE 'DEVELOPMENT_APK';
ALTER TYPE "ProjectModuleStatus" ADD VALUE 'IN_REVIEW_APK';
ALTER TYPE "ProjectModuleStatus" ADD VALUE 'TESTING_APK';
ALTER TYPE "ProjectModuleStatus" ADD VALUE 'DEVELOPMENT_BACKEND';
ALTER TYPE "ProjectModuleStatus" ADD VALUE 'IN_REVIEW_BACKEND';
ALTER TYPE "ProjectModuleStatus" ADD VALUE 'TESTING_BACKEND';
ALTER TYPE "ProjectModuleStatus" ADD VALUE 'RE_DESIGN';
