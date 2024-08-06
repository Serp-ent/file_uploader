/*
  Warnings:

  - Changed the type of `type` on the `File` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('FOLDER', 'FILE');

-- AlterTable
ALTER TABLE "File" DROP COLUMN "type",
ADD COLUMN     "type" "FileType" NOT NULL;

-- DropEnum
DROP TYPE "ItemType";
