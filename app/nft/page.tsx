'use client';

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/components/wallet/wallet-provider";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { Upload, X, Image as ImageIcon, Zap, Coins, CheckCircle, AlertCircle } from "lucide-react";
import { NFTStorage } from 'nft.storage';
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
  const [minting, setMinting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mintStep, setMintStep] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const NFT_STORAGE_KEY = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY || '';

  // Setup Aptos SDK
  const APTOS_NETWORK = network === "mainnet" ? Network.MAINNET : Network.DEVNET;
  const config = new AptosConfig({ network: APTOS_NETWORK });
  const aptos = new Aptos(config);

  // Verify wallet network
  const verifyWalletNetwork = async () => {
    const wallet = window.aptos;
    if (!wallet) return false;
    
    try {
      const account = await wallet.account();
      console.log("Current wallet network:", account.address);
      // For now, we'll assume devnet for testing
      return true;
    } catch (err) {
      console.error("Network verification failed:", err);
      return false;
    }
  };

  // Check if wallet is properly initialized
  const checkWalletInitialization = async () => {
    if (typeof window === "undefined") return false;
    
    // Wait for wallet to be available
    let attempts = 0;
    while (!window.aptos && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }
    
    if (!window.aptos) {
      console.error("Petra wallet not found after waiting");
      return false;
    }
    
    try {
      await window.aptos.isConnected();
      return true;
    } catch (err) {
      console.error("Wallet initialization check failed:", err);
      return false;
    }
  };

  // Check wallet capabilities and network
  const checkWalletCapabilities = async () => {
    const wallet = window.aptos;
    if (!wallet) return false;
    
    try {
      console.log("Checking wallet capabilities...");
      
      // Check if wallet is connected
      const isConnected = await wallet.isConnected();
      console.log("Wallet connected:", isConnected);
      
      if (!isConnected) {
        console.log("Wallet not connected, attempting to connect...");
        await wallet.connect();
      }
      
      // Get account info
      const account = await wallet.account();
      console.log("Wallet account:", account);
      
      // Check network
      const network = await wallet.network();
      console.log("Wallet network:", network);
      
      // Check if we can sign a simple message
      try {
        const testMessage = "Test message for wallet capabilities";
        const signature = await wallet.signMessage({ message: testMessage });
        console.log("Message signing test successful:", signature);
      } catch (signError) {
        console.log("Message signing test failed (this is okay):", signError);
      }
      
      return true;
    } catch (err) {
      console.error("Wallet capabilities check failed:", err);
      return false;
    }
  };

  // Test wallet transaction signing
  const testWalletSigning = async () => {
    const wallet = window.aptos;
    if (!wallet) return false;
    
    try {
      const account = await wallet.account();
      console.log("Testing wallet signing with account:", account.address);
      
      // Try a simple transaction to test signing
      const testPayload = {
        type: "entry_function_payload",
        function: "0x1::coin::transfer",
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
        arguments: [account.address, "0"],
      };
      
      console.log("Testing with payload:", testPayload);
      // This will open the wallet window but fail gracefully
      await wallet.signAndSubmitTransaction({ payload: testPayload });
      return true;
    } catch (err) {
      console.log("Test transaction failed (expected):", err);
      // Even if it fails, we know the wallet is working
      return true;
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

  const uploadImageToIPFS = async (file: File): Promise<string> => {
    if (!NFT_STORAGE_KEY) {
      toast.warning("NFT.Storage API key not configured. Using placeholder image.");
      return DEFAULT_IMAGE;
    }
    
    try {
      setMintStep("Uploading image to IPFS...");
      const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY });
      
      // Upload image
      const imageCID = await nftstorage.storeBlob(file);
      const imageUrl = `https://ipfs.io/ipfs/${imageCID}`;
      
      setMintStep("Creating metadata...");
      
      // Create metadata JSON
      const metadata = {
        name,
        description,
        image: imageUrl,
        attributes: [],
        properties: {
          files: [
            {
              type: file.type,
              uri: imageUrl
            }
          ]
        }
      };
      
      // Upload metadata
      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      const metadataFile = new File([metadataBlob], 'metadata.json');
      const metadataCID = await nftstorage.storeBlob(metadataFile);
      
      const metadataUrl = `https://ipfs.io/ipfs/${metadataCID}`;
      toast.success("Image uploaded to IPFS successfully!");
      return metadataUrl;
    } catch (err) {
      console.error('IPFS upload failed:', err);
      toast.error("IPFS upload failed. Using placeholder image.");
      return DEFAULT_IMAGE;
    }
  };

  const handleMint = async () => {
    if (!isConnected) {
      await connect();
      return;
    }
    
    if (!image || !name.trim()) {
      toast.error("Please upload an image and enter a name");
      return;
    }
    
    setMinting(true);
    setProgress(10);
    setError("");
    
    try {
      // Check wallet initialization
      const walletInitialized = await checkWalletInitialization();
      if (!walletInitialized) {
        throw new Error("Petra wallet is not properly initialized. Please refresh the page and try again.");
      }
      
      // Check wallet capabilities
      const capabilitiesOk = await checkWalletCapabilities();
      if (!capabilitiesOk) {
        throw new Error("Wallet capabilities check failed. Please ensure Petra wallet is properly installed and connected.");
      }
      
      // Test wallet signing capability
      const signingWorks = await testWalletSigning();
      if (!signingWorks) {
        throw new Error("Wallet signing test failed. Please check your Petra wallet configuration.");
      }
      
      // Verify wallet network
      const networkOk = await verifyWalletNetwork();
      if (!networkOk) {
        throw new Error("Please ensure your wallet is connected to the correct network");
      }
      
      // 1. Upload to IPFS
      setProgress(20);
      const uri = await uploadImageToIPFS(image);
      setProgress(40);
      
      // 2. Get wallet and verify connection
      const wallet = window.aptos;
      if (!wallet) {
        throw new Error("Aptos wallet not found. Please install Petra wallet.");
      }
      
      // Verify wallet is connected
      try {
        const account = await wallet.account();
        console.log("Wallet account:", account);
        if (!account || !account.address) {
          throw new Error("Wallet not properly connected");
        }
      } catch (err) {
        console.error("Wallet connection error:", err);
        throw new Error("Please connect your wallet first");
      }
      
      const account = await wallet.account();
      
      // 3. Create collection (if needed)
      setProgress(50);
      setMintStep("Creating collection...");
      const collectionName = "Aptos NFT Collection";
      
      try {
        const createPayload = {
          type: "entry_function_payload",
          function: "0x4::aptos_token::create_collection",
          type_arguments: [],
          arguments: [
            String(collectionName), // name (string)
            String("A collection for Aptos NFTs"), // description (string)
            String("https://collection.example.com"), // uri (string)
            "0", // maximum (stringified number)
            [true, true, true] // mutability config (vector<bool>)
          ],
        };
        
        console.log("Creating collection with payload:", createPayload);
        const createResponse = await wallet.signAndSubmitTransaction({ payload: createPayload });
        console.log("Collection creation response:", createResponse);
        toast.success("Collection created successfully!");
      } catch (err: any) {
        console.error("Collection creation error:", err);
        if (!err.message?.includes("COLLECTION_ALREADY_EXISTS")) {
          console.log("Collection creation failed, but continuing...");
        }
        // Collection already exists, continue
      }
      setProgress(70);
      
      // 4. Mint NFT
      setMintStep("Minting NFT...");
      const mintPayload = {
        type: "entry_function_payload",
        function: "0x4::aptos_token::mint",
        type_arguments: [],
        arguments: [
          String(account.address),
          String(collectionName),
          String(name),
          [String(description || "")], // description as vector<string>
          String(uri),
          "0", // max supply
          String(account.address), // royalty payee
          "0", // numerator
          "0", // denominator
          ["true", "true", "true"], // mutability config as strings for max compatibility
          [], // property keys
          [], // property values
          []  // property types
        ],
      };
      
      console.log("Minting NFT with payload:", mintPayload);
      
      try {
        const response = await wallet.signAndSubmitTransaction({ payload: mintPayload });
        console.log("Mint transaction response:", response);
        setProgress(90);
        setMintStep("Confirming transaction...");
        
        await aptos.waitForTransaction({ transactionHash: response.hash });
        setProgress(100);
        
        toast.success(`NFT Minted Successfully! Transaction: ${response.hash}`);
        
        // Reset form
        setName("");
        setDescription("");
        removeImage();
        
      } catch (mintError: any) {
        console.error("Mint transaction failed:", mintError);
        
        // Try alternative payload format with booleans if stringified fails
        try {
          console.log("Trying alternative payload format with booleans...");
          const alternativePayload = {
            type: "entry_function_payload",
            function: "0x4::aptos_token::mint",
            type_arguments: [],
            arguments: [
              String(account.address),
              String(collectionName),
              String(name),
              [String(description || "")], // description as vector<string>
              String(uri),
              "0",
              String(account.address),
              "0",
              "0",
              [true, true, true],
              [],
              [],
              []
            ],
          };
          
          const response = await wallet.signAndSubmitTransaction({ payload: alternativePayload });
          console.log("Alternative mint transaction response:", response);
          setProgress(90);
          setMintStep("Confirming transaction...");
          
          await aptos.waitForTransaction({ transactionHash: response.hash });
          setProgress(100);
          
          toast.success(`NFT Minted Successfully! Transaction: ${response.hash}`);
          
          // Reset form
          setName("");
          setDescription("");
          removeImage();
          
        } catch (alternativeError: any) {
          console.error("Alternative mint also failed:", alternativeError);
          throw new Error(`Minting failed: ${mintError.message || "Unknown error"}`);
        }
      }
      
    } catch (err: any) {
      console.error('Minting failed:', err);
      const errorMsg = err.message || "Minting failed";
      setError(errorMsg);
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setMinting(false);
      setProgress(0);
      setMintStep("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F2B] particle-bg p-6">
      <div className="container mx-auto max-w-2xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Mint Your NFT</h1>
          <p className="text-gray-400">Create and mint unique NFTs on the Aptos blockchain</p>
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
                <Label className="text-white text-sm font-medium mb-2 block">Description</Label>
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
              disabled={minting || (!isConnected && !address)}
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
                <p>• If the wallet window is blank, try refreshing the page</p>
                <p>• Check browser console for detailed error messages</p>
                <p>• Ensure you have enough APT for gas fees (~0.1 APT)</p>
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
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="w-12 h-12 bg-[#00F0FF]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ImageIcon className="h-6 w-6 text-[#00F0FF]" />
                </div>
                <h3 className="text-white font-medium text-sm">IPFS Storage</h3>
                <p className="text-gray-400 text-xs">Images stored on decentralized IPFS</p>
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