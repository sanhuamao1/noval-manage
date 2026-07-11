-- Migration: Character config refactor
-- - Merge gender/age/identity columns into config JSON field
-- - Rename traits → config
--
-- Data migration: preserves existing traits JSON and merges gender/age/identity
-- into the top level of the config JSON object.

-- Step 1: Add config column to existing table for data migration
ALTER TABLE "Character" ADD COLUMN "config" TEXT DEFAULT '{}';

-- Step 2: Merge existing data: traits JSON + gender/age/identity → config
-- Using json_set which is available in SQLite 3.9.0+ (JSON1 extension)
UPDATE "Character" SET "config" = 
  CASE
    WHEN "traits" IS NOT NULL AND "traits" != '' 
    THEN COALESCE(
      json_set("traits",
        '$.gender', CASE WHEN "gender" IS NULL THEN NULL ELSE json_quote("gender") END,
        '$.age', CASE WHEN "age" IS NULL THEN NULL ELSE json_quote("age") END,
        '$.identity', CASE WHEN "identity" IS NULL THEN NULL ELSE json_quote("identity") END
      ),
      json_object(
        'gender', "gender",
        'age', "age",
        'identity', "identity"
      )
    )
    ELSE json_object(
      'gender', "gender",
      'age', "age",
      'identity', "identity"
    )
  END
WHERE 1=1;

-- Step 3: Redefine Character table (remove old columns, keep config)
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Character" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "novelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "config" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Character_novelId_fkey" FOREIGN KEY ("novelId") REFERENCES "Novel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Character" ("id", "novelId", "name", "config", "createdAt", "updatedAt")
SELECT "id", "novelId", "name", COALESCE("config", '{}'), "createdAt", "updatedAt" FROM "Character";

DROP TABLE "Character";
ALTER TABLE "new_Character" RENAME TO "Character";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
