"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "./wallet-provider"
import { Wallet, Zap } from "lucide-react"

export function WalletConnector() {
  const { isConnected, address, network, balance, connect, disconnect, switchNetwork } = useWallet()

  if (isConnected) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-3 glass-card p-3 rounded-lg"
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-300">{address}</span>
        </div>

        <Badge
          variant="outline"
          className="border-[#00F0FF]/50 text-[#00F0FF]"
          onClick={() => switchNetwork(network === "devnet" ? "mainnet" : "devnet")}
        >
          {network}
        </Badge>

        <div className="text-sm text-white font-medium">{balance} APT</div>

        <Button size="sm" variant="ghost" onClick={disconnect} className="text-gray-400 hover:text-white">
          Disconnect
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        size="lg"
        onClick={connect}
        className="bg-gradient-to-r from-[#00F0FF] to-[#8B5CF6] hover:from-[#00F0FF]/80 hover:to-[#8B5CF6]/80 text-white font-semibold group"
      >
        <Wallet className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
        Connect Petra Wallet
        <Zap className="ml-2 h-4 w-4 animate-pulse" />
      </Button>
    </motion.div>
  )
}
