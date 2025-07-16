"use client";

import { useState } from "react";
import { getSimpleHolderCount, getHolderCountByAccount, getAccountTokens } from "@/lib/oracle";
import { Network } from "@aptos-labs/ts-sdk";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Users, Coins, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface HolderCountResult {
  holderCount: number;
  totalTokens: number;
  uniqueHolders: string[];
  error?: string;
}

export default function NFTHolderCounter() {
  const [accountAddress, setAccountAddress] = useState("");
  const [collectionAddress, setCollectionAddress] = useState("");
  const [network, setNetwork] = useState<Network>(Network.MAINNET);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<HolderCountResult | null>(null);
  const [accountTokens, setAccountTokens] = useState<any[]>([]);

  const handleGetHolderCount = async () => {
    if (!accountAddress || !collectionAddress) {
      toast.error("Please enter both account and collection addresses");
      return;
    }

    setLoading(true);
    try {
      const holderCount = await getSimpleHolderCount(accountAddress, collectionAddress, network);
      
      setResults({
        holderCount,
        totalTokens: accountTokens.length,
        uniqueHolders: [],
        error: undefined
      });

      toast.success(`Found ${holderCount} unique holders`);
    } catch (error) {
      console.error("Error:", error);
      setResults({
        holderCount: 0,
        totalTokens: 0,
        uniqueHolders: [],
        error: error instanceof Error ? error.message : "Unknown error"
      });
      toast.error("Failed to get holder count");
    } finally {
      setLoading(false);
    }
  };

  const handleGetAccountTokens = async () => {
    if (!accountAddress) {
      toast.error("Please enter an account address");
      return;
    }

    setLoading(true);
    try {
      const tokens = await getAccountTokens(accountAddress, network);
      setAccountTokens(tokens);
      toast.success(`Found ${tokens.length} tokens for this account`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to get account tokens");
    } finally {
      setLoading(false);
    }
  };

  const handleGetDetailedHolderCount = async () => {
    if (!accountAddress || !collectionAddress) {
      toast.error("Please enter both account and collection addresses");
      return;
    }

    setLoading(true);
    try {
      const result = await getHolderCountByAccount(accountAddress, collectionAddress, network);
      setResults(result);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Found ${result.holderCount} unique holders with ${result.totalTokens} total tokens`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to get detailed holder count");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Aptos NFT Holder Counter
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Get real-time holder counts for any NFT collection on Aptos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            NFT Holder Analysis
          </CardTitle>
          <CardDescription>
            Enter account and collection addresses to analyze holder data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account">Account Address</Label>
              <Input
                id="account"
                placeholder="0x..."
                value={accountAddress}
                onChange={(e) => setAccountAddress(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collection">Collection Address</Label>
              <Input
                id="collection"
                placeholder="0x..."
                value={collectionAddress}
                onChange={(e) => setCollectionAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="network">Network</Label>
            <Select value={network} onValueChange={(value) => setNetwork(value as Network)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Network.MAINNET}>Mainnet</SelectItem>
                <SelectItem value={Network.TESTNET}>Testnet</SelectItem>
                <SelectItem value={Network.DEVNET}>Devnet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleGetAccountTokens}
              disabled={loading || !accountAddress}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Coins className="h-4 w-4" />
              )}
              Get Account Tokens
            </Button>
            
            <Button 
              onClick={handleGetHolderCount}
              disabled={loading || !accountAddress || !collectionAddress}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Users className="h-4 w-4" />
              )}
              Get Simple Holder Count
            </Button>
            
            <Button 
              onClick={handleGetDetailedHolderCount}
              disabled={loading || !accountAddress || !collectionAddress}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              Get Detailed Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Display */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {results.error ? (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{results.error}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {results.holderCount}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Unique Holders</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {results.totalTokens}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">Total Tokens</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {results.uniqueHolders.length}
                  </div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">Holder Addresses</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Account Tokens Display */}
      {accountTokens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Account Tokens ({accountTokens.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {accountTokens.map((token, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm font-medium">
                    Token: {token.token_name || "Unknown"}
                  </div>
                  <div className="text-xs text-gray-500">
                    Owner: {token.owner_address}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 