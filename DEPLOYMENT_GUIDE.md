# Smart Contract Deployment Guide

## Overview
This guide explains how to deploy the NFT validation platform smart contract to the Aptos blockchain.

## Prerequisites
1. Install Aptos CLI: `cargo install --git https://github.com/aptos-labs/aptos-core.git aptos`
2. Have an Aptos wallet with test APT (for devnet)
3. Be connected to Aptos devnet

## Deployment Steps

### 1. Navigate to Contract Directory
```bash
cd contract
```

### 2. Build the Contract
```bash
aptos move compile
```

### 3. Deploy the Contract
```bash
aptos move publish --named-addresses nft_validation=<YOUR_WALLET_ADDRESS>
```

### 4. Initialize the Platform
```bash
aptos move run --function-id <YOUR_WALLET_ADDRESS>::deploy::deploy_platform --args address:<ORACLE_ADDRESS>
```

## Update Configuration

After deployment, update the contract address in `lib/contract/index.ts`:

```typescript
const MODULES = {
  bet_types: "<YOUR_WALLET_ADDRESS>::bet_types",
  project: "<YOUR_WALLET_ADDRESS>::project", 
  betting: "<YOUR_WALLET_ADDRESS>::betting",
  security: "<YOUR_WALLET_ADDRESS>::security",
  main: "<YOUR_WALLET_ADDRESS>::main",
  nft_validator: "<YOUR_WALLET_ADDRESS>::nft_validator",
  oracle: "<YOUR_WALLET_ADDRESS>::oracle",
};
```

## Current Status
- ✅ Contract code is ready
- ⚠️ Contract needs to be deployed to devnet
- ⚠️ Mock implementation is currently active

## Mock Implementation
The current implementation uses a mock transaction system that:
- Simulates blockchain transactions
- Generates mock transaction hashes
- Allows testing without deployed contract
- Can be easily switched to real blockchain calls

To switch to real blockchain calls:
1. Deploy the contract following the steps above
2. Update the contract address in `lib/contract/index.ts`
3. Uncomment the real implementation in `createProject` function
4. Remove the mock implementation

## Testing
You can test the NFT selection functionality with the mock implementation. The system will:
- Allow NFT selection
- Create projects in the database
- Generate mock transaction hashes
- Provide full UI functionality

The mock implementation ensures the frontend works perfectly while the contract deployment is in progress. 