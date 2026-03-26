-- AlterTable
ALTER TABLE "User"
ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "AuthRateLimit" (
  "id" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "identifier" TEXT NOT NULL,
  "hits" INTEGER NOT NULL DEFAULT 0,
  "windowStart" TIMESTAMP(3) NOT NULL,
  "blockedUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AuthRateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthRateLimit_scope_identifier_key" ON "AuthRateLimit"("scope", "identifier");

-- CreateIndex
CREATE INDEX "AuthRateLimit_scope_blockedUntil_idx" ON "AuthRateLimit"("scope", "blockedUntil");
