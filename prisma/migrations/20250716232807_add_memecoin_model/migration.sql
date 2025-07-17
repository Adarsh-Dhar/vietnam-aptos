-- CreateEnum
CREATE TYPE "NFTStatus" AS ENUM ('MINTING', 'MINTED', 'FAILED', 'TRANSFERRED');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "selectedNFTId" TEXT;

-- CreateTable
CREATE TABLE "NFT" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "collectionName" TEXT NOT NULL,
    "collectionDescription" TEXT NOT NULL,
    "collectionUri" TEXT NOT NULL,
    "tokenName" TEXT NOT NULL,
    "tokenDescription" TEXT,
    "tokenUri" TEXT NOT NULL,
    "imageUrl" TEXT,
    "collectionTxHash" TEXT,
    "mintTxHash" TEXT,
    "aptosTokenId" TEXT,
    "aptosCollectionId" TEXT,
    "status" "NFTStatus" NOT NULL DEFAULT 'MINTING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "collectionAddress" TEXT,
    "tokenAddress" TEXT,

    CONSTRAINT "NFT_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NFT_collectionName_tokenName_key" ON "NFT"("collectionName", "tokenName");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_selectedNFTId_fkey" FOREIGN KEY ("selectedNFTId") REFERENCES "NFT"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NFT" ADD CONSTRAINT "NFT_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
