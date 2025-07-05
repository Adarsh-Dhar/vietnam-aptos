"use client"

import { motion } from "framer-motion"
import { HeroSection } from "@/components/landing/hero-section"
import { ValidationJourney } from "@/components/landing/validation-journey"
import { FeatureShowcase } from "@/components/landing/feature-showcase"
import { CTASection } from "@/components/landing/cta-section"
import { useState } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/components/wallet/wallet-provider"

export default function LandingPage() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [loggingIn, setLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [jwt, setJwt] = useState(typeof window !== "undefined" ? localStorage.getItem("jwt") : null)
  const { isConnected, address, connect, disconnect } = useWallet()

  const handleLogin = async () => {
    setLoggingIn(true)
    setLoginError("")
    try {
      if (!isConnected) {
        await connect()
      }
      // @ts-ignore
      const wallet = window.aptos
      if (!wallet) throw new Error("Aptos wallet not found")
      const msg = "Login to ValidateX"
      const res = await wallet.signMessage({ message: msg })
      if (!res || !res.signature || !res.address) throw new Error("Signature failed")
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aptosAddress: res.address, signature: res.signature })
      })
      if (!resp.ok) {
        const err = await resp.json()
        setLoginError(err.error || "Login failed")
        setLoggingIn(false)
        return
      }
      const data = await resp.json()
      localStorage.setItem("jwt", data.token)
      setJwt(data.token)
      setLoginOpen(false)
    } catch (e) {
      let errMsg = "Login failed"
      function isError(obj: unknown): obj is Error {
        return !!obj && typeof obj === "object" && "message" in obj && typeof (obj as any).message === "string"
      }
      if (isError(e)) {
        errMsg = e.message
      } else if (typeof e === "string") {
        errMsg = e
      }
      setLoginError(errMsg)
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("jwt")
    setJwt(null)
    disconnect()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen particle-bg"
    >
      <div className="absolute top-4 right-4 z-50">
        {jwt ? (
          <Button variant="outline" className="text-[#00F0FF] border-[#00F0FF]/50" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <Button variant="outline" className="text-[#00F0FF] border-[#00F0FF]/50" onClick={() => setLoginOpen(true)}>
            Login
          </Button>
        )}
      </div>
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Login to ValidateX</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">Connect your Aptos wallet and sign a message to login.</p>
            {!isConnected ? (
              <Button className="w-full bg-gradient-to-r from-[#00F0FF] to-[#8B5CF6]" onClick={connect}>
                Connect Wallet
              </Button>
            ) : (
              <Button className="w-full bg-gradient-to-r from-[#00F0FF] to-[#8B5CF6]" onClick={handleLogin} disabled={loggingIn}>
                {loggingIn ? "Signing..." : "Sign Message & Login"}
              </Button>
            )}
            {loginError && <div className="text-red-500 text-sm">{loginError}</div>}
          </div>
          <DialogFooter>
            <Button variant="ghost" className="w-full" onClick={() => setLoginOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <HeroSection />
      <ValidationJourney />
      <FeatureShowcase />
      <CTASection />
    </motion.div>
  )
}
