-- AlterTable: PolishRule 添加 useCount 字段
ALTER TABLE "PolishRule" ADD COLUMN "useCount" INTEGER NOT NULL DEFAULT 0;
