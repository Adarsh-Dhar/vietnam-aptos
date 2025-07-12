-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "selectedNFTId" TEXT;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_selectedNFTId_fkey" FOREIGN KEY ("selectedNFTId") REFERENCES "NFT"("id") ON DELETE SET NULL ON UPDATE CASCADE;
