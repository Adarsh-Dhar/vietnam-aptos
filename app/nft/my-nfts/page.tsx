'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/components/wallet/wallet-provider";
import { Image as ImageIcon, ExternalLink, Copy, Eye, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface NFT {
  id: string;
  collectionName: string;
  collectionDescription: string;
  tokenName: string;
  tokenDescription: string | null;
  imageUrl: string | null;
  collectionTxHash: string | null;
  mintTxHash: string | null;
  status: string;
  createdAt: string;
  creator: {
    id: string;
    aptosAddress: string;
    username: string | null;
  };
}

export default function MyNFTsPage() {
  const { isConnected, address } = useWallet();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authStatus, setAuthStatus] = useState<'disconnected' | 'wallet_only' | 'authenticated'>('disconnected');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  // Add debug log
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setDebugLogs(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  // Authenticate user and get JWT token
  const authenticateUser = async () => {
    try {
      addDebugLog('🔐 Starting user authentication...');
      
      if (!isConnected || !address) {
        addDebugLog('❌ Wallet not connected');
        throw new Error('Please connect your wallet first');
      }

      addDebugLog(`✅ Wallet connected: ${address}`);

      // Check if we already have a valid token
      const existingToken = localStorage.getItem('authToken');
      if (existingToken) {
        addDebugLog('✅ Existing authentication token found');
        return existingToken;
      }

      addDebugLog('📡 Requesting authentication token...');
      
      // Create a simple signature for authentication
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
        addDebugLog(`❌ Authentication failed: ${errorData.error}`);
        throw new Error(errorData.error || 'Authentication failed');
      }

      const { token, user } = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('authToken', token);
      addDebugLog(`✅ Authentication successful for user: ${user.aptosAddress}`);
      
      return token;
    } catch (error) {
      addDebugLog(`❌ Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  // Auto-authenticate on page load
  useEffect(() => {
    const autoAuthenticate = async () => {
      try {
        // Wait a bit for wallet to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (isConnected && address) {
          addDebugLog('🔄 Auto-authenticating wallet on page load...');
          
          // Check if we already have a valid token
          const existingToken = localStorage.getItem('authToken');
          if (existingToken) {
            addDebugLog('✅ Existing authentication token found');
            setAuthStatus('authenticated');
            return;
          }
          
          // Try to authenticate
          await authenticateUser();
          setAuthStatus('authenticated');
          addDebugLog('✅ Auto-authentication successful');
        } else {
          setAuthStatus('disconnected');
          addDebugLog('❌ Wallet not connected for auto-authentication');
        }
      } catch (error) {
        setAuthStatus('wallet_only');
        addDebugLog(`❌ Auto-authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  const fetchNFTs = async () => {
    try {
      addDebugLog('📡 Fetching NFTs from database...');
      
      // First ensure we're authenticated
      const token = await authenticateUser();
      addDebugLog('✅ Authentication confirmed for NFT fetch');
      
      const response = await fetch('/api/nft/save', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      addDebugLog(`📥 NFT fetch response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json();
        addDebugLog(`❌ NFT fetch failed: ${errorData.error || 'Unknown error'}`);
        throw new Error(errorData.error || 'Failed to fetch NFTs');
      }

      const data = await response.json();
      addDebugLog(`✅ NFTs fetched successfully: ${data.nfts?.length || 0} NFTs found`);
      setNfts(data.nfts || []);
    } catch (err: any) {
      console.error('Error fetching NFTs:', err);
      addDebugLog(`❌ Error fetching NFTs: ${err.message}`);
      setError(err.message || 'Failed to fetch NFTs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchNFTs();
    } else {
      setLoading(false);
    }
  }, [isConnected]);

  // Fetch NFTs when authentication is successful
  useEffect(() => {
    if (authStatus === 'authenticated') {
      addDebugLog('🔄 Authentication successful, fetching NFTs...');
      fetchNFTs();
    }
  }, [authStatus]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'MINTED':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'MINTING':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'FAILED':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0A0F2B] particle-bg p-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-white mb-4">My NFTs</h1>
            <p className="text-gray-400 mb-8">Connect your wallet to view your minted NFTs</p>
            <Button 
              onClick={() => window.location.href = '/nft'}
              className="bg-gradient-to-r from-[#00F0FF] to-[#8B5CF6] hover:from-[#00F0FF]/80 hover:to-[#8B5CF6]/80"
            >
              Go to NFT Minting
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F2B] particle-bg p-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">My NFTs</h1>
          <p className="text-gray-400">View and manage your minted NFTs</p>
        </motion.div>

        {/* Authentication Status */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="glass-card p-4">
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
          </Card>
        </motion.div>

        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F0FF] mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading your NFTs...</p>
          </motion.div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={fetchNFTs} variant="outline">
              Try Again
            </Button>
          </motion.div>
        ) : nfts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-white text-xl font-medium mb-2">No NFTs Found</h3>
            <p className="text-gray-400 mb-6">You haven't minted any NFTs yet</p>
            <Button 
              onClick={() => window.location.href = '/nft'}
              className="bg-gradient-to-r from-[#00F0FF] to-[#8B5CF6] hover:from-[#00F0FF]/80 hover:to-[#8B5CF6]/80"
            >
              Mint Your First NFT
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {nfts.map((nft, index) => (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card overflow-hidden hover:shadow-lg transition-all duration-300">
                  {/* NFT Image */}
                  <div className="relative h-48 bg-gradient-to-br from-[#00F0FF]/10 to-[#8B5CF6]/10">
                    {nft.imageUrl ? (
                      <img 
                        src={nft.imageUrl} 
                        alt={nft.tokenName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <Badge 
                      className={`absolute top-3 right-3 ${getStatusColor(nft.status)}`}
                    >
                      {nft.status}
                    </Badge>
                  </div>

                  {/* NFT Details */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-white font-semibold text-lg mb-1">{nft.tokenName}</h3>
                      <p className="text-gray-400 text-sm mb-2">{nft.collectionName}</p>
                      {nft.tokenDescription && (
                        <p className="text-gray-300 text-sm line-clamp-2">{nft.tokenDescription}</p>
                      )}
                    </div>

                    {/* Transaction Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Minted:</span>
                        <span className="text-white">{formatDate(nft.createdAt)}</span>
                      </div>
                      
                      {nft.mintTxHash && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Mint TX:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-[#00F0FF] font-mono">
                              {nft.mintTxHash.slice(0, 8)}...{nft.mintTxHash.slice(-6)}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(nft.mintTxHash!)}
                              className="h-4 w-4 p-0 text-gray-400 hover:text-white"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {nft.mintTxHash && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`https://explorer.aptoslabs.com/txn/${nft.mintTxHash}`, '_blank')}
                          className="flex-1 text-xs"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View on Explorer
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/nft/${nft.id}`, '_blank')}
                        className="flex-1 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Debug Logs Display */}
        {debugLogs.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium text-sm">Debug Logs</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDebugLogs([])}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  Clear
                </Button>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {debugLogs.map((log, index) => (
                  <div key={index} className="text-xs font-mono">
                    <span className="text-gray-400">{log}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Stats */}
        {nfts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Card className="glass-card p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{nfts.length}</div>
                  <div className="text-gray-400 text-sm">Total NFTs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {nfts.filter(nft => nft.status === 'MINTED').length}
                  </div>
                  <div className="text-gray-400 text-sm">Successfully Minted</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {nfts.filter(nft => nft.status === 'MINTING').length}
                  </div>
                  <div className="text-gray-400 text-sm">In Progress</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">
                    {nfts.filter(nft => nft.status === 'FAILED').length}
                  </div>
                  <div className="text-gray-400 text-sm">Failed</div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
} 