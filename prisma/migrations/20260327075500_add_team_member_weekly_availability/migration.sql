-- CreateTable
CREATE TABLE "TeamMemberAvailability" (
    "id" TEXT NOT NULL,
    "teamMemberId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMemberAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamMemberAvailability_teamMemberId_dayOfWeek_key" ON "TeamMemberAvailability"("teamMemberId", "dayOfWeek");
CREATE INDEX "TeamMemberAvailability_dayOfWeek_idx" ON "TeamMemberAvailability"("dayOfWeek");

-- AddForeignKey
ALTER TABLE "TeamMemberAvailability" ADD CONSTRAINT "TeamMemberAvailability_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
