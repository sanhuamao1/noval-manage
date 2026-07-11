-- 修改 PolishRule.type 默认值：polish -> base
ALTER TABLE "PolishRule" ADD COLUMN "type_new" TEXT NOT NULL DEFAULT 'base';
UPDATE "PolishRule" SET "type_new" = CASE WHEN "type" = 'polish' THEN 'base' ELSE "type" END;
ALTER TABLE "PolishRule" DROP COLUMN "type";
ALTER TABLE "PolishRule" RENAME COLUMN "type_new" TO "type";
