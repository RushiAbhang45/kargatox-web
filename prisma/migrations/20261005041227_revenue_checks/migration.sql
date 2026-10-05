-- CreateTable
CREATE TABLE "RevenueCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leads" INTEGER NOT NULL,
    "sales" INTEGER NOT NULL,
    "retention" INTEGER NOT NULL,
    "weakest" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "email" TEXT,
    "city" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Enquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "service" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "ownerId" TEXT,
    "source" TEXT NOT NULL,
    "revenueCheckId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Enquiry_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Enquiry_revenueCheckId_fkey" FOREIGN KEY ("revenueCheckId") REFERENCES "RevenueCheck" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Enquiry" ("company", "createdAt", "details", "email", "id", "name", "ownerId", "phone", "revenueCheckId", "service", "source", "status") SELECT "company", "createdAt", "details", "email", "id", "name", "ownerId", "phone", "revenueCheckId", "service", "source", "status" FROM "Enquiry";
DROP TABLE "Enquiry";
ALTER TABLE "new_Enquiry" RENAME TO "Enquiry";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
