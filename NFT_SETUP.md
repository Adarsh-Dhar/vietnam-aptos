# NFT Minting Setup Guide

## Overview
The NFT minting functionality has been implemented in the `app/nft` folder with real IPFS uploads using NFT.Storage. This allows users to upload their actual images and metadata to IPFS instead of using placeholder images.

## Key Features
- ✅ Real IPFS upload using NFT.Storage
- ✅ Proper metadata JSON creation
- ✅ Improved collection existence checking
- ✅ Fallback to placeholder if upload fails
- ✅ Better error handling and user feedback
- ✅ Modern UI with animations
- ✅ Progress tracking with step-by-step feedback
- ✅ Comprehensive validation and error handling

## File Structure
```
app/nft/
├── page.tsx          # Main NFT minting page
├── loading.tsx       # Loading component
└── README.md         # Detailed documentation

lib/
└── nft-utils.ts      # NFT utility functions

app/api/nft/
└── verify/route.ts   # NFT verification API
```

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
The required dependencies are already installed:
```bash
npm install nft.storage @aptos-labs/ts-sdk framer-motion lucide-react sonner
```

### 4. Wallet Setup
1. Install [Petra Wallet](https://petra.app/) browser extension
2. Create a new wallet or import existing one
3. Switch to Devnet for testing
4. Get test APT from [Aptos Faucet](https://faucet.devnet.aptoslabs.com/)

## How It Works

### IPFS Upload Process
1. **Image Upload**: User selects an image file (max 5MB)
2. **Validation**: File type and size validation
3. **IPFS Storage**: Image is uploaded to IPFS via NFT.Storage
4. **Metadata Creation**: JSON metadata is created with:
   - NFT name and description
   - IPFS image URL
   - Standard NFT metadata fields
5. **Metadata Upload**: Metadata JSON is uploaded to IPFS
6. **NFT Minting**: NFT is minted with metadata URI (not direct image URL)

### Collection Management
- Checks if collection exists before creating
- Creates collection only when needed
- Uses "Aptos NFT Collection" as the default collection name
- Handles collection already exists errors gracefully

### Error Handling
- Falls back to placeholder image if IPFS upload fails
- Shows user-friendly error messages
- Continues minting process even with fallback
- Comprehensive validation for file types and sizes

## API Key Configuration
If no API key is configured, the system will:
- Show a warning toast
- Use placeholder image
- Still allow NFT minting with fallback

## Usage Flow

### Step 1: Connect Wallet
1. Click "Connect Wallet to Mint" button
2. Approve connection in Petra wallet
3. Ensure you're on Devnet for testing

### Step 2: Upload Image
1. Click the upload area or drag an image
2. Supported formats: JPG, PNG, GIF, WebP
3. Maximum file size: 5MB
4. Preview will show your selected image

### Step 3: Enter Details
1. **NFT Name** (required): Enter a unique name for your NFT
2. **Description** (optional): Add a description of your NFT

### Step 4: Mint NFT
1. Click "Mint NFT" button
2. Approve transaction in Petra wallet
3. Wait for confirmation (usually 10-30 seconds)
4. View your minted NFT on Aptos Explorer

## Technical Implementation

### Smart Contract Functions Used
```typescript
// Create collection
"0x4::aptos_token::create_collection"

// Mint NFT
"0x4::aptos_token::mint"
```

### IPFS Storage
- Images and metadata are stored on IPFS
- Uses NFT.Storage for reliable IPFS access
- Fallback to placeholder if upload fails
- Metadata follows OpenSea standards

### Error Handling
- **Wallet Connection**: Handles missing Petra wallet
- **File Validation**: Checks file type and size
- **IPFS Upload**: Graceful fallback on upload failure
- **Blockchain Errors**: User-friendly error messages
- **Network Issues**: Retry mechanisms for failed transactions

## Testing
1. Connect your wallet (Petra recommended)
2. Upload an image (JPEG, PNG, GIF, WebP up to 5MB)
3. Enter NFT name and description
4. Click "Mint NFT"
5. Approve the transaction in your wallet
6. View the minted NFT on Aptos Explorer

## Troubleshooting
- **Upload fails**: Check your NFT.Storage API key
- **Collection errors**: Ensure wallet is connected to Devnet
- **Transaction fails**: Check wallet balance and network connection
- **File validation errors**: Check file type and size requirements

## Files Modified/Created
- `app/nft/page.tsx`: Main NFT minting component
- `app/nft/loading.tsx`: Loading component
- `app/nft/README.md`: Comprehensive documentation
- `lib/nft-utils.ts`: NFT utility functions
- `app/api/nft/verify/route.ts`: NFT verification API
- `package.json`: Added nft.storage dependency
- `NFT_SETUP.md`: This setup guide

## Security Considerations
- API keys are stored in environment variables
- No sensitive data is logged
- Wallet connections are handled securely
- IPFS content is publicly accessible (by design)

## Future Enhancements
- [ ] Batch minting support
- [ ] Custom collection creation
- [ ] Royalty configuration
- [ ] NFT marketplace integration
- [ ] Advanced metadata attributes
- [ ] Multi-chain support 