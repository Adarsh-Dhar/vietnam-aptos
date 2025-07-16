# Aptos NFT Holder Count Implementation

This is a complete, working implementation for getting NFT holder counts on Aptos, perfect for hackathons and development projects.

## 🚀 Features

- **Real-time holder counting** for any Aptos NFT collection
- **Multiple analysis types**: Simple count, detailed analysis, and account token listing
- **Network support**: Mainnet, Testnet, and Devnet
- **Modern UI**: Beautiful React component with Tailwind CSS
- **API endpoints**: RESTful API for programmatic access
- **Error handling**: Comprehensive error handling and validation

## 📁 File Structure

```
lib/oracle/index.ts                    # Core NFT holder count functions
components/ui/NFTHolderCounter.tsx     # React component with UI
app/nft-holder-demo/page.tsx          # Demo page
app/api/nft/holder-count/route.ts     # API endpoints
```

## 🔧 Core Functions

### 1. Simple Holder Count
```typescript
import { getSimpleHolderCount } from "@/lib/oracle";

const holderCount = await getSimpleHolderCount(
  accountAddress,    // Account that owns tokens from collection
  collectionAddress, // NFT collection address
  Network.MAINNET    // Aptos network
);
```

### 2. Detailed Analysis
```typescript
import { getHolderCountByAccount } from "@/lib/oracle";

const result = await getHolderCountByAccount(
  accountAddress,
  collectionAddress,
  Network.MAINNET
);

// Returns: { holderCount, totalTokens, uniqueHolders, error? }
```

### 3. Account Token Listing
```typescript
import { getAccountTokens } from "@/lib/oracle";

const tokens = await getAccountTokens(accountAddress, Network.MAINNET);
```

## 🎨 React Component Usage

```tsx
import NFTHolderCounter from "@/components/ui/NFTHolderCounter";

export default function MyPage() {
  return (
    <div>
      <NFTHolderCounter />
    </div>
  );
}
```

## 🌐 API Endpoints

### GET /api/nft/holder-count
```bash
# Simple holder count
GET /api/nft/holder-count?account=0x123&collection=0x456&type=simple

# Detailed analysis
GET /api/nft/holder-count?account=0x123&collection=0x456&type=detailed

# Account tokens
GET /api/nft/holder-count?account=0x123&type=tokens
```

### POST /api/nft/holder-count
```json
{
  "accountAddress": "0x123...",
  "collectionAddress": "0x456...",
  "network": "mainnet",
  "type": "simple"
}
```

## 🎯 Demo Page

Visit `/nft-holder-demo` to see the component in action with a beautiful UI.

## 🛠️ Installation & Setup

1. **Dependencies** (already installed):
   ```bash
   npm install @aptos-labs/ts-sdk
   ```

2. **Environment**: No additional setup required - works out of the box!

3. **Usage**: Import and use the functions or components as shown above.

## 🔍 How It Works

1. **Account-based approach**: Uses Aptos SDK's `getAccountOwnedTokensFromCollectionAddress` method
2. **Holder deduplication**: Uses JavaScript `Set` to count unique holders
3. **Error handling**: Comprehensive try-catch blocks with meaningful error messages
4. **Network support**: Supports all Aptos networks (Mainnet, Testnet, Devnet)

## 📊 Example Response

```json
{
  "success": true,
  "data": {
    "holderCount": 150,
    "totalTokens": 500,
    "uniqueHolders": ["0x123...", "0x456...", ...],
    "error": null
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🎨 UI Features

- **Modern design**: Clean, responsive interface with Tailwind CSS
- **Loading states**: Spinner animations during API calls
- **Toast notifications**: Success/error feedback using Sonner
- **Dark mode support**: Automatic dark/light theme detection
- **Responsive layout**: Works on desktop and mobile devices

## 🚀 Hackathon Ready

This implementation is perfect for hackathons because:

- ✅ **Zero setup**: Works immediately with existing dependencies
- ✅ **Complete solution**: Includes UI, API, and core functions
- ✅ **Production ready**: Proper error handling and validation
- ✅ **Extensible**: Easy to modify and extend for specific needs
- ✅ **Well documented**: Clear examples and usage patterns

## 🔧 Customization

### Adding New Analysis Types
```typescript
// Add to lib/oracle/index.ts
export async function getCustomAnalysis(address: string) {
  // Your custom logic here
}
```

### Styling the Component
```tsx
// Modify components/ui/NFTHolderCounter.tsx
// Change colors, layout, or add new features
```

### API Extensions
```typescript
// Add to app/api/nft/holder-count/route.ts
case "custom":
  result = await getCustomAnalysis(accountAddress);
  break;
```

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid contract address format"**
   - Ensure addresses start with `0x`
   - Check for proper Aptos address format

2. **"Collection not found"**
   - Verify the collection address exists
   - Try different networks (testnet vs mainnet)

3. **"No tokens found"**
   - Check if the account actually owns tokens from the collection
   - Verify collection address is correct

### Debug Mode
```typescript
// Add console.log statements in lib/oracle/index.ts
console.log("Tokens found:", tokens.length);
console.log("Unique holders:", holderSet.size);
```

## 📈 Performance Tips

- **Pagination**: The implementation handles large collections with pagination
- **Caching**: Consider adding Redis/memory caching for frequently accessed data
- **Rate limiting**: Add rate limiting for production use
- **Background jobs**: For large collections, consider background processing

## 🔗 Related Resources

- [Aptos TypeScript SDK Documentation](https://aptos.dev/sdks/ts-sdk/)
- [Aptos NFT Standards](https://aptos.dev/concepts/coin-and-token/aptos-coin/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

**Ready to use!** 🎉 This implementation provides everything you need to get NFT holder counts on Aptos for your hackathon or production project. 