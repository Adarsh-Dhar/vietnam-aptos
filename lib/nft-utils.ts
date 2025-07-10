import { NFTStorage } from 'nft.storage'

export interface NFTMetadata {
  name: string
  description?: string
  image: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
  properties?: {
    files?: Array<{
      type: string
      uri: string
    }>
    category?: string
  }
}

export interface MintingResult {
  success: boolean
  transactionHash?: string
  metadataUri?: string
  error?: string
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload JPG, PNG, GIF, or WebP.' }
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File too large. Maximum size is 5MB.' }
  }

  return { valid: true }
}

/**
 * Upload image to IPFS
 */
export async function uploadImageToIPFS(
  file: File, 
  apiKey: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const nftstorage = new NFTStorage({ token: apiKey })
    const imageCID = await nftstorage.storeBlob(file)
    const imageUrl = `https://ipfs.io/ipfs/${imageCID}`
    
    return { success: true, url: imageUrl }
  } catch (error) {
    console.error('IPFS upload error:', error)
    return { 
      success: false, 
      error: 'Failed to upload image to IPFS' 
    }
  }
}

/**
 * Create and upload metadata to IPFS
 */
export async function uploadMetadataToIPFS(
  metadata: NFTMetadata,
  apiKey: string
): Promise<{ success: boolean; uri?: string; error?: string }> {
  try {
    const nftstorage = new NFTStorage({ token: apiKey })
    
    const metadataBlob = new Blob([JSON.stringify(metadata)], { 
      type: 'application/json' 
    })
    const metadataFile = new File([metadataBlob], 'metadata.json')
    const metadataCID = await nftstorage.storeBlob(metadataFile)
    
    const metadataUri = `https://ipfs.io/ipfs/${metadataCID}`
    
    return { success: true, uri: metadataUri }
  } catch (error) {
    console.error('Metadata upload error:', error)
    return { 
      success: false, 
      error: 'Failed to upload metadata to IPFS' 
    }
  }
}

/**
 * Create NFT metadata object
 */
export function createNFTMetadata(
  name: string,
  description: string,
  imageUrl: string,
  attributes: Array<{ trait_type: string; value: string | number }> = []
): NFTMetadata {
  return {
    name,
    description,
    image: imageUrl,
    attributes,
    properties: {
      files: [
        {
          type: 'image/jpeg', // This will be overridden by actual file type
          uri: imageUrl
        }
      ],
      category: 'image'
    }
  }
}

/**
 * Verify metadata URI
 */
export async function verifyMetadata(metadataUri: string): Promise<{
  valid: boolean
  metadata?: NFTMetadata
  error?: string
}> {
  try {
    const response = await fetch(metadataUri)
    if (!response.ok) {
      return { valid: false, error: 'Failed to fetch metadata' }
    }

    const metadata = await response.json()
    
    // Basic validation
    if (!metadata.name || !metadata.image) {
      return { valid: false, error: 'Invalid metadata structure' }
    }

    return { valid: true, metadata }
  } catch (error) {
    return { valid: false, error: 'Failed to verify metadata' }
  }
}

/**
 * Format transaction hash for display
 */
export function formatTransactionHash(hash: string): string {
  if (hash.length <= 10) return hash
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}

/**
 * Get Aptos Explorer URL for transaction
 */
export function getExplorerUrl(transactionHash: string, network: 'devnet' | 'mainnet' = 'devnet'): string {
  const baseUrl = network === 'mainnet' 
    ? 'https://explorer.aptoslabs.com' 
    : 'https://explorer.aptoslabs.com/account'
  
  return `${baseUrl}/txn/${transactionHash}`
}

/**
 * Validate NFT name
 */
export function validateNFTName(name: string): { valid: boolean; error?: string } {
  if (!name.trim()) {
    return { valid: false, error: 'NFT name is required' }
  }

  if (name.length > 100) {
    return { valid: false, error: 'NFT name is too long (max 100 characters)' }
  }

  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*]/
  if (invalidChars.test(name)) {
    return { valid: false, error: 'NFT name contains invalid characters' }
  }

  return { valid: true }
}

/**
 * Get file extension from MIME type
 */
export function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp'
  }
  
  return extensions[mimeType] || 'jpg'
}

/**
 * Calculate file size in MB
 */
export function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(2)} MB`
} 