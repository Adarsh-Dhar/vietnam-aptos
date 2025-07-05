"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { WalletConnector } from "@/components/wallet/wallet-connector"
import { useWallet } from "@/components/wallet/wallet-provider"
import { Zap, User, Building2, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/", icon: null },
  { name: "Dashboard", href: "/dashboard", icon: TrendingUp },
  { name: "Founders", href: "/founders", icon: Building2 },
  { name: "Investors", href: "/investors", icon: User },
]

export function Navbar() {
  const pathname = usePathname()
  const { isConnected } = useWallet()

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10 backdrop-blur-xl"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-8 h-8 bg-gradient-to-r from-[#00F0FF] to-[#8B5CF6] rounded-lg flex items-center justify-center"
            >
              <Zap className="h-5 w-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#00F0FF] to-white bg-clip-text text-transparent group-hover:from-white group-hover:to-[#00F0FF] transition-all duration-300">
              ValidateX
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2",
                      isActive
                        ? "bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30"
                        : "text-gray-300 hover:text-white hover:bg-white/10",
                    )}
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.name}</span>
                  </motion.div>
                </Link>
              )
            })}
          </div>

          {/* Right Side - Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected && (
              <Badge variant="outline" className="border-green-500/50 text-green-400 bg-green-500/10 animate-pulse">
                Connected
              </Badge>
            )}
            <WalletConnector />
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
