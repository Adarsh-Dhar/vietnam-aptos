/*
  Warnings:

  - You are about to drop the column `selectedNFTId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the `NFT` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "NFT" DROP CONSTRAINT "NFT_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_selectedNFTId_fkey";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "selectedNFTId";

-- DropTable
DROP TABLE "NFT";

-- DropEnum
DROP TYPE "NFTStatus";
