-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('NONE', 'NEEDS_FOLLOW_UP', 'CONTACTED', 'OFFER_SENT', 'WON', 'LOST');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "addOnDurationSnapshot" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "addOnNamesSnapshot" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "addOnPriceSnapshot" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "addOnSummary" JSONB,
ADD COLUMN     "followUpNextActionAt" TIMESTAMP(3),
ADD COLUMN     "followUpNote" TEXT,
ADD COLUMN     "followUpStatus" "FollowUpStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "totalDurationSnapshot" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalPriceSnapshot" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "bookingSlotInterval" INTEGER NOT NULL DEFAULT 15;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "isAddon" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Booking_businessId_followUpStatus_idx" ON "Booking"("businessId", "followUpStatus");

-- CreateIndex
CREATE INDEX "Service_businessId_isAddon_idx" ON "Service"("businessId", "isAddon");
