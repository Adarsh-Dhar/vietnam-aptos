"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";
import { buyMemecoin } from '@/lib/contract';

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
  createdAt: string;
  creator: {
    id: string;
    aptosAddress: string;
    username?: string;
  };
}

export default function BuyMemecoinPage() {
  const [memecoins, setMemecoins] = useState<Memecoin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMemecoins() {
      setLoading(true);
      try {
        console.log('🔄 Fetching memecoins from /api/memecoin/all...');
        const res = await fetch("/api/memecoin/all");
        const data = await res.json();
        console.log('📥 Raw API response:', data);
        console.log('📊 Memecoins array:', data.memecoins);
        console.log('📈 Number of memecoins:', data.memecoins?.length || 0);
        
        if (data.memecoins && Array.isArray(data.memecoins)) {
          console.log('✅ Setting memecoins state with', data.memecoins.length, 'items');
          setMemecoins(data.memecoins);
        } else {
          console.log('❌ No memecoins array in response or not an array');
          setMemecoins([]);
        }
      } catch (err) {
        console.error('❌ Error fetching memecoins:', err);
        setMemecoins([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMemecoins();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Buy Memecoins</h1>
          <p className="text-gray-400">Browse and buy memecoins deployed on Aptos</p>
        </div>
        
        {/* Debug Info */}
        <div className="mb-4 p-4 bg-gray-800 rounded-lg">
          <div className="text-white text-sm">
            <div>Loading: {loading ? 'Yes' : 'No'}</div>
            <div>Memecoins count: {memecoins.length}</div>
            <div>Memecoins: {JSON.stringify(memecoins.map(m => ({ id: m.id, name: m.coinName, symbol: m.coinSymbol })))}</div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center text-white">Loading memecoins...</div>
        ) : memecoins.length === 0 ? (
          <div className="text-center text-gray-400">No memecoins available yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {memecoins.map((coin) => (
              <Card key={coin.id} className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {coin.logoUrl && (
                      <img src={coin.logoUrl} alt={coin.coinName} className="w-12 h-12 rounded-full border border-gray-700 bg-gray-800 object-cover" />
                    )}
                    <div>
                      <CardTitle className="text-white text-lg">{coin.coinName}</CardTitle>
                      <CardDescription className="text-purple-400 font-mono">{coin.coinSymbol}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-gray-300 text-sm min-h-[40px]">{coin.coinDescription || "No description."}</div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                    <span>Total Supply: <span className="text-white">{coin.totalSupply}</span></span>
                    {coin.currentPrice && <span>Price: <span className="text-green-400">{coin.currentPrice} APT</span></span>}
                    <span>Holders: <span className="text-white">{coin.holders}</span></span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      className="bg-purple-600 hover:bg-purple-700 w-full flex items-center justify-center"
                      size="sm"
                      onClick={async () => {
                        try {
                          const amountStr = window.prompt(`Enter amount of ${coin.coinSymbol} to buy:`);
                          if (!amountStr) return;
                          const amount = parseInt(amountStr, 10);
                          if (isNaN(amount) || amount <= 0) {
                            alert('Invalid amount');
                            return;
                          }
                          // Use deployTxHash as the memecoin address for now
                          const memecoinAddress = coin.deployTxHash;
                          if (!memecoinAddress) {
                            alert('Memecoin address not available');
                            return;
                          }
                          const txHash = await buyMemecoin({ memecoinAddress, amount, onResult: (hash) => console.log('Buy Memecoin Tx Hash:', hash) });
                          console.log('Buy Memecoin Transaction Details:', { txHash, memecoinAddress, amount });
                          alert(`Transaction submitted! Tx Hash: ${txHash}`);
                        } catch (err) {
                          console.error('Buy memecoin error:', err);
                          alert('Failed to buy memecoin: ' + (err instanceof Error ? err.message : String(err)));
                        }
                      }}
                    >
                      <Coins className="h-4 w-4 mr-1" /> Buy
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
