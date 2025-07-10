"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { Aptos, AptosConfig, Network, NetworkToNetworkName } from "@aptos-labs/ts-sdk"

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
      const aptosNetwork = network === "devnet" ? Network.DEVNET : Network.MAINNET
      const config = new AptosConfig({ network: aptosNetwork })
      const aptos = new Aptos(config)
      
      const account = await aptos.getAccountInfo({ accountAddress: address })
      const resources = await aptos.getAccountResources({ accountAddress: address })
      
      const coinResource = resources.find((r: any) => 
        r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
      )
      
      if (coinResource && coinResource.data && typeof coinResource.data === 'object' && 'coin' in coinResource.data) {
        setBalance(Number((coinResource.data as any).coin.value) / 1e8)
      } else {
        setBalance(0)
      }
    } catch (error) {
      console.error("Error fetching balance:", error)
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
      console.error("Connection error:", error)
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
