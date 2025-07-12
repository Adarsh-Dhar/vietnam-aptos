'use client';

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/components/wallet/wallet-provider";
import { Aptos, AptosConfig, Network, Account, NetworkToNetworkName } from "@aptos-labs/ts-sdk";
import { Upload, X, Image as ImageIcon, Zap, Coins, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=400&fit=crop";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Extend Window interface for Aptos wallet
declare global {
  interface Window {
    aptos?: any;
  }
}

export default function MintNFTPage() {
  const { isConnected, address, network, connect } = useWallet();
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [minting, setMinting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mintStep, setMintStep] = useState("");
  const [error, setError] = useState("");
  const [storageLogs, setStorageLogs] = useState<string[]>([]);
  const [authStatus, setAuthStatus] = useState<'disconnected' | 'wallet_only' | 'authenticated'>('disconnected');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Add log to storage logs
  const addStorageLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setStorageLogs(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  // Auto-authenticate on page load/refresh
  useEffect(() => {
    const autoAuthenticate = async () => {
      try {
        // Wait a bit for wallet to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (isConnected && address) {
          addStorageLog('🔄 Auto-authenticating wallet on page load...');
          
          // Check if we already have a valid token
          const existingToken = localStorage.getItem('authToken');
          if (existingToken) {
            addStorageLog('✅ Existing authentication token found');
            setAuthStatus('authenticated');
            return;
          }
          
          // Try to authenticate
          await authenticateUser();
          setAuthStatus('authenticated');
          addStorageLog('✅ Auto-authentication successful');
        } else {
          setAuthStatus('disconnected');
          addStorageLog('❌ Wallet not connected for auto-authentication');
        }
      } catch (error) {
        setAuthStatus('wallet_only');
        addStorageLog(`❌ Auto-authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    autoAuthenticate();
  }, [isConnected, address]);

  // Update auth status when wallet connection changes
  useEffect(() => {
    const updateAuthStatus = () => {
      const token = localStorage.getItem('authToken');
      const walletConnected = isConnected && address;
      
      if (token && walletConnected) {
        setAuthStatus('authenticated');
      } else if (walletConnected) {
        setAuthStatus('wallet_only');
      } else {
        setAuthStatus('disconnected');
      }
    };

    updateAuthStatus();
  }, [isConnected, address]);

  // Authenticate user and get JWT token
  const authenticateUser = async () => {
    try {
      addStorageLog('🔐 Starting user authentication...');
      
      if (!isConnected || !address) {
        addStorageLog('❌ Wallet not connected');
        throw new Error('Please connect your wallet first');
      }

      addStorageLog(`✅ Wallet connected: ${address}`);

      // Check if we already have a valid token
      const existingToken = localStorage.getItem('authToken');
      if (existingToken) {
        addStorageLog('✅ Existing authentication token found');
        return existingToken;
      }

      addStorageLog('📡 Requesting authentication token...');
      
      // Create a simple signature for authentication (in production, implement proper signature)
      const signature = `auth_${Date.now()}_${address}`;
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aptosAddress: address,
          signature: signature
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        addStorageLog(`❌ Authentication failed: ${errorData.error}`);
        throw new Error(errorData.error || 'Authentication failed');
      }

      const { token, user } = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('authToken', token);
      addStorageLog(`✅ Authentication successful for user: ${user.aptosAddress}`);
      
      return token;
    } catch (error) {
      addStorageLog(`❌ Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  // Check authentication status
  const checkAuthStatus = () => {
    const token = localStorage.getItem('authToken');
    const walletConnected = isConnected && address;
    
    if (token && walletConnected) {
      return { status: 'authenticated', message: '✅ Wallet connected and authenticated' };
    } else if (walletConnected) {
      return { status: 'wallet_only', message: '⚠️  Wallet connected but not authenticated' };
    } else {
      return { status: 'disconnected', message: '❌ Wallet not connected' };
    }
  };

  // Clear authentication
  const clearAuthentication = () => {
    localStorage.removeItem('authToken');
    setAuthStatus('wallet_only');
    addStorageLog('🗑️  Authentication token cleared');
  };
  
  // Setup Aptos SDK - following the proper pattern
  const APTOS_NETWORK = NetworkToNetworkName[process.env.NEXT_PUBLIC_APTOS_NETWORK || 'devnet'] || Network.DEVNET;
  const config = new AptosConfig({ network: APTOS_NETWORK });
  const aptos = new Aptos(config);

  // Get wallet signer from connected wallet
  const getWalletSigner = async () => {
    if (!isConnected) {
      throw new Error("Please connect your wallet first");
    }

    const wallet = window.aptos;
    if (!wallet) {
      throw new Error("Aptos wallet not found. Please install Petra wallet.");
    }

    // Ensure wallet is connected
    const isWalletConnected = await wallet.isConnected();
    if (!isWalletConnected) {
      await wallet.connect();
    }

    // Get account info
    const account = await wallet.account();
    if (!account || !account.address) {
      throw new Error("Wallet not properly connected");
    }

    return { accountAddress: account.address, wallet };
  };

  // Create collection using Aptos SDK directly
  const createCollection = async (collectionName: string, description: string, uri: string) => {
    try {
      setMintStep("Creating collection...");
      
      const { accountAddress, wallet } = await getWalletSigner();
      
      console.log("Creating collection with wallet:", wallet);
      
      // Use the simple payload format that works with Petra wallet
      const payload = {
        type: "entry_function_payload",
        function: "0x4::aptos_token::create_collection",
        type_arguments: [],
        arguments: [
          description,
          "18446744073709551614",
          collectionName,
          uri,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          "0",
          "1"
        ],
      };

      const committedTransaction = await wallet.signAndSubmitTransaction(payload);
      
      console.log("committedTransaction", committedTransaction);
      
      // Wait for the transaction to complete using existing aptos instance
      const executedTransaction = await aptos.waitForTransaction({
        transactionHash: committedTransaction.hash,
      });
      
      console.log("executedTransaction", executedTransaction);
      toast.success("Collection created successfully!");
      return executedTransaction.hash;
    } catch (error: any) {
      console.error("Collection creation error:", error);
      const errorMsg = error.message || "Collection creation failed";
      
      if (errorMsg.includes("COLLECTION_ALREADY_EXISTS")) {
        console.log("Collection already exists, continuing...");
        return "EXISTING_COLLECTION";
      }
      
      throw new Error(errorMsg);
    }
  };

  // Mint NFT using Aptos SDK directly
  const mintNFT = async (collectionName: string, tokenName: string, description: string, uri: string) => {
    try {
      setMintStep("Minting NFT...");
      
      const { accountAddress, wallet } = await getWalletSigner();
      
      const payload = {
        type: "entry_function_payload",
        function: "0x4::aptos_token::mint",
        type_arguments: [],
        arguments: [
          collectionName,
          description,
          tokenName,
          uri,
          [],
          [],
          []
        ],
      };

      const committedTransaction = await wallet.signAndSubmitTransaction(payload);
      
      const executedTransaction = await aptos.waitForTransaction({
        transactionHash: committedTransaction.hash,
      });
      
      console.log("NFT minted successfully:", executedTransaction.hash);
      return executedTransaction.hash;
    } catch (error) {
      console.error("NFT minting error:", error);
      throw error;
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File too large (max 5MB)");
        return;
      }
      setImage(file);
      setImageUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const removeImage = () => {
    setImage(null);
    setImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Save NFT data to database
  const saveNFTToDatabase = async (nftData: {
    collectionName: string;
    collectionDescription: string;
    collectionUri: string;
    tokenName: string;
    tokenDescription: string;
    tokenUri: string;
    imageUrl: string;
    collectionTxHash?: string;
    mintTxHash?: string;
    aptosTokenId?: string;
    aptosCollectionId?: string;
    status: string;
  }, authToken: string) => {
    try {
      addStorageLog('=== NFT Database Storage Logs ===');
      addStorageLog('Starting NFT database storage process...');
      addStorageLog(`NFT Data: ${nftData.collectionName} / ${nftData.tokenName}`);
      
      if (!authToken) {
        addStorageLog('❌ No authentication token provided');
        throw new Error('No authentication token provided');
      }
      
      addStorageLog('✅ Authentication token provided');

      addStorageLog('📡 Sending request to /api/nft/save...');
      const response = await fetch('/api/nft/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(nftData)
      });

      addStorageLog(`📥 Response received: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json();
        addStorageLog(`❌ API Error: ${errorData.error || 'Unknown error'}`);
        throw new Error(errorData.error || 'Failed to save NFT data');
      }

      const result = await response.json();
      addStorageLog('✅ NFT successfully saved to database');
      addStorageLog(`📊 Database Record ID: ${result.nft.id}`);
      
      // Log storage summary
      addStorageLog('=== NFT Storage Summary ===');
      addStorageLog(`🎯 NFT ID: ${result.nft.id}`);
      addStorageLog(`👤 Creator: ${result.nft.creator?.aptosAddress || 'Unknown'}`);
      addStorageLog(`🏷️  Collection: ${result.nft.collectionName}`);
      addStorageLog(`🖼️  Token: ${result.nft.tokenName}`);
      addStorageLog(`🔗 Mint TX: ${result.nft.mintTxHash || 'N/A'}`);
      addStorageLog(`📅 Created: ${new Date(result.nft.createdAt).toLocaleString()}`);
      addStorageLog(`✅ Status: ${result.nft.status}`);
      addStorageLog('=== Storage Complete ===');
      
      return result.nft;
    } catch (error) {
      addStorageLog(`❌ Error saving NFT to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error saving NFT to database:', error);
      throw error;
    }
  };

  const handleMint = async () => {
    if (!isConnected) {
      await connect();
      return;
    }
    
    if (!image || !name.trim() || !collectionName.trim() || !collectionDescription.trim()) {
      toast.error("Please upload an image and fill in all required fields (Collection Name, Collection Description, and NFT Name)");
      return;
    }
    
    console.log('=== NFT Minting Process Started ===');
    console.log('🎯 Minting Details:', {
      collectionName,
      collectionDescription,
      tokenName: name,
      tokenDescription: description,
      imageUrl,
      walletAddress: address
    });
    
    setMinting(true);
    setProgress(10);
    setError("");
    
    try {
      // 1. Authenticate user and get JWT token
      console.log('🔐 Step 1: Authenticating user...');
      setProgress(20);
      const token = await authenticateUser();
      console.log('✅ User authenticated, token obtained.');
      setProgress(40);
      
      // 2. Create collection
      console.log('📦 Step 2: Creating collection...');
      setProgress(60);
      setMintStep("Creating collection...");
      const collectionUri = "aptos.dev";
      
      const collectionResult = await createCollection(collectionName, collectionDescription, collectionUri);
      console.log('✅ Collection created:', collectionResult);
      setProgress(80);
      
      // 3. Mint NFT
      console.log('🖼️  Step 3: Minting NFT...');
      setProgress(90);
      const tokenUri = "https://example.com/nft-metadata.json";
      const mintHash = await mintNFT(collectionName, name, description || "", tokenUri);
      console.log('✅ NFT minted successfully:', mintHash);
      setProgress(100);
      
      // 4. Save NFT data to database
      console.log('💾 Step 4: Saving to database...');
      setMintStep("Saving to database...");
      
      try {
        const nftData = {
          collectionName,
          collectionDescription,
          collectionUri,
          tokenName: name,
          tokenDescription: description || "",
          tokenUri,
          imageUrl: imageUrl,
          collectionTxHash: typeof collectionResult === 'string' ? collectionResult : undefined,
          mintTxHash: mintHash,
          status: 'MINTED'
        };
        
        console.log('📊 Preparing NFT data for database storage:', nftData);
        const savedNFT = await saveNFTToDatabase(nftData, token);
        
        console.log('🎉 Complete NFT Process Summary:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Blockchain Operations:');
        console.log(`   • Collection Created: ${collectionResult}`);
        console.log(`   • NFT Minted: ${mintHash}`);
        console.log('✅ Database Operations:');
        console.log(`   • NFT Record ID: ${savedNFT.id}`);
        console.log(`   • Creator: ${savedNFT.creator?.aptosAddress}`);
        console.log(`   • Status: ${savedNFT.status}`);
        console.log(`   • Created At: ${new Date(savedNFT.createdAt).toLocaleString()}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        toast.success("NFT data saved to database!");
      } catch (dbError) {
        console.error('❌ Database storage failed:', dbError);
        console.log('⚠️  NFT was minted on blockchain but failed to save to database');
        toast.warning("NFT minted but failed to save to database");
      }
      
      setMintStep("Confirming transaction...");
      setProgress(100);
      
      console.log('🎊 NFT Minting Process Complete!');
      toast.success(`NFT Minted Successfully! Transaction: ${mintHash}`);
      
      // Reset form
      setName("");
      setDescription("");
      setCollectionName("");
      setCollectionDescription("");
      removeImage();
      
    } catch (err: any) {
      console.error('❌ Minting process failed:', err);
      console.error('🔍 Error details:', {
        message: err.message,
        stack: err.stack,
        type: err.constructor.name
      });
      const errorMsg = err.message || "Minting failed";
      setError(errorMsg);
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setMinting(false);
      setProgress(0);
      setMintStep("");
      console.log('🏁 Minting process ended');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F2B] particle-bg p-6">
      <div className="container mx-auto max-w-2xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '2rem', textAlign: 'center' }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">Mint Your NFT</h1>
          <p className="text-gray-400">Create and mint unique NFTs using Aptos SDK with your connected wallet</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card p-8">
            {/* Image Upload Section */}
            <div className="mb-8">
              <Label className="text-white text-sm font-medium mb-4 block">NFT Image *</Label>
              <div 
                className="relative w-64 h-64 mx-auto rounded-xl overflow-hidden border-2 border-dashed border-white/20 cursor-pointer hover:border-[#00F0FF]/50 transition-colors"
                onClick={() => !minting && fileInputRef.current?.click()}
              >
                {imageUrl ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                    {!minting && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-[#00F0FF] transition-colors">
                    <Upload size={48} />
                    <p className="mt-2 text-sm">Click to upload image</p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF up to 5MB</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  disabled={minting}
                />
              </div>
            </div>

            {/* NFT Details */}
            <div className="space-y-6 mb-8">
              {/* Authentication Status */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium">Authentication Status</span>
                  <Badge 
                    variant={authStatus === 'authenticated' ? 'default' : 'secondary'}
                    className={authStatus === 'authenticated' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}
                  >
                    {authStatus === 'authenticated' ? 'Authenticated' : 
                     authStatus === 'wallet_only' ? 'Wallet Only' : 'Disconnected'}
                  </Badge>
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  {authStatus === 'authenticated' ? '✅ Wallet connected and authenticated' :
                   authStatus === 'wallet_only' ? '⚠️  Wallet connected but not authenticated' :
                   '❌ Wallet not connected'}
                </p>
                {isConnected && address && (
                  <p className="text-gray-500 text-xs mt-1">Address: {address.slice(0, 8)}...{address.slice(-6)}</p>
                )}
                {authStatus === 'wallet_only' && (
                  <p className="text-yellow-400 text-xs mt-1">Click "Test Authentication" to authenticate</p>
                )}
              </div>

              <div>
                <Label className="text-white text-sm font-medium mb-2 block">Collection Name *</Label>
                <Input 
                  value={collectionName} 
                  onChange={e => setCollectionName(e.target.value)} 
                  placeholder="My Awesome Collection" 
                  disabled={minting}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">Collection Description *</Label>
                <Textarea 
                  value={collectionDescription} 
                  onChange={e => setCollectionDescription(e.target.value)} 
                  placeholder="Describe your collection..." 
                  disabled={minting} 
                  rows={2}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">NFT Name *</Label>
                <Input 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="My Awesome NFT" 
                  disabled={minting}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">NFT Description</Label>
                <Textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="Describe your NFT..." 
                  disabled={minting} 
                  rows={3}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Progress */}
            {minting && (
              <div className="mb-6">
                <div className="flex items-center justify-between text-white text-sm mb-2">
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4 animate-spin" />
                    {mintStep}
                  </span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Storage Logs Display */}
            {storageLogs.length > 0 && (
              <div className="mb-6 p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium text-sm">Storage Logs</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setStorageLogs([])}
                    className="text-gray-400 hover:text-white text-xs"
                  >
                    Clear
                  </Button>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {storageLogs.map((log, index) => (
                    <div key={index} className="text-xs font-mono">
                      <span className="text-gray-400">{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Mint Button */}
            <Button
              onClick={handleMint}
              disabled={minting || !isConnected || authStatus !== 'authenticated'}
              className="w-full bg-gradient-to-r from-[#00F0FF] to-[#8B5CF6] hover:from-[#00F0FF]/80 hover:to-[#8B5CF6]/80 text-white font-bold py-4 text-lg disabled:opacity-50"
            >
              {minting ? (
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 animate-spin" />
                  Minting...
                </div>
              ) : !isConnected ? (
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  Connect Wallet to Mint
                </div>
              ) : authStatus !== 'authenticated' ? (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Authenticate to Mint
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Mint NFT
                </div>
              )}
            </Button>

            {/* Help Section */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h3 className="text-blue-400 font-medium text-sm mb-2">Need Help?</h3>
              <div className="text-gray-400 text-xs space-y-1">
                <p>• Make sure Petra wallet is installed and connected</p>
                <p>• Switch to Devnet in your wallet for testing</p>
                <p>• Collections are created automatically for organization</p>
                <p>• Ensure you have enough APT for gas fees (~0.1 APT)</p>
                <p>• Check browser console for detailed transaction logs</p>
              </div>
              
              {/* Debug Button */}
              <Button
                onClick={async () => {
                  try {
                    console.log("=== Wallet Debug Test ===");
                    const wallet = window.aptos;
                    if (!wallet) {
                      toast.error("Petra wallet not found");
                      return;
                    }
                    
                    const isConnected = await wallet.isConnected();
                    console.log("Connected:", isConnected);
                    
                    if (!isConnected) {
                      await wallet.connect();
                      console.log("Connected after connect()");
                    }
                    
                    const account = await wallet.account();
                    console.log("Account:", account);
                    
                    const network = await wallet.network();
                    console.log("Network:", network);
                    
                    toast.success("Wallet debug completed - check console for details");
                  } catch (err) {
                    console.error("Debug error:", err);
                    toast.error("Debug failed - check console for details");
                  }
                }}
                variant="outline"
                size="sm"
                className="mt-3 w-full text-xs"
              >
                Debug Wallet Connection
              </Button>

              {/* Authentication Test Button */}
              <Button
                onClick={async () => {
                  try {
                    addStorageLog("=== Authentication Test ===");
                    const token = await authenticateUser();
                    addStorageLog(`✅ Authentication successful! Token: ${token.slice(0, 20)}...`);
                    toast.success("Authentication successful!");
                  } catch (err) {
                    addStorageLog(`❌ Authentication failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
                    toast.error("Authentication failed");
                  }
                }}
                variant="outline"
                size="sm"
                className="mt-2 w-full text-xs"
              >
                Test Authentication
              </Button>

              {/* Clear Authentication Button */}
              {authStatus === 'authenticated' && (
                <Button
                  onClick={clearAuthentication}
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full text-xs text-red-400 border-red-400 hover:bg-red-400/10"
                >
                  Clear Authentication
                </Button>
              )}
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="w-12 h-12 bg-[#00F0FF]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ImageIcon className="h-6 w-6 text-[#00F0FF]" />
                </div>
                <h3 className="text-white font-medium text-sm">Simple Metadata</h3>
                <p className="text-gray-400 text-xs">Basic NFT metadata with example URIs</p>
              </div>
              
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="w-12 h-12 bg-[#8B5CF6]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Coins className="h-6 w-6 text-[#8B5CF6]" />
                </div>
                <h3 className="text-white font-medium text-sm">Aptos Blockchain</h3>
                <p className="text-gray-400 text-xs">Immutable on-chain ownership</p>
              </div>
              
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="w-12 h-12 bg-[#10B981]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-6 w-6 text-[#10B981]" />
                </div>
                <h3 className="text-white font-medium text-sm">Instant Verification</h3>
                <p className="text-gray-400 text-xs">Verify on Aptos Explorer</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 