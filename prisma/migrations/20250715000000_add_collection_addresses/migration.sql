-- Add collection address fields to NFT table
ALTER TABLE "NFT" ADD COLUMN "collectionAddress" TEXT;
ALTER TABLE "NFT" ADD COLUMN "tokenAddress" TEXT;

-- Add index for collection address lookups
CREATE INDEX "NFT_collectionAddress_idx" ON "NFT"("collectionAddress"); 