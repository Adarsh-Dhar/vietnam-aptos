// Transaction examples for nft_validation::main
// Dummy addresses and values for demonstration

import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const MODULES = {
  bet_types: "0x3badada8a3331daea64d8b3b108dd609bda222f6cf4bb77463a31eed7cff517b::bet_types",
  project: "0x3badada8a3331daea64d8b3b108dd609bda222f6cf4bb77463a31eed7cff517b::project",
  betting: "0x3badada8a3331daea64d8b3b108dd609bda222f6cf4bb77463a31eed7cff517b::betting",
  security: "0x3badada8a3331daea64d8b3b108dd609bda222f6cf4bb77463a31eed7cff517b::security",
  main: "0x3badada8a3331daea64d8b3b108dd609bda222f6cf4bb77463a31eed7cff517b::main",
  nft_validator: "0x3badada8a3331daea64d8b3b108dd609bda222f6cf4bb77463a31eed7cff517b::nft_validator",
  oracle: "0x3badada8a3331daea64d8b3b108dd609bda222f6cf4bb77463a31eed7cff517b::oracle",
};

const MODULE = MODULES.main;
const ADMIN = "0x1";
const ORACLE = "0x2";
const CREATOR = "0x3";
const BETTOR = "0x4";
const CLAIMER = "0x5";
const PROJECT_ID = 1;
const TARGET_HOLDERS = 1000;
const DEADLINE = Math.floor(Date.now() / 1000) + 86400 * 10;
const NFT_CONTRACT = "0x6";
const METADATA_URI = new TextEncoder().encode("https://example.com/metadata.json");
const AMOUNT = 1000000;
const BET_TYPE = 1; // 1 = support, 2 = doubt
const FINAL_HOLDERS = 1200;
const NEW_ORACLE = "0x7";
const LISTING_FEE = 1000000;
const PLATFORM_FEE_BPS = 100;
const WITHDRAW_AMOUNT = 500000;
const ORACLE_ADDRESS = "0x3badada8a3331daea64d8b3b108dd609bda222f6cf4bb77463a31eed7cff517b";

// Helper to get the connected wallet
function getAptosWallet() {
  if (typeof window !== "undefined" && "aptos" in window) {
    return (window as any).aptos;
  }
  throw new Error("Aptos wallet not found");
}

// Use the new SDK for client operations
const config = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(config);

// --- Contract Functions ---

// 1. Initialize Platform
// No params. Uses MODULES.oracle as the oracle address.
export async function initializePlatform() {
  const wallet = getAptosWallet();
  const payload = {
    type: "entry_function_payload",
    function: `${MODULES.main}::initialize`,
    type_arguments: [],
    arguments: [ORACLE_ADDRESS],
  };
  const response = await wallet.signAndSubmitTransaction({ payload });
  await aptos.waitForTransaction({ transactionHash: response.hash });
  return response.hash;
}

// 2. Create Project
export async function createProject({ targetHolders, deadline, nftContract = "0x6", metadataUri, onResult, max_gas_amount = 50000, gas_unit_price = 100 }: { targetHolders: number, deadline: number, nftContract?: string, metadataUri: number[] | Uint8Array, onResult?: (hash: string) => void, max_gas_amount?: number, gas_unit_price?: number }) {
  try {
    const wallet = getAptosWallet();
    console.log("wallet", wallet);
    
    console.log("Creating project on blockchain...");
    console.log("Parameters:", { targetHolders, deadline, nftContract, metadataUri });
    
    const payload = {
      type: "entry_function_payload",
      function: `${MODULES.main}::create_project`,
      type_arguments: [],
      arguments: [targetHolders, deadline, nftContract, metadataUri],
    };
    console.log("payload", payload);
    
    // Pass gas params as top-level fields for wallet compatibility
    const response = await wallet.signAndSubmitTransaction({
      payload,
      max_gas_amount: max_gas_amount.toString(),
      max_gas_units: max_gas_amount.toString(), // Added for compatibility
      gas_unit_price: gas_unit_price.toString(),
    });
    console.log("response", response);
    await aptos.waitForTransaction({ transactionHash: response.hash });
    if (onResult) onResult(response.hash);
    return response.hash;
  } catch (error) {
    console.error("Error in createProject:", error);
    throw error;
  }
}

// 3. Place Bet
export async function placeBet({ projectId, amount, betType, onResult }: { projectId: number, amount: number, betType: number, onResult?: (hash: string) => void }) {
  const wallet = getAptosWallet();
  const payload = {
    type: "entry_function_payload",
    function: `${MODULES.main}::place_bet`,
    type_arguments: [],
    arguments: [projectId, amount, betType],
  };
  const response = await wallet.signAndSubmitTransaction({ payload });
  await aptos.waitForTransaction({ transactionHash: response.hash });
  if (onResult) onResult(response.hash);
  return response.hash;
}

