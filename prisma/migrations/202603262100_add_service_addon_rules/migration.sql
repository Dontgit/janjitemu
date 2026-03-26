CREATE TABLE "ServiceAddonRule" (
  "serviceId" TEXT NOT NULL,
  "addOnServiceId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ServiceAddonRule_pkey" PRIMARY KEY ("serviceId","addOnServiceId")
);

CREATE INDEX "ServiceAddonRule_addOnServiceId_idx" ON "ServiceAddonRule"("addOnServiceId");

ALTER TABLE "ServiceAddonRule"
ADD CONSTRAINT "ServiceAddonRule_serviceId_fkey"
FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ServiceAddonRule"
ADD CONSTRAINT "ServiceAddonRule_addOnServiceId_fkey"
FOREIGN KEY ("addOnServiceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
