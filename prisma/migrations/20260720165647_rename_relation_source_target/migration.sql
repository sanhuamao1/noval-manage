/*
  Warnings:

  - You are about to drop the column `source` on the `Relation` table. All the data in the column will be lost.
  - You are about to drop the column `target` on the `Relation` table. All the data in the column will be lost.
  - Added the required column `sourceId` to the `Relation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetId` to the `Relation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Relation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "novelId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Relation_novelId_fkey" FOREIGN KEY ("novelId") REFERENCES "Novel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Relation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Character" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Relation_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "Character" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Relation" ("id", "novelId", "sourceId", "targetId", "description", "createdAt")
SELECT "id", "novelId", "source", "target", "description", "createdAt" FROM "Relation";
DROP TABLE "Relation";
ALTER TABLE "new_Relation" RENAME TO "Relation";
CREATE INDEX "Relation_novelId_idx" ON "Relation"("novelId");
CREATE INDEX "Relation_sourceId_idx" ON "Relation"("sourceId");
CREATE INDEX "Relation_targetId_idx" ON "Relation"("targetId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
