import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addCollectionAddresses() {
  try {
    console.log('Adding collection addresses to existing projects...')

    // Sample Aptos collection addresses for demonstration (proper hex format)
    const sampleCollections = [
      {
        name: "Aptos Monkeys",
        collectionAddress: "0x1234567890123456789012345678901234567890123456789012345678901234",
        tokenAddress: "0x2345678901234567890123456789012345678901234567890123456789012345"
      },
      {
        name: "Aptos Punks",
        collectionAddress: "0x3456789012345678901234567890123456789012345678901234567890123456", 
        tokenAddress: "0x4567890123456789012345678901234567890123456789012345678901234567"
      },
      {
        name: "Aptos Kitties",
        collectionAddress: "0x5678901234567890123456789012345678901234567890123456789012345678",
        tokenAddress: "0x6789012345678901234567890123456789012345678901234567890123456789"
      },
      {
        name: "Aptos Dragons",
        collectionAddress: "0x7890123456789012345678901234567890123456789012345678901234567890",
        tokenAddress: "0x8901234567890123456789012345678901234567890123456789012345678901"
      },
      {
        name: "Aptos Warriors",
        collectionAddress: "0x9012345678901234567890123456789012345678901234567890123456789012",
        tokenAddress: "0xa012345678901234567890123456789012345678901234567890123456789012"
      }
    ]

    // Get all projects that have selected NFTs
    const projects = await prisma.project.findMany({
      where: {
        selectedNFTId: {
          not: null
        }
      },
      include: {
        selectedNFT: true
      }
    })

    console.log(`Found ${projects.length} projects with selected NFTs`)

    for (let i = 0; i < projects.length; i++) {
      const project = projects[i]
      const sampleCollection = sampleCollections[i % sampleCollections.length]
      
      if (project.selectedNFT) {
        // Update the NFT with collection address
        await prisma.nFT.update({
          where: { id: project.selectedNFT.id },
          data: {
            collectionAddress: sampleCollection.collectionAddress,
            tokenAddress: sampleCollection.tokenAddress
          }
        })

        console.log(`Updated project "${project.name}" with collection address: ${sampleCollection.collectionAddress}`)
      }
    }

    // Also create some sample NFTs with collection addresses for projects that don't have them
    const projectsWithoutNFTs = await prisma.project.findMany({
      where: {
        selectedNFTId: null
      }
    })

    console.log(`Found ${projectsWithoutNFTs.length} projects without selected NFTs`)

    for (let i = 0; i < projectsWithoutNFTs.length; i++) {
      const project = projectsWithoutNFTs[i]
      const sampleCollection = sampleCollections[i % sampleCollections.length]
      
      try {
        // Create a sample NFT for this project with unique names
        const sampleNFT = await prisma.nFT.create({
          data: {
            creatorId: project.creatorId,
            collectionName: `${project.name} Collection ${Date.now()}`,
            collectionDescription: `NFT collection for ${project.name}`,
            collectionUri: `https://example.com/collections/${project.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
            collectionAddress: sampleCollection.collectionAddress,
            tokenName: `${project.name} Token ${Date.now()}`,
            tokenDescription: `Token for ${project.name}`,
            tokenUri: `https://example.com/tokens/${project.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
            tokenAddress: sampleCollection.tokenAddress,
            imageUrl: `https://via.placeholder.com/400x400/00F0FF/ffffff?text=${encodeURIComponent(project.name)}`,
            status: 'MINTED'
          }
        })

        // Update the project to use this NFT
        await prisma.project.update({
          where: { id: project.id },
          data: {
            selectedNFTId: sampleNFT.id
          }
        })

        console.log(`Created NFT for project "${project.name}" with collection address: ${sampleCollection.collectionAddress}`)
      } catch (error) {
        console.log(`Skipping project "${project.name}" - NFT already exists or error occurred`)
      }
    }

    console.log('Successfully added collection addresses to all projects!')
  } catch (error) {
    console.error('Error adding collection addresses:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
addCollectionAddresses()
  .then(() => {
    console.log('Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  }) 