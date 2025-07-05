"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { FloatingCubes } from "@/components/animations/floating-cubes"
import { KineticTypography } from "@/components/animations/kinetic-typography"
import { WalletConnector } from "@/components/wallet/wallet-connector"
import { ArrowRight, Zap, TrendingUp } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <FloatingCubes />

      <div className="container mx-auto px-4 z-10">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-center max-w-4xl mx-auto"
        >
          <KineticTypography
            text="Validate Your Startup"
            className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-[#00F0FF] to-[#8B5CF6] bg-clip-text text-transparent"
          />

          <KineticTypography
            text="Before You Build"
            className="text-4xl md:text-6xl font-bold mb-8 text-white"
            delay={0.5}
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto"
          >
            Blockchain-powered validation platform where founders test ideas and investors back winners before
            development begins.
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <WalletConnector />

            <Button
              size="lg"
              variant="outline"
              className="glass-card border-[#00F0FF]/50 text-[#00F0FF] hover:bg-[#00F0FF]/10 group bg-transparent"
            >
              Explore Platform
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex justify-center gap-8 mt-16"
          >
            <div className="glass-card p-4 text-center">
              <Zap className="h-8 w-8 text-[#00F0FF] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">1000+</div>
              <div className="text-sm text-gray-400">Ideas Validated</div>
            </div>

            <div className="glass-card p-4 text-center">
              <TrendingUp className="h-8 w-8 text-[#10B981] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">$2.5M</div>
              <div className="text-sm text-gray-400">Total Invested</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
