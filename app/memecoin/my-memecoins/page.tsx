"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Coins, TrendingUp, Users, AlertCircle } from "lucide-react";

interface Memecoin {
  id: string;
  coinName: string;
  coinSymbol: string;
  coinDescription?: string;
  totalSupply: string;
  currentPrice?: number;
  marketCap?: number;
  holders: number;
  status: string;
  logoUrl?: string;
  websiteUrl?: string;
  telegramUrl?: string;
  twitterUrl?: string;
  deployTxHash?: string;
  createdAt: Date;
}

export default function MyMemecoinsPage() {
  const [memecoins, setMemecoins] = useState<Memecoin[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockMemecoins: Memecoin[] = [
      {
        id: "1",
        coinName: "Doge Clone",
        coinSymbol: "DOGECLONE",
        coinDescription: "The next big meme coin on Aptos",
        totalSupply: "1000000000000",
        currentPrice: 0.0001,
        marketCap: 100000,
        holders: 150,
        status: "DEPLOYED",
        logoUrl: "https://example.com/logo1.png",
        websiteUrl: "https://dogecoin.com",
        telegramUrl: "https://t.me/dogecoin",
        twitterUrl: "https://twitter.com/dogecoin",
        deployTxHash: "0x1234567890abcdef",
        createdAt: new Date()
      },
      {
        id: "2",
        coinName: "Pepe Token",
        coinSymbol: "PEPE",
        coinDescription: "Rare pepe token",
        totalSupply: "500000000000",
        currentPrice: 0.0002,
        marketCap: 50000,
        holders: 75,
        status: "TRADING",
        logoUrl: "https://example.com/logo2.png",
        websiteUrl: "https://pepe.com",
        telegramUrl: "https://t.me/pepe",
        twitterUrl: "https://twitter.com/pepe",
        deployTxHash: "0xabcdef1234567890",
        createdAt: new Date()
      }
    ];

    setTimeout(() => {
      setMemecoins(mockMemecoins);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DEPLOYING':
        return 'bg-yellow-500';
      case 'DEPLOYED':
        return 'bg-green-500';
      case 'TRADING':
        return 'bg-blue-500';
      case 'FAILED':
        return 'bg-red-500';
      case 'PAUSED':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DEPLOYING':
        return 'Deploying';
      case 'DEPLOYED':
        return 'Deployed';
      case 'TRADING':
        return 'Trading';
      case 'FAILED':
        return 'Failed';
      case 'PAUSED':
        return 'Paused';
      default:
        return 'Unknown';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + 'B';
    }
    if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + 'M';
    }
    if (num >= 1e3) {
      return (num / 1e3).toFixed(2) + 'K';
    }
    return num.toString();
  };

  const formatPrice = (price: number) => {
    if (price < 0.0001) {
      return price.toExponential(4);
    }
    if (price < 0.01) {
      return price.toFixed(6);
    }
    if (price < 1) {
      return price.toFixed(4);
    }
    return price.toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-gray-400 mt-4">Loading your memecoins...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Memecoins</h1>
          <p className="text-gray-400">View and manage your deployed memecoins</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Memecoins</p>
                  <p className="text-2xl font-bold text-white">{memecoins.length}</p>
                </div>
                <Coins className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Deployed</p>
                  <p className="text-2xl font-bold text-white">
                    {memecoins.filter(memecoin => memecoin.status === 'DEPLOYED').length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Trading</p>
                  <p className="text-2xl font-bold text-white">
                    {memecoins.filter(memecoin => memecoin.status === 'TRADING').length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Failed</p>
                  <p className="text-2xl font-bold text-white">
                    {memecoins.filter(memecoin => memecoin.status === 'FAILED').length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Memecoins Grid */}
        {memecoins.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-white text-xl font-medium mb-2">No Memecoins Found</h3>
                <p className="text-gray-400 mb-6">You haven't deployed any memecoins yet</p>
                <Button 
                  onClick={() => window.location.href = '/memecoin'}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Coins className="h-4 w-4 mr-2" />
                  Deploy Your First Memecoin
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memecoins.map((memecoin) => (
              <Card key={memecoin.id} className="bg-gray-800/50 border-gray-700 hover:border-purple-500 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {memecoin.logoUrl ? (
                        <img
                          src={memecoin.logoUrl}
                          alt={memecoin.coinName}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                          <Coins className="h-6 w-6 text-white" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-white font-semibold text-lg">{memecoin.coinName}</h3>
                        <p className="text-gray-400 text-sm">{memecoin.coinSymbol}</p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(memecoin.status)}`}>
                      {getStatusText(memecoin.status)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {memecoin.coinDescription && (
                    <p className="text-gray-300 text-sm line-clamp-2">{memecoin.coinDescription}</p>
                  )}

                  {/* Price and Market Data */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <p className="text-gray-400 text-xs">Current Price</p>
                      <p className="text-white font-semibold">
                        {memecoin.currentPrice ? `$${formatPrice(memecoin.currentPrice)}` : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <p className="text-gray-400 text-xs">Market Cap</p>
                      <p className="text-white font-semibold">
                        {memecoin.marketCap ? `$${formatNumber(memecoin.marketCap)}` : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <p className="text-gray-400 text-xs">Holders</p>
                      <p className="text-white font-semibold">
                        {formatNumber(memecoin.holders)}
                      </p>
                    </div>
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <p className="text-gray-400 text-xs">Total Supply</p>
                      <p className="text-white font-semibold">
                        {formatNumber(parseInt(memecoin.totalSupply))}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-3 border-t border-gray-700">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => toast.info("View details feature coming soon!")}
                    >
                      <Coins className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 