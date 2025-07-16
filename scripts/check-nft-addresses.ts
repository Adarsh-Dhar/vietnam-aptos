import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkNFTAddresses() {
  try {
    console.log('Checking NFT addresses in database...')

    const nfts = await prisma.nFT.findMany({
      include: {
        projects: true
      }
    })

    console.log(`Found ${nfts.length} NFTs in database:`)
    
    nfts.forEach((nft, index) => {
      console.log(`${index + 1}. Project: ${nft.projects?.[0]?.name || 'Unknown'}`)
      console.log(`   Collection Address: ${nft.collectionAddress}`)
      console.log(`   Token Address: ${nft.tokenAddress}`)
      console.log(`   Address length: ${nft.collectionAddress?.length || 0}`)
      console.log(`   Is valid hex: ${/^0x[a-fA-F0-9]{64}$/.test(nft.collectionAddress || '')}`)
      console.log('---')
    })

    // Check for any addresses with module path format
    const modulePathNFTs = nfts.filter(nft => 
      nft.collectionAddress && nft.collectionAddress.includes('::')
    )

    if (modulePathNFTs.length > 0) {
      console.log(`\nFound ${modulePathNFTs.length} NFTs with module path format:`)
      modulePathNFTs.forEach(nft => {
        console.log(`- Project: ${nft.projects?.[0]?.name || 'Unknown'}`)
        console.log(`  Collection Address: ${nft.collectionAddress}`)
      })
    } else {
      console.log('\nAll NFTs have proper hex addresses.')
    }

  } catch (error) {
    console.error('Error checking NFT addresses:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
checkNFTAddresses()
  .then(() => {
    console.log('Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  }) 