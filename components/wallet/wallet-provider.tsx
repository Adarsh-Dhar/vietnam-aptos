"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface WalletContextType {
  isConnected: boolean
  address: string | null
  network: "devnet" | "mainnet"
  balance: number
  connect: () => Promise<void>
  disconnect: () => void
  switchNetwork: (network: "devnet" | "mainnet") => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [network, setNetwork] = useState<"devnet" | "mainnet">("devnet")
  const [balance, setBalance] = useState(0)

  const connect = async () => {
    try {
      // Simulate wallet connection
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsConnected(true)
      setAddress("0x1234...5678")
      setBalance(100.5)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setAddress(null)
    setBalance(0)
  }

  const switchNetwork = (newNetwork: "devnet" | "mainnet") => {
    setNetwork(newNetwork)
  }

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        network,
        balance,
        connect,
        disconnect,
        switchNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
