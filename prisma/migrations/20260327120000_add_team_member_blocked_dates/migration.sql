CREATE TABLE "TeamMemberBlockedDate" (
    "id" TEXT NOT NULL,
    "teamMemberId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "isAllDay" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMemberBlockedDate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TeamMemberBlockedDate_teamMemberId_date_idx" ON "TeamMemberBlockedDate"("teamMemberId", "date");

CREATE INDEX "TeamMemberBlockedDate_date_idx" ON "TeamMemberBlockedDate"("date");

ALTER TABLE "TeamMemberBlockedDate" ADD CONSTRAINT "TeamMemberBlockedDate_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
