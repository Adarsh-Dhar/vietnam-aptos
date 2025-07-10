'use client';

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Upload, Image as ImageIcon, Zap } from "lucide-react";

export default function NFTLoading() {
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
            {/* Loading Image Upload Section */}
            <div className="mb-8">
              <div className="text-white text-sm font-medium mb-4 block">NFT Image *</div>
              <div className="relative w-64 h-64 mx-auto rounded-xl overflow-hidden border-2 border-dashed border-white/20">
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Upload size={48} />
                  </motion.div>
                  <p className="mt-2 text-sm">Loading...</p>
                </div>
              </div>
            </div>

            {/* Loading Form Fields */}
            <div className="space-y-6 mb-8">
              <div>
                <div className="text-white text-sm font-medium mb-2 block">NFT Name *</div>
                <div className="h-10 bg-white/5 border border-white/20 rounded-md animate-pulse"></div>
              </div>
              
              <div>
                <div className="text-white text-sm font-medium mb-2 block">Description</div>
                <div className="h-24 bg-white/5 border border-white/20 rounded-md animate-pulse"></div>
              </div>
            </div>

            {/* Loading Button */}
            <div className="w-full h-12 bg-gradient-to-r from-[#00F0FF]/20 to-[#8B5CF6]/20 rounded-lg animate-pulse"></div>

            {/* Loading Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="w-12 h-12 bg-white/10 rounded-full mx-auto mb-2 animate-pulse"></div>
                  <div className="h-4 bg-white/10 rounded mx-auto mb-2 animate-pulse"></div>
                  <div className="h-3 bg-white/5 rounded mx-auto animate-pulse"></div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 