// 4. Resolve Project
export async function resolveProject({ projectId, finalHolders, onResult }: { projectId: number, finalHolders: number, onResult?: (hash: string) => void }) {
  const wallet = getAptosWallet();
  const payload = {
    type: "entry_function_payload",
    function: `${MODULES.main}::resolve_project`,
    type_arguments: [],
    arguments: [projectId, finalHolders],
  };
  const response = await wallet.signAndSubmitTransaction({ payload });
  await aptos.waitForTransaction({ transactionHash: response.hash });
  if (onResult) onResult(response.hash);
  return response.hash;
}

// 5. Claim Payout
export async function claimPayout({ claimerAddress, projectId, onResult }: { claimerAddress: string, projectId: number, onResult?: (hash: string) => void }) {
  const wallet = getAptosWallet();
  const payload = {
    type: "entry_function_payload",
    function: `${MODULES.main}::claim_payout`,
    type_arguments: [],
    arguments: [claimerAddress, projectId],
  };
  const response = await wallet.signAndSubmitTransaction({ payload });
  await aptos.waitForTransaction({ transactionHash: response.hash });
  if (onResult) onResult(response.hash);
  return response.hash;
}

// 6. Update Oracle
export async function updateOracle({ newOracle, onResult }: { newOracle: string, onResult?: (hash: string) => void }) {
  const wallet = getAptosWallet();
  const payload = {
    type: "entry_function_payload",
    function: `${MODULES.main}::update_oracle`,
    type_arguments: [],
    arguments: [newOracle],
  };
  const response = await wallet.signAndSubmitTransaction({ payload });
  await aptos.waitForTransaction({ transactionHash: response.hash });
  if (onResult) onResult(response.hash);
  return response.hash;
}

// 7. Update Fees
export async function updateFees({ listingFee, platformFeeBps, onResult }: { listingFee: number, platformFeeBps: number, onResult?: (hash: string) => void }) {
  const wallet = getAptosWallet();
  const payload = {
    type: "entry_function_payload",
    function: `${MODULES.main}::update_fees`,
    type_arguments: [],
    arguments: [listingFee, platformFeeBps],
  };
  const response = await wallet.signAndSubmitTransaction({ payload });
  await aptos.waitForTransaction({ transactionHash: response.hash });
  if (onResult) onResult(response.hash);
  return response.hash;
}

// 8. Withdraw Fees
export async function withdrawFees({ amount, onResult }: { amount: number, onResult?: (hash: string) => void }) {
  const wallet = getAptosWallet();
  const payload = {
    type: "entry_function_payload",
    function: `${MODULES.main}::withdraw_fees`,
    type_arguments: [],
    arguments: [amount],
  };
  const response = await wallet.signAndSubmitTransaction({ payload });
  await aptos.waitForTransaction({ transactionHash: response.hash });
  if (onResult) onResult(response.hash);
  return response.hash;
}

// 9. Get Project Details (View Function) - Using SDK
export async function getProject(projectId: number) {
  try {
    const functionString = `${MODULES.main.split('::')[0]}::main::get_project` as `${string}::${string}::${string}`;
    console.log('Calling function:', functionString, 'with projectId:', projectId);
    const [data] = await aptos.view<any[]>({
      payload: {
        function: functionString,
        typeArguments: [],
        functionArguments: [projectId.toString()],
      }
    });
    return data;
  } catch (error) {
    console.error("Error getting project:", error);
    throw error;
  }
}

// 10. Get Platform Stats (View Function)
export async function getPlatformStats() {
  try {
    const payload = {
      function: `${MODULES.main}::get_platform_stats` as any,
      type_arguments: [],
      arguments: [],
    };
    const response = await aptos.view({ payload });
    return response;
  } catch (error) {
    console.error("Error getting platform stats:", error);
    throw error;
  }
}

// 11. Get Bet Details (View Function) - Using SDK
export async function getBetDetails(projectId: number, bettorAddress: string) {
  try {
    const [data] = await aptos.view<any[]>({
      payload: {
        function: `${MODULES.main.split('::')[0]}::main::get_bet_details`,
        typeArguments: [],
        functionArguments: [projectId.toString(), bettorAddress],
      }
    });
    return data;
  } catch (error) {
    console.error("Error getting bet details:", error);
    throw error;
  }
}

