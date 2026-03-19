-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DEPT_USER', 'GM');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('ROOMS', 'FNB', 'EVENTS', 'SPA', 'BACK_OF_HOUSE', 'GENERAL');

-- CreateEnum
CREATE TYPE "AssetCategory" AS ENUM ('FURNITURE', 'LINEN', 'ELECTRONICS', 'KITCHEN', 'FIXTURES', 'OTHER');

-- CreateEnum
CREATE TYPE "AssetCondition" AS ENUM ('A', 'B', 'C', 'D');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('DRAFT', 'PENDING_DEPT_APPROVAL', 'PENDING_GM_APPROVAL', 'APPROVED', 'REJECTED', 'LISTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "OutcomeType" AS ENUM ('SOLD', 'DONATED', 'RECYCLED', 'WRITTEN_OFF');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('SUBMITTED', 'APPROVED_DEPT', 'APPROVED_GM', 'REJECTED', 'LISTED', 'COMPLETED', 'COMMENT_ADDED');

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "groupName" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/London',
    "country" TEXT NOT NULL DEFAULT 'UK',
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "department" "Department" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetBatch" (
    "id" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "department" "Department" NOT NULL,
    "category" "AssetCategory" NOT NULL,
    "assetType" TEXT NOT NULL,
    "typeCustom" TEXT,
    "quantity" INTEGER NOT NULL,
    "condition" "AssetCondition" NOT NULL,
    "yearOfPurchase" INTEGER,
    "brand" TEXT,
    "originalPurchaseValue" DECIMAL(10,2),
    "estimatedRecoveryValue" DECIMAL(10,2),
    "actualRecoveryValue" DECIMAL(10,2),
    "locationWithinProperty" TEXT,
    "notes" TEXT,
    "status" "BatchStatus" NOT NULL DEFAULT 'DRAFT',
    "outcomeType" "OutcomeType",
    "co2Kg" DECIMAL(8,2),
    "weightKg" DECIMAL(8,2),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AssetBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "assetNumber" INTEGER NOT NULL,
    "referenceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetPhoto" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyEvent" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL,
    "performedById" TEXT,
    "previousStatus" "BatchStatus",
    "newStatus" "BatchStatus",
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JourneyEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AssetBatch_referenceId_key" ON "AssetBatch"("referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_referenceId_key" ON "Asset"("referenceId");

-- CreateIndex
CREATE INDEX "JourneyEvent_batchId_idx" ON "JourneyEvent"("batchId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetBatch" ADD CONSTRAINT "AssetBatch_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetBatch" ADD CONSTRAINT "AssetBatch_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "AssetBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetPhoto" ADD CONSTRAINT "AssetPhoto_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "AssetBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyEvent" ADD CONSTRAINT "JourneyEvent_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "AssetBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyEvent" ADD CONSTRAINT "JourneyEvent_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
