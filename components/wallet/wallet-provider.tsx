"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { AptosClient } from "aptos"

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

const PETRA_INSTALL_URL = "https://petra.app/"
const APTOS_NODE = {
  devnet: "https://fullnode.devnet.aptoslabs.com/v1",
  mainnet: "https://fullnode.mainnet.aptoslabs.com/v1",
}

function getAptosWallet() {
  if (typeof window !== "undefined" && "aptos" in window) {
    return (window as any).aptos
  } else {
    window.open(PETRA_INSTALL_URL, "_blank")
    return null
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [network, setNetwork] = useState<"devnet" | "mainnet">("devnet")
  const [balance, setBalance] = useState(0)

  const fetchBalance = async (address: string, network: "devnet" | "mainnet") => {
    try {
      const client = new AptosClient(APTOS_NODE[network])
      const resources = await client.getAccountResources(address)
      const coin = resources.find((r: any) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>")
      if (coin) {
        // @ts-ignore
        setBalance(Number(coin.data.coin.value) / 1e8)
      } else {
        setBalance(0)
      }
    } catch (error) {
      setBalance(0)
    }
  }

  const connect = async () => {
    const wallet = getAptosWallet()
    if (!wallet) return
    try {
      await wallet.connect()
      const account = await wallet.account()
      setIsConnected(true)
      setAddress(account.address)
      await fetchBalance(account.address, network)
    } catch (error) {
      setIsConnected(false)
      setAddress(null)
      setBalance(0)
    }
  }

  const disconnect = async () => {
    const wallet = getAptosWallet()
    if (wallet) {
      try {
        await wallet.disconnect()
      } catch {}
    }
    setIsConnected(false)
    setAddress(null)
    setBalance(0)
  }

  const switchNetwork = (newNetwork: "devnet" | "mainnet") => {
    setNetwork(newNetwork)
    if (isConnected && address) {
      fetchBalance(address, newNetwork)
    }
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
