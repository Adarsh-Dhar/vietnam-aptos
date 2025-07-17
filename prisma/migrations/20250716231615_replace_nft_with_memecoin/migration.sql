/*
  Warnings:

  - You are about to drop the column `selectedNFTId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the `NFT` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MemecoinStatus" AS ENUM ('DEPLOYING', 'DEPLOYED', 'FAILED', 'TRADING', 'PAUSED');

-- DropForeignKey
ALTER TABLE "NFT" DROP CONSTRAINT "NFT_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_selectedNFTId_fkey";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "selectedNFTId",
ADD COLUMN     "selectedMemecoinId" TEXT;

-- DropTable
DROP TABLE "NFT";

-- DropEnum
DROP TYPE "NFTStatus";

-- CreateTable
CREATE TABLE "Memecoin" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "coinName" TEXT NOT NULL,
    "coinSymbol" TEXT NOT NULL,
    "coinDescription" TEXT,
    "totalSupply" TEXT NOT NULL,
    "initialPrice" DOUBLE PRECISION,
    "currentPrice" DOUBLE PRECISION,
    "marketCap" DOUBLE PRECISION,
    "volume24h" DOUBLE PRECISION,
    "holders" INTEGER NOT NULL DEFAULT 0,
    "mintTxHash" TEXT,
    "deployTxHash" TEXT,
    "coinAddress" TEXT,
    "status" "MemecoinStatus" NOT NULL DEFAULT 'DEPLOYING',
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "telegramUrl" TEXT,
    "twitterUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Memecoin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Memecoin_coinName_coinSymbol_key" ON "Memecoin"("coinName", "coinSymbol");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_selectedMemecoinId_fkey" FOREIGN KEY ("selectedMemecoinId") REFERENCES "Memecoin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memecoin" ADD CONSTRAINT "Memecoin_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
