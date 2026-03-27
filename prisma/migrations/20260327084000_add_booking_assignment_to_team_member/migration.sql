-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "assignedTeamMemberId" TEXT;

-- CreateIndex
CREATE INDEX "Booking_assignedTeamMemberId_idx" ON "Booking"("assignedTeamMemberId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_assignedTeamMemberId_fkey" FOREIGN KEY ("assignedTeamMemberId") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
