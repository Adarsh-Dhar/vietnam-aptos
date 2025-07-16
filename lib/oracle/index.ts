import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// Types for better type safety
export interface HolderCountResult {
  holderCount: number;
  totalTokens: number;
  uniqueHolders: string[];
  error?: string;
}

export interface NFTCollectionInfo {
  collectionAddress: string;
  collectionName?: string;
  description?: string;
}

export interface HoldingsCheckResult {
  success: boolean;
  holderCount: number;
  totalTokens: number;
  uniqueHolders: string[];
  error?: string;
  projectName?: string;
  collectionAddress?: string;
}

/**
 * Validate if a string is a proper hex address
 */
function isValidHexAddress(address: string): boolean {
  console.log('Validating address:', address);
  console.log('Address length:', address.length);
  console.log('Address type:', typeof address);
  console.log('Address starts with 0x:', address.startsWith('0x'));
  console.log('Regex test result:', /^0x[a-fA-F0-9]{64}$/.test(address));
  
  const result = /^0x[a-fA-F0-9]{64}$/.test(address);
  console.log('Validation result:', result);
  return result;
}

/**
 * Get the count of unique holders for an NFT collection on Aptos
 * This function uses the available Aptos SDK methods
 * @param collectionAddress - The collection address
 * @param network - The Aptos network to use (default: mainnet)
 * @returns Promise<HolderCountResult>
 */
