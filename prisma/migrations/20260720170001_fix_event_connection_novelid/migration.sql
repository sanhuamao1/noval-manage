-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EventConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "novelId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT '导致',
    "strength" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventConnection_novelId_fkey" FOREIGN KEY ("novelId") REFERENCES "Novel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventConnection_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "EventNode" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventConnection_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "EventNode" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EventConnection" ("createdAt", "id", "sourceId", "strength", "targetId", "type") SELECT "createdAt", "id", "sourceId", "strength", "targetId", "type" FROM "EventConnection";
DROP TABLE "EventConnection";
ALTER TABLE "new_EventConnection" RENAME TO "EventConnection";
CREATE INDEX "EventConnection_novelId_idx" ON "EventConnection"("novelId");
CREATE INDEX "EventConnection_sourceId_idx" ON "EventConnection"("sourceId");
CREATE INDEX "EventConnection_targetId_idx" ON "EventConnection"("targetId");
CREATE UNIQUE INDEX "EventConnection_sourceId_targetId_key" ON "EventConnection"("sourceId", "targetId");
CREATE TABLE "new_OutlineEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "novelId" TEXT NOT NULL,
    "outlineId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "OutlineEvent_novelId_fkey" FOREIGN KEY ("novelId") REFERENCES "Novel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OutlineEvent_outlineId_fkey" FOREIGN KEY ("outlineId") REFERENCES "Outline" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OutlineEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "EventNode" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_OutlineEvent" ("eventId", "id", "outlineId", "sortOrder") SELECT "eventId", "id", "outlineId", "sortOrder" FROM "OutlineEvent";
DROP TABLE "OutlineEvent";
ALTER TABLE "new_OutlineEvent" RENAME TO "OutlineEvent";
CREATE INDEX "OutlineEvent_novelId_idx" ON "OutlineEvent"("novelId");
CREATE INDEX "OutlineEvent_outlineId_idx" ON "OutlineEvent"("outlineId");
CREATE INDEX "OutlineEvent_eventId_idx" ON "OutlineEvent"("eventId");
CREATE UNIQUE INDEX "OutlineEvent_outlineId_eventId_key" ON "OutlineEvent"("outlineId", "eventId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

