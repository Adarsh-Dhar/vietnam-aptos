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
  const wallet = getAptosWallet();
  console.log("wallet", wallet);
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
