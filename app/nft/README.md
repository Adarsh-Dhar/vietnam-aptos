# Aptos NFT Minting System

A complete NFT minting application built on the Aptos blockchain with IPFS storage integration.

## Features

- ✅ **Real IPFS Upload**: Upload images to decentralized IPFS storage
- ✅ **Metadata Management**: Create and store NFT metadata on IPFS
- ✅ **Aptos Integration**: Mint NFTs on Aptos blockchain
- ✅ **Wallet Connection**: Connect with Petra wallet
- ✅ **Progress Tracking**: Real-time minting progress with step-by-step feedback
- ✅ **Error Handling**: Comprehensive error handling with user-friendly messages
- ✅ **Modern UI**: Beautiful, responsive interface with animations
- ✅ **Fallback Support**: Graceful fallback to placeholder images if IPFS fails

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in your project root and add:

```env
NEXT_PUBLIC_NFT_STORAGE_KEY=your_nft.storage_api_key_here
```

### 2. Get NFT.Storage API Key

1. Go to [NFT.Storage](https://nft.storage/)
2. Sign up for a free account
3. Create a new API key
4. Copy the API key to your `.env.local` file

### 3. Install Dependencies

The required dependencies are already installed:
- `@aptos-labs/ts-sdk`: Aptos blockchain SDK
- `nft.storage`: IPFS storage client
- `framer-motion`: Animations
- `lucide-react`: Icons
- `sonner`: Toast notifications

### 4. Wallet Setup

1. Install [Petra Wallet](https://petra.app/) browser extension
2. Create a new wallet or import existing one
3. Switch to Devnet for testing
4. Get test APT from [Aptos Faucet](https://faucet.devnet.aptoslabs.com/)

## How It Works

### 1. Image Upload Process
1. User selects an image file (max 5MB)
2. Image is validated for type and size
3. Image is uploaded to IPFS via NFT.Storage
4. Image URL is generated from IPFS CID

### 2. Metadata Creation
1. NFT metadata JSON is created with:
   - NFT name and description
   - IPFS image URL
   - Standard NFT metadata fields
2. Metadata JSON is uploaded to IPFS
3. Metadata URI is generated for blockchain storage

### 3. Blockchain Minting
1. Collection is created (if it doesn't exist)
2. NFT is minted with metadata URI
3. Transaction is confirmed on Aptos blockchain
4. User receives success confirmation with transaction hash

## Usage Guide

### Step 1: Connect Wallet
1. Click "Connect Wallet to Mint" button
2. Approve connection in Petra wallet
3. Ensure you're on Devnet for testing

### Step 2: Upload Image
1. Click the upload area or drag an image
2. Supported formats: JPG, PNG, GIF
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

## Technical Details

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

## Troubleshooting

### Common Issues

1. **"Aptos wallet not found"**
   - Install Petra wallet extension
   - Refresh page after installation

2. **"File too large"**
   - Compress image to under 5MB
   - Use JPG format for smaller files

3. **"Transaction failed"**
   - Check wallet balance (need ~0.1 APT for gas)
   - Ensure you're on Devnet
   - Try again after a few minutes

4. **"IPFS upload failed"**
   - Check NFT.Storage API key
   - System will use placeholder image
   - NFT will still mint successfully

### Network Configuration

- **Devnet**: Use for testing (recommended)
- **Mainnet**: Use for production NFTs
- Switch networks in Petra wallet settings

## File Structure

```
app/nft/
├── page.tsx          # Main NFT minting page
├── loading.tsx       # Loading component
└── README.md         # This documentation
```

## Dependencies

```json
{
  "@aptos-labs/ts-sdk": "^3.1.3",
  "nft.storage": "^7.2.0",
  "framer-motion": "latest",
  "lucide-react": "^0.454.0",
  "sonner": "^1.7.1"
}
```

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

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify your environment setup
3. Check browser console for detailed errors
4. Ensure Petra wallet is properly configured

## License

This project is part of the Aptos Validation Platform and follows the same license terms. 