export async function getHolderCount(
  collectionAddress: string,
  network: Network = Network.MAINNET
): Promise<HolderCountResult> {
  const aptosConfig = new AptosConfig({ network });
  const aptos = new Aptos(aptosConfig);
  
  const holderSet = new Set<string>();
  let totalTokens = 0;
  
  try {
    // Validate input address
    if (!collectionAddress || !isValidHexAddress(collectionAddress)) {
      throw new Error('Invalid collection address format. Expected 0x followed by 64 hex characters.');
    }

    // Get all tokens in the collection using the correct API
    // Note: This is a simplified approach - you may need to adjust based on your specific collection structure
    const tokens = await aptos.getAccountOwnedTokensFromCollectionAddress({
      accountAddress: collectionAddress,
      collectionAddress: collectionAddress,
      options: { limit: 1000 }
    });

    if (!tokens || tokens.length === 0) {
      return {
        holderCount: 0,
        totalTokens: 0,
        uniqueHolders: [],
        error: 'No tokens found in collection'
      };
    }

    // Process token owners
    tokens.forEach((token: any) => {
      totalTokens++;
      
      // Exclude burn address and contract itself
      if (token.owner_address && 
          token.owner_address !== "0x0000000000000000000000000000000000000000000000000000000000000000" &&
          token.owner_address !== collectionAddress) {
        holderSet.add(token.owner_address);
      }
    });

    return {
      holderCount: holderSet.size,
      totalTokens,
      uniqueHolders: Array.from(holderSet),
      error: undefined
    };

  } catch (error) {
    console.error("Error fetching holders:", error);
    return {
      holderCount: 0,
      totalTokens: 0,
      uniqueHolders: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Alternative method using account-based approach
 * This method gets tokens owned by a specific account from a collection
 */
export async function getHolderCountByAccount(
  accountAddress: string,
  collectionAddress: string,
  network: Network = Network.MAINNET
): Promise<HolderCountResult> {
  const aptosConfig = new AptosConfig({ network });
  const aptos = new Aptos(aptosConfig);
  
  try {
    // Validate addresses
    if (!isValidHexAddress(accountAddress)) {
      throw new Error('Invalid account address format');
    }
    if (!isValidHexAddress(collectionAddress)) {
      throw new Error('Invalid collection address format');
    }

    const tokens = await aptos.getAccountOwnedTokensFromCollectionAddress({
      accountAddress,
      collectionAddress,
      options: { limit: 1000 }
    });

    const holderSet = new Set<string>();
    let totalTokens = 0;

    tokens.forEach((token: any) => {
      totalTokens++;
      if (token.owner_address) {
        holderSet.add(token.owner_address);
      }
    });

    return {
      holderCount: holderSet.size,
      totalTokens,
      uniqueHolders: Array.from(holderSet),
      error: undefined
    };

  } catch (error) {
    console.error("Error fetching holders by account:", error);
    return {
      holderCount: 0,
      totalTokens: 0,
      uniqueHolders: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get detailed information about an NFT collection
 * @param creatorAddress - The creator address
 * @param collectionName - The collection name
 * @param network - The Aptos network to use (default: mainnet)
 * @returns Promise<NFTCollectionInfo>
 */
export async function getCollectionInfo(
  creatorAddress: string,
  collectionName: string,
  network: Network = Network.MAINNET
): Promise<NFTCollectionInfo> {
  const aptosConfig = new AptosConfig({ network });
  const aptos = new Aptos(aptosConfig);

  try {
    const collectionData = await aptos.getCollectionData({
      creatorAddress,
      collectionName
    });

    return {
      collectionAddress: creatorAddress,
      collectionName: collectionData.collection_name,
      description: collectionData.description,
    };
  } catch (error) {
    console.error("Error fetching collection info:", error);
    return {
      collectionAddress: creatorAddress,
      collectionName: undefined,
      description: undefined,
    };
  }
}

/**
 * Simple holder count function for hackathon use
 * This is a simplified version that works with the Aptos SDK
 * Note: This function requires you to know the account address that owns tokens from the collection
 */
export async function getSimpleHolderCount(
  accountAddress: string,
  collectionAddress: string,
  network: Network = Network.MAINNET
): Promise<number> {
  const aptosConfig = new AptosConfig({ network });
  const aptos = new Aptos(aptosConfig);
  
  try {
    // Validate addresses
    if (!isValidHexAddress(accountAddress)) {
      console.error("Invalid account address:", accountAddress);
      return 0;
    }
    if (!isValidHexAddress(collectionAddress)) {
      console.error("Invalid collection address:", collectionAddress);
      return 0;
    }

    // Get tokens owned by the account from the collection
    const tokens = await aptos.getAccountOwnedTokensFromCollectionAddress({
      accountAddress,
      collectionAddress,
      options: { limit: 1000 }
    });

    const holderSet = new Set<string>();
    
    tokens.forEach((token: any) => {
      if (token.owner_address && 
          token.owner_address !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
        holderSet.add(token.owner_address);
      }
    });

    return holderSet.size;
  } catch (error) {
    console.error("Error getting holder count:", error);
    return 0;
  }
}

/**
 * Get all tokens owned by an account
 * This is useful for getting a comprehensive view of an account's NFT holdings
 */
export async function getAccountTokens(
  accountAddress: string,
  network: Network = Network.MAINNET
): Promise<any[]> {
  const aptosConfig = new AptosConfig({ network });
  const aptos = new Aptos(aptosConfig);
  
  try {
    // Validate account address
    if (!isValidHexAddress(accountAddress)) {
      console.error("Invalid account address:", accountAddress);
      return [];
    }

    const tokens = await aptos.getAccountOwnedTokens({
      accountAddress,
      options: { limit: 1000 }
    });
    
    return tokens;
  } catch (error) {
    console.error("Error getting account tokens:", error);
    return [];
  }
}

/**
 * Check holdings for a specific project with real collection address
 * This function is designed to work with the project database
 */
export async function checkProjectHoldings(
  projectName: string,
  collectionAddress: string,
  network: Network = Network.DEVNET // Changed to DEVNET since NFTs are on devnet
): Promise<HoldingsCheckResult> {
  try {
    console.log('checkProjectHoldings called with:');
    console.log('- projectName:', projectName);
    console.log('- collectionAddress:', collectionAddress);
    console.log('- network:', network);
    
    // Validate collection address
    if (!collectionAddress || !isValidHexAddress(collectionAddress)) {
      console.log('Address validation failed');
      return {
        success: false,
        holderCount: 0,
        totalTokens: 0,
        uniqueHolders: [],
        error: 'Invalid collection address format. Expected 0x followed by 64 hex characters.',
        projectName,
        collectionAddress
      };
    }

    // Use a sample account address for demonstration
    // In production, you might want to use the project creator's address
    const sampleAccountAddress = "0x1234567890123456789012345678901234567890123456789012345678901234"; // Valid hex address
    
    console.log(`Checking holdings for project: ${projectName}`);
    console.log(`Collection address: ${collectionAddress}`);
    console.log(`Network: ${network}`);
    
    // Get holder count
    const holderCount = await getSimpleHolderCount(
      sampleAccountAddress,
      collectionAddress,
      network
    );
    
    // Get account tokens for additional info
    const accountTokens = await getAccountTokens(sampleAccountAddress, network);
    
    console.log(`Holder count for ${projectName}: ${holderCount}`);
    console.log(`Account tokens for ${projectName}:`, accountTokens.length);
    
    return {
      success: true,
      holderCount,
      totalTokens: accountTokens.length,
      uniqueHolders: [],
      error: undefined,
      projectName,
      collectionAddress
    };
    
  } catch (error) {
    console.error(`Error checking holdings for ${projectName}:`, error);
    return {
      success: false,
      holderCount: 0,
      totalTokens: 0,
      uniqueHolders: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      projectName,
      collectionAddress
    };
  }
}

// Example usage function for testing
export async function exampleUsage() {
  // Example addresses (replace with actual addresses)
  const exampleAccountAddress = "0x1234567890123456789012345678901234567890123456789012345678901234";
  const exampleCollectionAddress = "0x2345678901234567890123456789012345678901234567890123456789012345";
  
  console.log("Fetching holder count...");
  const result = await getSimpleHolderCount(exampleAccountAddress, exampleCollectionAddress);
  
  console.log("Holder count:", result);
  
  return result;
}
