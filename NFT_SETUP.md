# NFT Minting Setup Guide

## Overview
The NFT minting functionality has been updated to support real IPFS uploads using NFT.Storage. This allows users to upload their actual images and metadata to IPFS instead of using placeholder images.

## Key Features
- ✅ Real IPFS upload using NFT.Storage
- ✅ Proper metadata JSON creation
- ✅ Improved collection existence checking
- ✅ Fallback to placeholder if upload fails
- ✅ Better error handling and user feedback

## Setup Instructions

### 1. Get NFT.Storage API Key
1. Go to [NFT.Storage](https://nft.storage/)
2. Sign up for a free account
3. Create a new API key
4. Copy the API key

### 2. Configure Environment Variables
Create a `.env.local` file in your project root and add:

```env
NEXT_PUBLIC_NFT_STORAGE_KEY=your_actual_api_key_here
```

### 3. Install Dependencies
The required dependency has already been installed:
```bash
npm install nft.storage
```

## How It Works

### IPFS Upload Process
1. **Image Upload**: User selects an image file (max 5MB)
2. **IPFS Storage**: Image is uploaded to IPFS via NFT.Storage
3. **Metadata Creation**: JSON metadata is created with:
   - NFT name and description
   - IPFS image URL
   - Standard NFT metadata fields
4. **Metadata Upload**: Metadata JSON is uploaded to IPFS
5. **NFT Minting**: NFT is minted with metadata URI (not direct image URL)

### Collection Management
- Checks if collection exists before creating
- Creates collection only when needed
- Uses "Aptos NFT Collection" as the default collection name

### Error Handling
- Falls back to placeholder image if IPFS upload fails
- Shows user-friendly error messages
- Continues minting process even with fallback

## API Key Configuration
If no API key is configured, the system will:
- Show a warning toast
- Use placeholder image
- Still allow NFT minting with fallback

## Testing
1. Connect your wallet (Petra recommended)
2. Upload an image (JPEG, PNG, GIF up to 5MB)
3. Enter NFT name and description
4. Click "Mint NFT"
5. Approve the transaction in your wallet
6. View the minted NFT on Aptos Explorer

## Troubleshooting
- **Upload fails**: Check your NFT.Storage API key
- **Collection errors**: Ensure wallet is connected to Devnet
- **Transaction fails**: Check wallet balance and network connection

## Files Modified
- `app/nft/page.tsx`: Main NFT minting component
- `package.json`: Added nft.storage dependency
- `NFT_SETUP.md`: This setup guide 