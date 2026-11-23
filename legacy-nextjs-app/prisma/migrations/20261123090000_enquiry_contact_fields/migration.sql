-- Contact form additions (client change list 2026-11-02). All nullable / defaulted, so
-- existing rows and the previous app code keep working until this is deployed.
ALTER TABLE "Enquiry" ADD COLUMN "linkedinUrl" TEXT;
ALTER TABLE "Enquiry" ADD COLUMN "website" TEXT;
ALTER TABLE "Enquiry" ADD COLUMN "wantsMeeting" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Enquiry" ADD COLUMN "siteAuditStatus" TEXT;
ALTER TABLE "Enquiry" ADD COLUMN "siteAudit" JSONB;
ALTER TABLE "Enquiry" ADD COLUMN "siteAuditAt" TIMESTAMP(3);
