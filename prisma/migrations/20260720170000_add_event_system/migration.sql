-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CharacterEmotion";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Foreshadowing";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "KeyEvent";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "EventNode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "novelId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT,
    "content" TEXT,
    "storyTime" TEXT,
    "eventType" TEXT,
    "status" TEXT NOT NULL DEFAULT '已规划',
    "importance" INTEGER NOT NULL DEFAULT 1,
    "characterIds" TEXT,
    "locationIds" TEXT,
    "foreshadowingIds" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EventNode_novelId_fkey" FOREIGN KEY ("novelId") REFERENCES "Novel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT '导致',
    "strength" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventConnection_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "EventNode" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventConnection_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "EventNode" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OutlineEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "outlineId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "OutlineEvent_outlineId_fkey" FOREIGN KEY ("outlineId") REFERENCES "Outline" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OutlineEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "EventNode" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Chapter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "novelId" TEXT NOT NULL,
    "outlineId" TEXT,
    "title" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "relatedCharacters" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Chapter_novelId_fkey" FOREIGN KEY ("novelId") REFERENCES "Novel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Chapter_outlineId_fkey" FOREIGN KEY ("outlineId") REFERENCES "Outline" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Chapter" ("content", "createdAt", "id", "novelId", "relatedCharacters", "sortOrder", "status", "title", "updatedAt") SELECT "content", "createdAt", "id", "novelId", "relatedCharacters", "sortOrder", "status", "title", "updatedAt" FROM "Chapter";
DROP TABLE "Chapter";
ALTER TABLE "new_Chapter" RENAME TO "Chapter";
CREATE INDEX "Chapter_novelId_idx" ON "Chapter"("novelId");
CREATE TABLE "new_Outline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "novelId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "contentBrief" TEXT,
    "contentDetail" TEXT,
    "status" TEXT NOT NULL DEFAULT '已规划',
    "timeline" TEXT,
    "tone" TEXT,
    "eventNodeIds" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Outline_novelId_fkey" FOREIGN KEY ("novelId") REFERENCES "Novel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Outline" ("contentBrief", "contentDetail", "createdAt", "id", "name", "novelId", "sortOrder", "status", "timeline", "tone", "updatedAt") SELECT "contentBrief", "contentDetail", "createdAt", "id", "name", "novelId", "sortOrder", "status", "timeline", "tone", "updatedAt" FROM "Outline";
DROP TABLE "Outline";
ALTER TABLE "new_Outline" RENAME TO "Outline";
CREATE INDEX "Outline_novelId_idx" ON "Outline"("novelId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "EventNode_novelId_idx" ON "EventNode"("novelId");

-- CreateIndex
CREATE INDEX "EventConnection_sourceId_idx" ON "EventConnection"("sourceId");

-- CreateIndex
CREATE INDEX "EventConnection_targetId_idx" ON "EventConnection"("targetId");

-- CreateIndex
CREATE UNIQUE INDEX "EventConnection_sourceId_targetId_key" ON "EventConnection"("sourceId", "targetId");

-- CreateIndex
CREATE INDEX "OutlineEvent_outlineId_idx" ON "OutlineEvent"("outlineId");

-- CreateIndex
CREATE INDEX "OutlineEvent_eventId_idx" ON "OutlineEvent"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "OutlineEvent_outlineId_eventId_key" ON "OutlineEvent"("outlineId", "eventId");