// 12. Calculate Potential Payout (View Function) - Using SDK
export async function calculatePotentialPayout(projectId: number, bettorAddress: string) {
  try {
    const [data] = await aptos.view<any[]>({
      payload: {
        function: `${MODULES.main.split('::')[0]}::main::calculate_potential_payout`,
        typeArguments: [],
        functionArguments: [projectId.toString(), bettorAddress],
      }
    });
    return data;
  } catch (error) {
    console.error("Error calculating potential payout:", error);
    throw error;
  }
}

// 13. Get All Projects (Helper function to iterate through project IDs)
export async function getAllProjects() {
  // 1. Get all project IDs as strings
  const ids = await aptos.view<string[]>({
    payload: {
      function: `${MODULES.main.split('::')[0]}::main::get_all_project_ids`,
      typeArguments: [],
      functionArguments: [],
    }
  });
  if (!ids?.length) return [];

  // 2. Fetch each project using the SDK
  const projects = await Promise.all(
    ids
      .map((idStr) => Number(idStr))
      .filter((id) => Number.isFinite(id) && !isNaN(id) && id > 0)
      .map(async (id) => {
        const [projectData] = await aptos.view<any[]>({
          payload: {
            function: `${MODULES.main.split('::')[0]}::main::get_project`,
            typeArguments: [],
            functionArguments: [id],
          }
        });
        return { id, ...projectData };
      })
  );
  return projects;
}

// 14. Get User Portfolio (Helper function to get all user bets)
export async function getUserPortfolio(userAddress: string, maxProjectId: number = 100) {
  const userBets = [];
  for (let i = 1; i <= maxProjectId; i++) {
    try {
      const betDetails = await getBetDetails(i, userAddress);
      if (betDetails && Array.isArray(betDetails) && betDetails[0] && typeof betDetails[0] === 'number' && betDetails[0] > 0) {
        const project = await getProject(i);
        userBets.push({
          projectId: i,
          project,
          betDetails
        });
      }
    } catch (error) {
      // No bet or project doesn't exist, continue
      continue;
    }
  }
  return userBets;
}

// 15. Enhanced Place Bet with better error handling
export async function placeBetEnhanced({ projectId, amount, betType, onResult }: { 
  projectId: number, 
  amount: number, 
  betType: 'SUPPORT' | 'DOUBT', 
  onResult?: (hash: string) => void 
}) {
  try {
    const wallet = getAptosWallet();
    const betTypeNumber = betType === 'SUPPORT' ? 1 : 2;
    
    // Ensure projectId is a valid number
    if (!projectId || isNaN(projectId) || projectId <= 0) {
      throw new Error(`Invalid project ID: ${projectId}`);
    }
    
    const payload = {
      type: "entry_function_payload",
      function: `${MODULES.main}::place_bet`,
      type_arguments: [],
      arguments: [projectId, amount, betTypeNumber],
    };
    
    console.log("Placing bet with payload:", payload);
    const response = await wallet.signAndSubmitTransaction({ payload });
    await aptos.waitForTransaction({ transactionHash: response.hash });
    
    if (onResult) onResult(response.hash);
    return response.hash;
  } catch (error) {
    console.error("Error placing bet:", error);
    throw error;
  }
}

// 16. Enhanced Claim Payout with better error handling
export async function claimPayoutEnhanced({ projectId, onResult }: { 
  projectId: number, 
  onResult?: (hash: string) => void 
}) {
  try {
    const wallet = getAptosWallet();
    const account = await wallet.account();
    
    const payload = {
      type: "entry_function_payload",
      function: `${MODULES.main}::claim_payout`,
      type_arguments: [],
      arguments: [account.address, projectId],
    };
    
    console.log("Claiming payout with payload:", payload);
    const response = await wallet.signAndSubmitTransaction({ payload });
    await aptos.waitForTransaction({ transactionHash: response.hash });
    
    if (onResult) onResult(response.hash);
    return response.hash;
  } catch (error) {
    console.error("Error claiming payout:", error);
    throw error;
  }
}

// Get APT balance for an address
export async function getAptBalance(address: string): Promise<number> {
  try {
    const coinType = "0x1::aptos_coin::AptosCoin";
    const [balanceStr] = await aptos.view<[string]>({
      payload: {
        function: "0x1::coin::balance",
        typeArguments: [coinType],
        functionArguments: [address]
      }
    });
    console.log("balanceStr", balanceStr)
    return parseInt(balanceStr, 10) / 1_000_000; // Return in APT
  } catch (error) {
    console.error('Error fetching APT balance:', error);
    return 0;
  }
}

