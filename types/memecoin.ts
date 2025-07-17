export interface Memecoin {
  id: string;
  creatorId: string;
  coinName: string;
  coinSymbol: string;
  coinDescription?: string;
  totalSupply: string;
  initialPrice?: number;
  currentPrice?: number;
  marketCap?: number;
  volume24h?: number;
  holders: number;
  mintTxHash?: string;
  deployTxHash?: string;
  coinAddress?: string;
  status: MemecoinStatus;
  logoUrl?: string;
  websiteUrl?: string;
  telegramUrl?: string;
  twitterUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  creator: {
    id: string;
    aptosAddress: string;
    username?: string;
  };
}

export enum MemecoinStatus {
  DEPLOYING = 'DEPLOYING',
  DEPLOYED = 'DEPLOYED',
  FAILED = 'FAILED',
  TRADING = 'TRADING',
  PAUSED = 'PAUSED'
}

export interface MemecoinPriceData {
  currentPrice: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  holders: number;
  totalSupply: string;
  coinAddress?: string;
  lastUpdated: string;
}

export interface MemecoinHolderData {
  totalHolders: number;
  uniqueAddresses: number;
  topHolders: Array<{
    address: string;
    balance: string;
    percentage: number;
  }>;
  distribution: {
    holders1to10: number;
    holders11to100: number;
    holders101to1000: number;
    holders1000plus: number;
  };
  lastUpdated: string;
  coinAddress?: string;
  coinSymbol: string;
}

export interface MemecoinVerificationData {
  verified: boolean;
  contractAddress: string;
  deploymentTx: string;
  contractType: string;
  totalSupply: string;
  decimals: number;
  creator: string;
  deploymentTime: string;
  blockchainData: {
    name: string;
    symbol: string;
    totalSupply: string;
    holders: number;
    liquidity: number;
    marketCap: number;
  };
}

export interface MemecoinDeployData {
  coinName: string;
  coinSymbol: string;
  coinDescription?: string;
  totalSupply: string;
  initialPrice?: number;
  decimals?: number;
  logoUrl?: string;
  websiteUrl?: string;
  telegramUrl?: string;
  twitterUrl?: string;
} 