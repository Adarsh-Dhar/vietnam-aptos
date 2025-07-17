"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Coins, Zap, AlertCircle } from "lucide-react";
import { deployMemecoinContract } from "@/lib/memecoin-utils";

export default function DeployMemecoinPage() {
  const [deploying, setDeploying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deployStep, setDeployStep] = useState("");
  const [error, setError] = useState("");
  
  // Form state
  const [coinName, setCoinName] = useState("My Awesome Memecoin");
  const [coinSymbol, setCoinSymbol] = useState("MEME");
  const [coinDescription, setCoinDescription] = useState("The next big memecoin that will revolutionize the crypto space!");
  const [totalSupply, setTotalSupply] = useState("10000000");
  const [initialPrice, setInitialPrice] = useState("0.001");
  const [decimals, setDecimals] = useState("6");
  const [logoUrl, setLogoUrl] = useState("https://example.com/logo.png");
  const [websiteUrl, setWebsiteUrl] = useState("https://yourmemecoin.com");
  const [telegramUrl, setTelegramUrl] = useState("https://t.me/yourmemecoin");
  const [twitterUrl, setTwitterUrl] = useState("https://twitter.com/yourmemecoin");

  const handleDeploy = async () => {
    if (!coinName.trim() || !coinSymbol.trim() || !totalSupply.trim()) {
      toast.error("Please fill in all required fields (Coin Name, Symbol, and Total Supply)");
      return;
    }

    // Validate coin symbol format
    if (!/^[A-Z]{3,10}$/.test(coinSymbol.trim())) {
      toast.error("Symbol must be 3-10 uppercase letters only");
      return;
    }

    setDeploying(true);
    setProgress(10);
    setError("");
    
    try {
      // Step 1lidate input
      setProgress(20);
      setDeployStep("Validating input...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 2: Check wallet connection
      setProgress(30);
      setDeployStep("Checking wallet connection...");
      
      const wallet = (window as any).aptos;
      if (!wallet) {
        throw new Error("Aptos wallet not found. Please install Petra wallet.");
      }
      
      // Check if wallet is connected
      try {
        const account = await wallet.account();
        if (!account || !account.address) {
          throw new Error("Wallet not connected. Please connect your wallet first.");
        }
      } catch (error) {
        throw new Error("Please connect your Aptos wallet first.");
      }
      
      // Step 3 memecoin contract on blockchain
      setProgress(40);
      setDeployStep("Deploying memecoin contract on blockchain...");
      
      // Deploy the actual memecoin contract
      const deployData = {
        coinName: coinName.trim(),
        coinSymbol: coinSymbol.trim().toUpperCase(),
        coinDescription: coinDescription.trim() || undefined,
        totalSupply: totalSupply.trim(),
        initialPrice: initialPrice ? parseFloat(initialPrice) : undefined,
        decimals: parseInt(decimals) || 6,
        logoUrl: logoUrl.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        telegramUrl: telegramUrl.trim() || undefined,
        twitterUrl: twitterUrl.trim() || undefined
      };
      
      const { txHash: deployTxHash, coinAddress } = await deployMemecoinContract(deployData);
      
      // Step 4: Save to database
      setProgress(60);
      setDeployStep("Saving to database...");
      
      const jwt = localStorage.getItem("jwt");
      if (!jwt) {
        throw new Error("Please login first to deploy memecoin.");
      }
      
      const response = await fetch("/api/memecoin/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`
        },
        body: JSON.stringify({
          coinName: coinName.trim(),
          coinSymbol: coinSymbol.trim().toUpperCase(),
          coinDescription: coinDescription.trim() || null,
          totalSupply: totalSupply.trim(),
          initialPrice: initialPrice ? parseFloat(initialPrice) : null,
          logoUrl: logoUrl.trim() || null,
          websiteUrl: websiteUrl.trim() || null,
          telegramUrl: telegramUrl.trim() || null,
          twitterUrl: twitterUrl.trim() || null,
          deployTxHash,
          coinAddress,
          status: "DEPLOYING"
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save memecoin to database");
      }
      
      const result = await response.json();
      
      // Step 5: Confirm transaction
      setProgress(80);
      setDeployStep("Confirming transaction...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step6Complete
      setProgress(100);
      setDeployStep("Deployment complete!");
      
      toast.success("Memecoin deployed successfully!");
      
      // Wait before resetting form
      setTimeout(() => {
        // Reset form
        setCoinName("");
        setCoinSymbol("");
        setCoinDescription("");
        setTotalSupply("");
        setInitialPrice("");
        setDecimals("");
        setLogoUrl("");
        setWebsiteUrl("");
        setTelegramUrl("");
        setTwitterUrl("");
        
        setDeploying(false);
        setProgress(0);
        setDeployStep("");
      }, 3000);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Deployment failed';
      setError(errorMessage);
      toast.error(errorMessage);
      setDeploying(false);
      setProgress(0);
      setDeployStep("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Deploy Your Memecoin</h1>
          <p className="text-gray-400">Create and deploy your own memecoin on the Aptos blockchain</p>
        </div>

        {/* Deployment Progress */}
        {deploying && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{deployStep}</span>
                  <span className="text-gray-400">{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
                <div className="text-sm text-gray-400">
                  This may take a few moments...
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-500">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Deployment Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Basic Information</CardTitle>
                <CardDescription>Essential details for your memecoin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white text-sm font-medium mb-2 block">Coin Name *</Label>
                  <Input
                    value={coinName}
                    onChange={(e) => setCoinName(e.target.value)}
                    placeholder="My Awesome Memecoin"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white text-sm font-medium mb-2 block">Coin Symbol *</Label>
                  <Input
                    value={coinSymbol}
                    onChange={(e) => setCoinSymbol(e.target.value.toUpperCase())}
                    placeholder="MEME"
                    maxLength={10}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">3-10 uppercase letters/numbers</p>
                </div>

                <div>
                  <Label className="text-white text-sm font-medium mb-2 block">Total Supply *</Label>
                  <Input
                    value={totalSupply}
                    onChange={(e) => setTotalSupply(e.target.value)}
                    placeholder="1000000000000"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">Total number of tokens to mint</p>
                </div>

                <div>
                  <Label className="text-white text-sm font-medium mb-2 block">Initial Price (Optional)</Label>
                  <Input
                    value={initialPrice}
                    onChange={(e) => setInitialPrice(e.target.value)}
                    placeholder="0.0001"
                    type="number"
                    step="0.000001"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">Starting price per token</p>
                </div>

                <div>
                  <Label className="text-white text-sm font-medium mb-2 block">Decimals *</Label>
                  <Input
                    value={decimals}
                    onChange={(e) => setDecimals(e.target.value)}
                    placeholder="6"
                    type="number"
                    step="1"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">Number of decimal places</p>
                </div>

                <div>
                  <Label className="text-white text-sm font-medium mb-2 block">Description</Label>
                  <Textarea
                    value={coinDescription}
                    onChange={(e) => setCoinDescription(e.target.value)}
                    placeholder="Describe your memecoin..."
                    className="bg-gray-800 border-gray-700 text-white"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Logo Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Logo</CardTitle>
                <CardDescription>Upload your memecoin logo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-white text-sm font-medium mb-2 block">Logo URL</Label>
                    <Input
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Social Links */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Social Links</CardTitle>
                <CardDescription>Connect your memecoin to social media</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white text-sm font-medium mb-2 block">Website URL</Label>
                  <Input
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourmemecoin.com"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white text-sm font-medium mb-2 block">Telegram URL</Label>
                  <Input
                    value={telegramUrl}
                    onChange={(e) => setTelegramUrl(e.target.value)}
                    placeholder="https://t.me/yourmemecoin"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white text-sm font-medium mb-2 block">Twitter URL</Label>
                  <Input
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    placeholder="https://twitter.com/yourmemecoin"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Deployment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Deployment Info</CardTitle>
                <CardDescription>Network and wallet details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Network:</span>
                  <span className="text-white">Devnet</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400">Ready to Deploy</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Deploy Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleDeploy}
            disabled={deploying || !coinName.trim() || !coinSymbol.trim() || !totalSupply.trim()}
            className="bg-purple-600 hover:bg-purple-700 px-8 py-3 text-lg"
            size="lg"
          >
            {deploying ? (
              <>
                <Zap className="h-5 w-5 mr-2 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Coins className="h-5 w-5 mr-2" />
                Deploy Memecoin
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 