async function runAllTransactions(aptos: any) {
  // 1. initialize
  const txn1 = await aptos.transaction.build.simple({
    sender: ADMIN,
    data: {
      function: `${MODULE}::initialize`,
      typeArguments: [],
      functionArguments: [ORACLE],
    },
  });
  console.log("\n=== initialize ===\n");
  const committedTxn1 = await aptos.signAndSubmitTransaction({ signer: ADMIN, transaction: txn1 });
  await aptos.waitForTransaction({ transactionHash: committedTxn1.hash });
  console.log(`Committed transaction: ${committedTxn1.hash}`);

  // 2. create_project
  const txn2 = await aptos.transaction.build.simple({
    sender: CREATOR,
    data: {
      function: `${MODULE}::create_project`,
      typeArguments: [],
      functionArguments: [TARGET_HOLDERS, DEADLINE, NFT_CONTRACT, METADATA_URI],
    },
  });
  console.log("\n=== create_project ===\n");
  const committedTxn2 = await aptos.signAndSubmitTransaction({ signer: CREATOR, transaction: txn2 });
  await aptos.waitForTransaction({ transactionHash: committedTxn2.hash });
  console.log(`Committed transaction: ${committedTxn2.hash}`);

  // 3. place_bet
  const txn3 = await aptos.transaction.build.simple({
    sender: BETTOR,
    data: {
      function: `${MODULE}::place_bet`,
      typeArguments: [],
      functionArguments: [PROJECT_ID, AMOUNT, BET_TYPE],
    },
  });
  console.log("\n=== place_bet ===\n");
  const committedTxn3 = await aptos.signAndSubmitTransaction({ signer: BETTOR, transaction: txn3 });
  await aptos.waitForTransaction({ transactionHash: committedTxn3.hash });
  console.log(`Committed transaction: ${committedTxn3.hash}`);

  // 4. resolve_project
  const txn4 = await aptos.transaction.build.simple({
    sender: ORACLE,
    data: {
      function: `${MODULE}::resolve_project`,
      typeArguments: [],
      functionArguments: [PROJECT_ID, FINAL_HOLDERS],
    },
  });
  console.log("\n=== resolve_project ===\n");
  const committedTxn4 = await aptos.signAndSubmitTransaction({ signer: ORACLE, transaction: txn4 });
  await aptos.waitForTransaction({ transactionHash: committedTxn4.hash });
  console.log(`Committed transaction: ${committedTxn4.hash}`);

  // 5. claim_payout
  const txn5 = await aptos.transaction.build.simple({
    sender: ADMIN,
    data: {
      function: `${MODULE}::claim_payout`,
      typeArguments: [],
      functionArguments: [CLAIMER, PROJECT_ID],
    },
  });
  console.log("\n=== claim_payout ===\n");
  const committedTxn5 = await aptos.signAndSubmitTransaction({ signer: ADMIN, transaction: txn5 });
  await aptos.waitForTransaction({ transactionHash: committedTxn5.hash });
  console.log(`Committed transaction: ${committedTxn5.hash}`);

  // 6. update_oracle
  const txn6 = await aptos.transaction.build.simple({
    sender: ADMIN,
    data: {
      function: `${MODULE}::update_oracle`,
      typeArguments: [],
      functionArguments: [NEW_ORACLE],
    },
  });
  console.log("\n=== update_oracle ===\n");
  const committedTxn6 = await aptos.signAndSubmitTransaction({ signer: ADMIN, transaction: txn6 });
  await aptos.waitForTransaction({ transactionHash: committedTxn6.hash });
  console.log(`Committed transaction: ${committedTxn6.hash}`);

  // 7. update_fees
  const txn7 = await aptos.transaction.build.simple({
    sender: ADMIN,
    data: {
      function: `${MODULE}::update_fees`,
      typeArguments: [],
      functionArguments: [LISTING_FEE, PLATFORM_FEE_BPS],
    },
  });
  console.log("\n=== update_fees ===\n");
  const committedTxn7 = await aptos.signAndSubmitTransaction({ signer: ADMIN, transaction: txn7 });
  await aptos.waitForTransaction({ transactionHash: committedTxn7.hash });
  console.log(`Committed transaction: ${committedTxn7.hash}`);

  // 8. withdraw_fees
  const txn8 = await aptos.transaction.build.simple({
    sender: ADMIN,
    data: {
      function: `${MODULE}::withdraw_fees`,
      typeArguments: [],
      functionArguments: [WITHDRAW_AMOUNT],
    },
  });
  console.log("\n=== withdraw_fees ===\n");
  const committedTxn8 = await aptos.signAndSubmitTransaction({ signer: ADMIN, transaction: txn8 });
  await aptos.waitForTransaction({ transactionHash: committedTxn8.hash });
  console.log(`Committed transaction: ${committedTxn8.hash}`);
}

// Export the function for use elsewhere
export { runAllTransactions, MODULES };
